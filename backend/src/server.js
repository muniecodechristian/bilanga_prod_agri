import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import notificationRoutes from "./routes/notification.route.js";
import recolteRoutes from "./routes/recolte.route.js";
import chatIaRoutes from "./routes/agriChat.route.js";
import videoRoutes from "./routes/video.route.js";

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { arcjetMiddleware } from "./middleware/arcjet.middleware.js";

const app = express();
const PORT = ENV.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(arcjetMiddleware);

app.get("/", (req, res) => res.send("Hello from server"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/recoltes", recolteRoutes);
app.use("/api/chatIa", chatIaRoutes);
app.use("/api/videos", videoRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

const startServer = async () => {
  try {
    await connectDB();

    // listen for local development
    if (ENV.NODE_ENV !== "production") {
      app.listen(PORT, () => console.log("Server is up and running on PORT:", PORT));
    }
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// export for vercel
export default app;
