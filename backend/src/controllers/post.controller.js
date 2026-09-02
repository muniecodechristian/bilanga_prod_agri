import asyncHandler from "express-async-handler";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";
import Comment from "../models/comment.model.js";

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });

  res.status(200).json({ posts });
});

export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId)
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });

  if (!post) return res.status(404).json({ error: "Post introuvable" });

  res.status(200).json({ post });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });

  res.status(200).json({ posts });
});

export const createPost = asyncHandler(async (req, res) => {
  const user = req.user;
  const { content } = req.body;
  const imageFile = req.file;

  if (!content && !imageFile) {
    return res.status(400).json({ error: "Le post doit contenir du texte ou une image" });
  }

  let imageUrl = "";

  // upload image to Cloudinary if provided
  if (imageFile) {
    try {
      const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;

      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "social_media_posts",
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });
      imageUrl = uploadResponse.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(400).json({ error: "Échec de l'upload de l'image" });
    }
  }

  const post = await Post.create({
    user: user._id,
    content: content || "",
    image: imageUrl,
  });

  res.status(201).json({ post });
});

export const likePost = asyncHandler(async (req, res) => {
  const user = req.user;
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ error: "Post introuvable" });

  const isLiked = post.likes.includes(user._id);

  if (isLiked) {
    // unlike
    await Post.findByIdAndUpdate(postId, { $pull: { likes: user._id } });
  } else {
    // like
    await Post.findByIdAndUpdate(postId, { $push: { likes: user._id } });

    // notification si ce n'est pas son propre post
    if (post.user.toString() !== user._id.toString()) {
      await Notification.create({
        from: user._id,
        to: post.user,
        type: "like",
        post: postId,
      });
    }
  }

  res.status(200).json({
    message: isLiked ? "Like retiré" : "Post liké",
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const user = req.user;
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ error: "Post introuvable" });

  if (post.user.toString() !== user._id.toString()) {
    return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres posts" });
  }

  // supprimer tous les commentaires du post
  await Comment.deleteMany({ post: postId });

  // supprimer le post
  await Post.findByIdAndDelete(postId);

  res.status(200).json({ message: "Post supprimé" });
});
