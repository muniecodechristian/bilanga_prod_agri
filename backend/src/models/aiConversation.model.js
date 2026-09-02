import mongoose from "mongoose";

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

const aiConversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxLength: 100,
      default: "Nouvelle discussion agricole",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    // Index TTL : MongoDB détruira automatiquement le document quand Date.now() atteint expireAt
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + THIRTY_DAYS_IN_MS),
      index: { expires: 0 }, // Le document expire exactement à la date spécifiée dans expireAt
    },
  },
  { timestamps: true }
);

const AiConversation = mongoose.model("AiConversation", aiConversationSchema);

export default AiConversation;
