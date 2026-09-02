import { useState } from 'react';
import { useApiClient, agriApi } from '../utils/api';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export const useAgriChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: 'Bonjour ! Je suis AgriBilanga, ton conseiller agricole expert. Comment puis-je t\'aider avec tes cultures aujourd\'hui ? 🌱',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const api = useApiClient();

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Préparer l'historique pour l'API (exclure le message de bienvenue pour économiser des tokens si on veut, mais ici on envoie tout l'historique propre)
      const apiMessages = messages
        .filter(m => m.id !== 'welcome-msg')
        .map(m => ({ role: m.role, content: m.content }));
      
      const payload = {
        messages: apiMessages,
        prompt: userMessage.content // On passe le nouveau message via prompt pour la compatibilité
      };

      const res = await agriApi.chat(api, payload);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.msg || "Je n'ai pas de réponse à formuler pour le moment.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('AgriChat Error:', err);
      const errorMessage = err.response?.data?.msg || 'Une erreur est survenue lors de la communication avec le conseiller IA.';
      setError(errorMessage);
      
      // Ajouter un message d'erreur visible dans le chat
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `❌ ${errorMessage}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: 'Bonjour ! Je suis AgriBilanga, ton conseiller agricole expert. Comment puis-je t\'aider avec tes cultures aujourd\'hui ? 🌱',
        timestamp: new Date(),
      }
    ]);
    setError(null);
  };

  return {
    messages,
    sendMessage,
    isLoading,
    error,
    clearChat
  };
};
