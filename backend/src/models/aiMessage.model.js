import mongoose from "mongoose";

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

const aiMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AiConversation",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    // Index TTL : MongoDB supprimera automatiquement ce message au bout de 30 jours
    expireAt: {
      type: Date,
      default: () => new Date(Date.now() + THIRTY_DAYS_IN_MS),
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

const AiMessage = mongoose.model("AiMessage", aiMessageSchema);

export default AiMessage;
