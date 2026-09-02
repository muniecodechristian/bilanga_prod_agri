import asyncHandler from "express-async-handler";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

export const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture");

  res.status(200).json({ comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const user = req.user;
  const { postId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Le contenu du commentaire est requis" });
  }

  const post = await Post.findById(postId);
  if (!post) return res.status(404).json({ error: "Post introuvable" });

  const comment = await Comment.create({
    user: user._id,
    post: postId,
    content,
  });

  // lier le commentaire au post
  await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } });

  // notification si ce n'est pas son propre post
  if (post.user.toString() !== user._id.toString()) {
    await Notification.create({
      from: user._id,
      to: post.user,
      type: "comment",
      post: postId,
      comment: comment._id,
    });
  }

  res.status(201).json({ comment });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const user = req.user;
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) return res.status(404).json({ error: "Commentaire introuvable" });

  if (comment.user.toString() !== user._id.toString()) {
    return res.status(403).json({ error: "Vous ne pouvez supprimer que vos propres commentaires" });
  }

  // supprimer le lien du commentaire dans le post
  await Post.findByIdAndUpdate(comment.post, { $pull: { comments: commentId } });

  // supprimer le commentaire
  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({ message: "Commentaire supprimé" });
});
