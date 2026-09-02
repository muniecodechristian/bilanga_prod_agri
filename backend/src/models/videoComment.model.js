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

export default VideoComment;
