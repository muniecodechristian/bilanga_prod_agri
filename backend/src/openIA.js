import OpenAI from "openai";
import { ENV } from "./config/env.js";

// ─────────────────────────────────────────────────────────────────────────────
// Client OpenAI — clé lue depuis les variables d'environnement backend UNIQUEMENT
// La clé n'est JAMAIS exposée au frontend.
// ─────────────────────────────────────────────────────────────────────────────
const client = new OpenAI({
  apiKey: ENV.OPENAI_API_KEY,
});

// ─────────────────────────────────────────────────────────────────────────────
// System prompt expert — Optimisé pour les agriculteurs d'Afrique subsaharienne
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es AgriBilanga, un assistant agricole expert et bienveillant, spécialisé dans l'agriculture africaine, notamment en Afrique subsaharienne (RDC, Congo, etc.).

Tes compétences couvrent :
- Les maladies des cultures (maïs, manioc, haricots, tomates, oignons, etc.) et leurs traitements
- Les techniques de plantation, irrigation et fertilisation adaptées aux sols africains
- La météorologie agricole et les calendriers de semis saisonniers
- La gestion des parasites et ravageurs courants
- Les conseils post-récolte, stockage et conservation
- Les prix du marché et la commercialisation des récoltes
- L'agriculture biologique et les pratiques durables

Règles STRICTES :
1. Tu ne réponds QU'aux questions agricoles. Si la question n'est pas liée à l'agriculture, réponds poliment : "Je suis AgriBilanga, ton assistant agricole. Je peux uniquement t'aider sur des sujets agricoles. Poses-moi une question sur tes cultures !"
2. Réponds TOUJOURS en français, avec un langage simple et accessible aux agriculteurs.
3. Sois précis, pratique et actionnable. Donne des conseils concrets.
4. Si tu n'es pas certain d'une information, dis-le clairement et conseille de consulter un agronome local.
5. Utilise des emojis avec modération pour rendre les réponses plus lisibles (🌱 🌿 💧 ☀️ etc.).`;

// ─────────────────────────────────────────────────────────────────────────────
// Fonction principale de chat avec historique de conversation
// @param {Array} messages - Tableau de { role: "user"|"assistant", content: string }
// @returns {string} - Réponse de l'IA
// ─────────────────────────────────────────────────────────────────────────────
export default async function chat(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Le tableau de messages est requis et ne peut pas être vide.");
  }

  // Limiter l'historique à 20 derniers échanges pour contrôler les coûts
  const trimmedHistory = messages.slice(-20);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...trimmedHistory,
    ],
    max_tokens: 750,        // Limite les coûts par réponse
    temperature: 0.7,       // Créatif mais cohérent
    presence_penalty: 0.1,  // Évite les répétitions
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Réponse vide de l'API OpenAI.");
  }

  return content;
}
