import OpenAI from "openai";
import { ENV } from "./config/env.js";

const client = new OpenAI({
  apiKey: ENV.OPENAI_API_KEY,
});

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
// Mode Standard (Non-streaming)
// ─────────────────────────────────────────────────────────────────────────────
export default async function chat(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Le tableau de messages est requis et ne peut pas être vide.");
  }

  const trimmedHistory = messages.slice(-20);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...trimmedHistory,
    ],
    max_tokens: 750,
    temperature: 0.7,
    presence_penalty: 0.1,
  });

  const content = response.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Réponse vide de l'API OpenAI.");
  }

  return content;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mode Streaming SSE (Server-Sent Events) - Jeton par jeton en direct
// ─────────────────────────────────────────────────────────────────────────────
export async function chatStream(messages, onChunk) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Le tableau de messages est requis et ne peut pas être vide.");
  }

  const trimmedHistory = messages.slice(-20);

  const stream = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...trimmedHistory,
    ],
    max_tokens: 750,
    temperature: 0.7,
    presence_penalty: 0.1,
    stream: true,
  });

  let fullText = "";

  for await (const chunk of stream) {
    const textChunk = chunk.choices[0]?.delta?.content || "";
    if (textChunk) {
      fullText += textChunk;
      if (onChunk) {
        onChunk(textChunk);
      }
    }
  }

  return fullText;
}
