import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApiClient, agriApi, API_BASE_URL } from '../utils/api';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export type Conversation = {
  _id: string;
  title: string;
  lastMessageAt: string;
  expireAt: string;
};

const TOKEN_KEY = 'auth_token';

export const useAgriChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: "Bonjour ! Je suis AgriBilanga, ton conseiller agricole expert. Comment puis-je t'aider avec tes cultures aujourd'hui ? 🌱",
      timestamp: new Date(),
    },
  ]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApiClient();

  // 1. Charger la liste des conversations actives (conservées 30 jours)
  const fetchConversations = useCallback(async () => {
    try {
      const res = await agriApi.getConversations(api);
      if (res.data?.success) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  }, [api]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Charger les messages d'une conversation sélectionnée
  const selectConversation = async (conversationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await agriApi.getMessages(api, conversationId);
      if (res.data?.success) {
        setActiveConversationId(conversationId);
        const fetchedMsgs: Message[] = (res.data.messages || []).map((m: any) => ({
          id: m._id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.createdAt),
        }));
        setMessages(fetchedMsgs);
      }
    } catch (err) {
      console.error('Error loading conversation messages:', err);
      setError('Impossible de charger cette discussion.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Commencer une nouvelle discussion
  const startNewChat = () => {
    setActiveConversationId(null);
    setMessages([
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: "Bonjour ! Je suis AgriBilanga, ton conseiller agricole expert. Comment puis-je t'aider avec tes cultures aujourd'hui ? 🌱",
        timestamp: new Date(),
      },
    ]);
    setError(null);
  };

  // 4. Supprimer une conversation
  const deleteConversation = async (conversationId: string) => {
    try {
      await agriApi.deleteConversation(api, conversationId);
      setConversations((prev) => prev.filter((c) => c._id !== conversationId));
      if (activeConversationId === conversationId) {
        startNewChat();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  // 5. Envoyer un message en mode Streaming SSE (jeton par jeton en direct)
  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setIsLoading(true);
    setError(null);

    const assistantMsgId = (Date.now() + 1).toString();

    // Message temporaire de l'assistant qui se remplira en direct
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      },
    ]);

    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      const response = await fetch(`${API_BASE_URL}/chatIa/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          conversationId: activeConversationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || 'Erreur serveur');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('Le flux de réponse est indisponible sur cette plateforme.');
      }

      let accumulatedResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();

            if (dataStr === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);

              // 1. Mise à jour de l'ID de conversation au premier événement
              if (parsed.conversationId) {
                setActiveConversationId(parsed.conversationId);
                fetchConversations();
              }

              // 2. Fragment de texte IA reçu (live typing effect)
              if (parsed.chunk) {
                accumulatedResponse += parsed.chunk;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsgId
                      ? { ...msg, content: accumulatedResponse }
                      : msg
                  )
                );
              }

              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Si le JSON est partiel à cause de la découpe des paquets
            }
          }
        }
      }
    } catch (err: any) {
      console.error('AgriChat Streaming Error:', err);
      const errorMessage = err.message || 'Une erreur est survenue lors du streaming.';
      setError(errorMessage);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, content: ` ${errorMessage}` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      fetchConversations();
    }
  };

  return {
    messages,
    sendMessage,
    conversations,
    activeConversationId,
    selectConversation,
    startNewChat,
    deleteConversation,
    isLoading,
    isStreaming,
    error,
  };
};
