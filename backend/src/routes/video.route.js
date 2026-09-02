import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  uploadVideo,
  getFeed,
  toggleLike,
  addComment,
  getComments
} from "../controllers/video.controller.js";
import multer from "multer";

const router = express.Router();
// Multer in-memory storage configuration for handling file uploads (optional middleware layer before Cloudinary)
const upload = multer({ storage: multer.memoryStorage() });

// Optional auth middleware for getFeed so logged-out users can still watch videos, but logged-in users get personal state (hasLiked)
const optionalAuth = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
       return protectRoute(req, res, next);
    }
    next();
};

router.get("/feed", optionalAuth, getFeed);
router.post("/", protectRoute, upload.single("video"), uploadVideo);

router.post("/:id/like", protectRoute, toggleLike);
router.post("/:id/comment", protectRoute, addComment);
router.get("/:id/comments", getComments);

export default router;
