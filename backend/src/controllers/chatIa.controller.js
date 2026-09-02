import chat from "../openIA.js";

// In-memory rate limiter (for scaling, use Redis in the future)
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per user per hour

export const chatWithIa = async (req, res) => {
  const { messages, prompt } = req.body;
  const userId = req.user?._id?.toString();

  if (!userId) {
     return res.status(401).json({ success: false, msg: "Non autorisé." });
  }

  // 1. Rate Limiting Check
  const now = Date.now();
  if (rateLimitCache.has(userId)) {
    const userData = rateLimitCache.get(userId);
    // Filter out expired timestamps
    const validTimestamps = userData.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
    
    if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        success: false,
        msg: "Limite de requêtes atteinte. Veuillez réessayer plus tard (Max 30 questions par heure).",
      });
    }
    
    validTimestamps.push(now);
    rateLimitCache.set(userId, validTimestamps);
  } else {
    rateLimitCache.set(userId, [now]);
  }

  // 2. Format Messages
  let conversationHistory = [];
  
  if (messages && Array.isArray(messages)) {
      conversationHistory = [...messages];
  }

  if (prompt) {
      conversationHistory.push({ role: "user", content: prompt });
  }
  
  if (conversationHistory.length === 0) {
    return res.status(400).json({
      success: false,
      msg: "Le prompt ou un historique de messages est obligatoire.",
    });
  }

  // 3. Validation & Sanitization (preventing massive inputs)
  const isValid = conversationHistory.every(m => m.role && m.content && typeof m.content === 'string' && m.content.length < 2000);
  if (!isValid) {
      return res.status(400).json({
          success: false,
          msg: "Format de message invalide ou message trop long (max 2000 caractères).",
      });
  }

  try {
    console.log(`[AgriBilanga AI] User ${userId} requested chat. History length: ${conversationHistory.length}`);
    const Ia_res = await chat(conversationHistory);

    return res.status(200).json({
      success: true,
      msg: Ia_res,
    });
  } catch (error) {
    console.error(`[AgriBilanga AI Error] User ${userId}:`, error.message || error);

    return res.status(500).json({
      success: false,
      msg: "Le conseiller agricole rencontre un problème technique. Veuillez réessayer.",
    });
  }
};
