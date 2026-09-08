import mongoose from "mongoose";

const videoLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
  },
  { timestamps: true }
);

// Empêche un utilisateur de liker deux fois la même vidéo
videoLikeSchema.index({ user: 1, video: 1 }, { unique: true });

const VideoLike = mongoose.model("VideoLike", videoLikeSchema);

// Add TTL index to automatically delete video likes after 14 days
videoLikeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1209600 });

export default VideoLike;
