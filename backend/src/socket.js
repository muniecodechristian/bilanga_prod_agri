import { Server } from "socket.io";
import { ENV } from "./config/env.js";
import jwt from "jsonwebtoken";
import User from "./models/user.model.js";
import Message from "./models/message.model.js";
import Conversation from "./models/conversation.model.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // In production, this should be restricted to the frontend URL
      methods: ["GET", "POST"],
    },
  });

  // Authentication middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }
      
      const decoded = jwt.verify(token, ENV.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user._id}`);
    
    // Join a room unique to the user to receive targeted messages
    socket.join(socket.user._id.toString());

    // Join a specific conversation room if needed (optional, joining user room is usually enough for 1-on-1)
    socket.on("join_conversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`User ${socket.user._id} joined conversation ${conversationId}`);
    });

    // Handle typing events
    socket.on("typing", (data) => {
      const { targetUserId, conversationId } = data;
      // Emit to the specific user that this user is typing
      io.to(targetUserId).emit("user_typing", {
        conversationId,
        userId: socket.user._id,
      });
    });

    socket.on("stop_typing", (data) => {
      const { targetUserId, conversationId } = data;
      io.to(targetUserId).emit("user_stopped_typing", {
        conversationId,
        userId: socket.user._id,
      });
    });

    // Handle marking messages as read
    socket.on("mark_messages_read", async (data) => {
      const { conversationId, targetUserId } = data;
      try {
        // Update database
        await Message.updateMany(
          { conversationId, sender: targetUserId, isRead: false },
          { $set: { isRead: true } }
        );

        // Notify the sender that their messages were read
        io.to(targetUserId).emit("messages_read", {
          conversationId,
          readerId: socket.user._id,
        });
      } catch (error) {
        console.error("Error marking messages as read via socket:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user._id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
