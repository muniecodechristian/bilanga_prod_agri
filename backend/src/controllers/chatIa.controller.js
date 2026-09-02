import chat, { chatStream } from "../openIA.js";
import AiConversation from "../models/aiConversation.model.js";
import AiMessage from "../models/aiMessage.model.js";

// In-memory rate limiter (30 requêtes / heure / utilisateur)
const rateLimitCache = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 30;
const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

const checkRateLimit = (userId) => {
  const now = Date.now();
  if (rateLimitCache.has(userId)) {
    const userData = rateLimitCache.get(userId);
    const validTimestamps = userData.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

    if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
      return false;
    }

    validTimestamps.push(now);
    rateLimitCache.set(userId, validTimestamps);
  } else {
    rateLimitCache.set(userId, [now]);
  }
  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Streaming Chat avec Server-Sent Events (SSE) & Persistence TTL (30 jours)
// ─────────────────────────────────────────────────────────────────────────────
export const streamChatWithIa = async (req, res) => {
  const { prompt, conversationId } = req.body;
  const userId = req.user?._id?.toString();

  if (!userId) {
    return res.status(401).json({ success: false, msg: "Non autorisé." });
  }

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ success: false, msg: "Le prompt est obligatoire." });
  }

  if (prompt.length > 2000) {
    return res.status(400).json({ success: false, msg: "Message trop long (max 2000 caractères)." });
  }

  if (!checkRateLimit(userId)) {
    return res.status(429).json({
      success: false,
      msg: "Limite de requêtes atteinte (Max 30 questions par heure). Veuillez réessayer plus tard.",
    });
  }

  try {
    let conversation;

    // 1. Trouver ou créer la conversation
    if (conversationId) {
      conversation = await AiConversation.findOne({ _id: conversationId, user: userId });
    }

    if (!conversation) {
      // Titre généré à partir des 40 premiers caractères de la question
      const title = prompt.trim().substring(0, 40) + (prompt.length > 40 ? "..." : "");
      conversation = new AiConversation({
        user: userId,
        title,
        expireAt: new Date(Date.now() + THIRTY_DAYS_IN_MS),
      });
      await conversation.save();
    } else {
      // Renouveler la date d'expiration TTL (+30 jours à chaque message)
      conversation.lastMessageAt = new Date();
      conversation.expireAt = new Date(Date.now() + THIRTY_DAYS_IN_MS);
      await conversation.save();
    }

    // 2. Enregistrer le message de l'utilisateur
    const userMsg = new AiMessage({
      conversation: conversation._id,
      user: userId,
      role: "user",
      content: prompt.trim(),
      expireAt: new Date(Date.now() + THIRTY_DAYS_IN_MS),
    });
    await userMsg.save();

    // 3. Récupérer l'historique récent de la conversation (max 10 derniers messages)
    const history = await AiMessage.find({ conversation: conversation._id })
      .sort({ createdAt: 1 })
      .limit(20);

    const formattedMessages = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 4. Configurer les en-têtes HTTP SSE (Server-Sent Events)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Envoyer l'ID de conversation immédiatement au client
    res.write(`data: ${JSON.stringify({ conversationId: conversation._id, title: conversation.title })}\n\n`);

    // 5. Exécuter le streaming OpenAI jeton par jeton
    const fullAssistantResponse = await chatStream(formattedMessages, (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    // 6. Enregistrer la réponse complète de l'assistant dans MongoDB
    const assistantMsg = new AiMessage({
      conversation: conversation._id,
      user: userId,
      role: "assistant",
      content: fullAssistantResponse,
      expireAt: new Date(Date.now() + THIRTY_DAYS_IN_MS),
    });
    await assistantMsg.save();

    // Signaler la fin du flux
    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error(`[AgriBilanga AI Stream Error] User ${userId}:`, error.message || error);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        msg: "Erreur lors de la génération de la réponse IA.",
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Erreur de génération." })}\n\n`);
      res.end();
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Obtenir la liste des conversations actives de l'utilisateur
// ─────────────────────────────────────────────────────────────────────────────
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await AiConversation.find({ user: userId })
      .sort({ lastMessageAt: -1 })
      .limit(50);

    return res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error("Error in getConversations:", error);
    return res.status(500).json({ success: false, msg: "Erreur serveur" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Obtenir l'historique des messages d'une conversation
// ─────────────────────────────────────────────────────────────────────────────
export const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await AiConversation.findOne({ _id: conversationId, user: userId });
    if (!conversation) {
      return res.status(404).json({ success: false, msg: "Conversation introuvable" });
    }

    const messages = await AiMessage.find({ conversation: conversationId })
      .sort({ createdAt: 1 });

    return res.status(200).json({ success: true, conversation, messages });
  } catch (error) {
    console.error("Error in getConversationMessages:", error);
    return res.status(500).json({ success: false, msg: "Erreur serveur" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Supprimer une conversation
// ─────────────────────────────────────────────────────────────────────────────
export const deleteConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    await AiConversation.deleteOne({ _id: conversationId, user: userId });
    await AiMessage.deleteMany({ conversation: conversationId, user: userId });

    return res.status(200).json({ success: true, msg: "Conversation supprimée" });
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    return res.status(500).json({ success: false, msg: "Erreur serveur" });
  }
};
