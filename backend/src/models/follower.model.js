import mongoose from "mongoose";

const followerSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate follow relationships
followerSchema.index({ follower: 1, following: 1 }, { unique: true });
// Fast lookup for finding who follows a user
followerSchema.index({ following: 1 });

const Follower = mongoose.model("Follower", followerSchema);

export default Follower;
