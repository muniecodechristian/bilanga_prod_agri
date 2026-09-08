import mongoose from "mongoose";

const videoCommentSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true,
      maxLength: 500,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const VideoComment = mongoose.model("VideoComment", videoCommentSchema);

// Add TTL index to automatically delete video comments after 14 days
videoCommentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1209600 });

export default VideoComment;
