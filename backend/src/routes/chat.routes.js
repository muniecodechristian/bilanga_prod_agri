import express from "express";
import {
  createOrGetConversation,
  getUserConversations,
  getMessages,
  sendMessage,
} from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.route("/")
  .post(protectRoute, createOrGetConversation)
  .get(protectRoute, getUserConversations);

router.route("/:conversationId/messages")
  .get(protectRoute, getMessages)
  .post(protectRoute, upload.single("image"), sendMessage);

export default router;
