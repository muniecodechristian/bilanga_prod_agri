import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

import {
    createRecoltePost,
    deleteRecoltePost,
    getMyRecoltePost,
    getRecoltePosts,
} from "../controllers/recolte.controller.js";


const router = express.Router();

// public routes
router.get("/", getRecoltePosts);
router.get("/:postId", getMyRecoltePost);


// protected proteced
router.post("/", protectRoute,  upload.array("images", 5), createRecoltePost);

router.delete("/:postId", protectRoute, deleteRecoltePost);

export default router;

