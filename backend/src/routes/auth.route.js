import express from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Routes publiques
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Route protégée
router.get("/me", protectRoute, getMe);

export default router;
