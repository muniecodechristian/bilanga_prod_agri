import express from "express";
import {
  followUser,
  getCurrentUser,
  getUserProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Route publique
router.get("/profile/:username", getUserProfile);

// Routes protégées
router.get("/me", protectRoute, getCurrentUser);
router.put("/profile", protectRoute, updateProfile);
router.post("/follow/:targetUserId", protectRoute, followUser);

export default router;
