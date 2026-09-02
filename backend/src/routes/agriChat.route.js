import express from 'express';
import { chatWithIa } from '../controllers/chatIa.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route POST /api/chatIa
 * @desc Communicate with the AI agricultural advisor
 * @access Protected (Requires JWT)
 * @body { messages: [{ role: "user" | "assistant", content: "..." }], prompt?: "..." }
 */
router.post('/', protectRoute, chatWithIa);

export default router;