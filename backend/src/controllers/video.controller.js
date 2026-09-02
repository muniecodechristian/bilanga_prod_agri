import Video from "../models/video.model.js";
import VideoLike from "../models/videoLike.model.js";
import VideoComment from "../models/videoComment.model.js";
import cloudinary from "../config/cloudinary.js";

// Upload a new video
export const uploadVideo = async (req, res) => {
  try {
    const { caption } = req.body;
    let videoUrl = "";

    if (req.file) {
      // Pour une vraie architecture de prod, on uploaderait d'abord puis on récupérerait l'URL.
      // Cloudinary gère l'upload de vidéos avec resource_type: "video"
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: "video", folder: "agribilanga_videos" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }).end(req.file.buffer);
      });
      videoUrl = result.secure_url;
    } else if (req.body.videoUrl) {
       videoUrl = req.body.videoUrl;
    } else {
        return res.status(400).json({ msg: "Fichier vidéo requis." });
    }

    const newVideo = new Video({
      user: req.user._id,
      videoUrl,
      caption: caption || "",
    });

    await newVideo.save();

    // Populate user details for immediate return
    await newVideo.populate("user", "name username profilePicture");

    res.status(201).json(newVideo);
  } catch (error) {
    console.error("Error in uploadVideo:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get feed (infinite scroll)
export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await Video.find()
      .populate("user", "name username profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // If a user is logged in, attach hasLiked property
    if (req.user) {
       const videoIds = videos.map(v => v._id);
       const likes = await VideoLike.find({ user: req.user._id, video: { $in: videoIds } });
       const likedVideoIds = new Set(likes.map(l => l.video.toString()));
       
       const videosWithLikeStatus = videos.map(v => {
           const videoObj = v.toObject();
           videoObj.hasLiked = likedVideoIds.has(videoObj._id.toString());
           return videoObj;
       });
       return res.status(200).json(videosWithLikeStatus);
    }

    res.status(200).json(videos);
  } catch (error) {
    console.error("Error in getFeed:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Toggle Like
export const toggleLike = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user._id;

    const existingLike = await VideoLike.findOne({ user: userId, video: videoId });

    if (existingLike) {
      // Unlike
      await VideoLike.findByIdAndDelete(existingLike._id);
      await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: -1 } });
      res.status(200).json({ msg: "Video unliked", hasLiked: false });
    } else {
      // Like
      const newLike = new VideoLike({ user: userId, video: videoId });
      await newLike.save();
      await Video.findByIdAndUpdate(videoId, { $inc: { likesCount: 1 } });
      res.status(200).json({ msg: "Video liked", hasLiked: true });
    }
  } catch (error) {
    console.error("Error in toggleLike:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Add Comment
export const addComment = async (req, res) => {
  try {
    const videoId = req.params.id;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ msg: "Le contenu est requis" });
    }

    const newComment = new VideoComment({
      user: req.user._id,
      video: videoId,
      content,
    });

    await newComment.save();
    
    // Atomically increment comment count
    await Video.findByIdAndUpdate(videoId, { $inc: { commentsCount: 1 } });

    await newComment.populate("user", "name username profilePicture");

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error in addComment:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get Comments for a video
export const getComments = async (req, res) => {
  try {
    const videoId = req.params.id;
    
    const comments = await VideoComment.find({ video: videoId })
      .populate("user", "name username profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error("Error in getComments:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
