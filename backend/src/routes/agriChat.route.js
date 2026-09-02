import express from "express";
import {
  streamChatWithIa,
  getConversations,
  getConversationMessages,
  deleteConversation,
} from "../controllers/chatIa.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route POST /api/chatIa/stream
 * @desc Stream response token-by-token from AI Advisor (Server-Sent Events)
 * @access Protected (Requires JWT)
 */
router.post("/stream", protectRoute, streamChatWithIa);

/**
 * @route GET /api/chatIa/conversations
 * @desc Get all active AI conversations for the logged-in user (expires in 30 days)
 * @access Protected
 */
router.get("/conversations", protectRoute, getConversations);

/**
 * @route GET /api/chatIa/conversations/:conversationId/messages
 * @desc Get all messages for a specific conversation
 * @access Protected
 */
router.get("/conversations/:conversationId/messages", protectRoute, getConversationMessages);

/**
 * @route DELETE /api/chatIa/conversations/:conversationId
 * @desc Delete an AI conversation and its messages
 * @access Protected
 */
router.delete("/conversations/:conversationId", protectRoute, deleteConversation);

export default router;