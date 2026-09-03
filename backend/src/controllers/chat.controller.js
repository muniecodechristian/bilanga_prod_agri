import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import Follower from "../models/follower.model.js";
import cloudinary from "../config/cloudinary.js";
import { getIO } from "../socket.js";

// @desc    Create or get a conversation
// @route   POST /api/chat
// @access  Private
export const createOrGetConversation = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const initiatorId = req.user._id;

    if (!targetUserId) {
      return res.status(400).json({ message: "targetUserId is required" });
    }

    if (initiatorId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: "You cannot chat with yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const initiatorUser = await User.findById(initiatorId);

    // Ensure one is a client and one is a proprietaire
    const isInitiatorClient = initiatorUser.role === "client";
    const isTargetProprietaire = targetUser.role === "proprietaire";
    
    const isInitiatorProprietaire = initiatorUser.role === "proprietaire";
    const isTargetClient = targetUser.role === "client";

    if (!(isInitiatorClient && isTargetProprietaire) && !(isInitiatorProprietaire && isTargetClient)) {
      return res.status(403).json({ message: "Chat must be between a client and a proprietaire" });
    }

    // Check if client follows the proprietaire
    let followerId = isInitiatorClient ? initiatorId : targetUserId;
    let followingId = isInitiatorProprietaire ? initiatorId : targetUserId;

    const followRelationship = await Follower.findOne({ follower: followerId, following: followingId });
    if (!followRelationship) {
      return res.status(403).json({ message: "Client must follow the proprietaire to chat" });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [initiatorId, targetUserId] },
    });

    if (conversation) {
      return res.status(200).json(conversation);
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [initiatorId, targetUserId],
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error("Error in createOrGetConversation:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user's conversations
// @route   GET /api/chat
// @access  Private
export const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate("participants", "firstName lastName username profilePicture role")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getUserConversations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/:conversationId/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify user is part of the conversation
    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to view these messages" });
    }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    res.status(200).json({
      success: true,
      count: messages.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: messages,
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Send a message
// @route   POST /api/chat/:conversationId/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { text } = req.body;
    const senderId = req.user._id;
    const imageFile = req.file;

    if (!text && !imageFile) {
      return res.status(400).json({ message: "Message text or image is required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Verify user is part of the conversation
    if (!conversation.participants.includes(senderId)) {
      return res.status(403).json({ message: "Not authorized to send messages in this conversation" });
    }

    let imageUrl = "";
    if (imageFile) {
      try {
        const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;
        const uploadResponse = await cloudinary.uploader.upload(base64Image, {
          folder: "chat_images",
          resource_type: "image",
          transformation: [
            { width: 800, height: 600, crop: "limit" },
            { quality: "auto" },
            { format: "auto" },
          ],
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return res.status(400).json({ message: "Failed to upload image" });
      }
    }

    const message = await Message.create({
      conversationId,
      sender: senderId,
      text: text || "",
      imageUrl,
    });

    // Update last message in conversation
    conversation.lastMessage = message._id;
    await conversation.save();

    // Broadcast message via Socket.io
    const io = getIO();
    const receiverId = conversation.participants.find(
      (p) => p.toString() !== senderId.toString()
    );
    
    if (receiverId) {
      io.to(receiverId.toString()).emit("new_message", message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Server error" });
  }
};
