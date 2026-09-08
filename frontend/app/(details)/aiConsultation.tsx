// aiConsultation.tsx
// Consultation IA directe avec raccourcis par catégorie agricole
// Accès : Réservé aux propriétaires uniquement

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Modal,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAgriChat } from '@/hooks/useAgriChat';
import { useAuthContext } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// ─── Raccourcis Emojis réservés UNIQUEMENT aux fruits/cultures/thèmes ─────────
const CROP_SHORTCUTS = [
  { emoji: '🍅', name: 'Tomate', prompt: 'Donne-moi des conseils pour cultiver et soigner les tomates.' },
  { emoji: '🌽', name: 'Maïs', prompt: 'Quels sont les meilleurs conseils pour cultiver le maïs ?' },
  { emoji: '🥑', name: 'Avocat', prompt: 'Comment bien soigner mes avocatiers et maximiser la récolte ?' },
  { emoji: '🍌', name: 'Banane', prompt: 'Conseils pour protéger mes bananiers des maladies.' },
  { emoji: '🥬', name: 'Légumes', prompt: 'Quelles légumes feuilles pousser selon la saison ?' },
  { emoji: '🌿', name: 'Manioc', prompt: 'Quelle est la meilleure méthode pour cultiver le manioc ?' },
  { emoji: '🫘', name: 'Haricot', prompt: 'Comment cultiver des haricots avec un bon rendement ?' },
  { emoji: '🍠', name: 'Igname', prompt: 'Conseils pour cultiver l\'igname dans un sol argileux.' },
  { emoji: '☁️', name: 'Météo', prompt: 'Comment adapter ma culture aux changements de saison ?' },
  { emoji: '🐛', name: 'Parasites', prompt: 'Comment lutter naturellement contre les insectes et parasites ?' },
];

const QUICK_SUGGESTIONS = [
  "Comment traiter les chenilles sur mon maïs ?",
  "Quelle est la meilleure période pour semer le manioc ?",
  "Comment fabriquer un engrais naturel ?",
  "Mes tomates pourrissent avant de mûrir, que faire ?",
];

export default function AiConsultation() {
  const router = useRouter();
  const { user } = useAuthContext();
  const {
    messages,
    sendMessage,
    conversations,
    activeConversationId,
    selectConversation,
    startNewChat,
    deleteConversation,
    isLoading,
    isStreaming,
  } = useAgriChat();

  const [inputText, setInputText] = useState('');
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // ─── Animations style Gemini ────────────────────────────────────────────────
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  // Animation de rotation continue de l'icône IA
  useEffect(() => {
    if (isStreaming || isLoading) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.25,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      spinValue.setValue(0);
      pulseValue.setValue(1);
    }
  }, [isStreaming, isLoading]);

  // Animation du curseur de frappe Gemini
  useEffect(() => {
    if (isStreaming) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(cursorOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isStreaming]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Guard — réservé aux propriétaires
  if (user?.role !== 'proprietaire') {
    return (
      <SafeAreaView style={styles.guardContainer}>
        <View style={styles.guardIconWrapper}>
          <Ionicons name="lock-closed" size={38} color="#059669" />
        </View>
        <Text style={styles.guardTitle}>Réservé aux agriculteurs</Text>
        <Text style={styles.guardSubtitle}>
          Le conseiller IA est accessible uniquement aux propriétaires de plantations enregistrés.
        </Text>
        <TouchableOpacity style={styles.guardBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.guardBtnText}>Retourner au tableau de bord</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Auto-scroll doux lors de l'arrivée de nouveaux messages
  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isStreaming]);

  const handleSend = (text?: string) => {
    const msg = text || inputText;
    if (msg.trim() && !isStreaming) {
      sendMessage(msg);
      setInputText('');
      Keyboard.dismiss();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isNewConversation = messages.length <= 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── HEADER ERGONOMIQUE ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Animated.View
            style={[
              styles.geminiBadge,
              (isStreaming || isLoading) && { transform: [{ rotate: spin }, { scale: pulseValue }] },
            ]}
          >
            <Ionicons name="sparkles" size={18} color="#059669" />
          </Animated.View>
          <View>
            <Text style={styles.headerTitle}>AgriBilanga IA</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, isStreaming && styles.statusDotActive]} />
              <Text style={styles.headerSubtitle}>
                {isStreaming ? 'Génération en cours...' : 'Disponible'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={startNewChat} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={22} color="#059669" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setHistoryModalVisible(true)} style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="time-outline" size={22} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── ZONE CHAT ───────────────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section d'accueil / Suggestions Gemini */}
          {isNewConversation && !isLoading && (
            <View style={styles.welcomeSection}>
              <View style={styles.heroBox}>
                <View style={styles.heroSparkle}>
                  <Ionicons name="leaf" size={28} color="#059669" />
                </View>
                <Text style={styles.welcomeTitle}>Comment puis-je vous aider aujourd'hui ?</Text>
                <Text style={styles.welcomeSubtitle}>
                  Posez vos questions ou sélectionnez un thème pour démarrer votre diagnostic.
                </Text>
              </View>

              {/* Shortcuts Emojis Rois (Fruits & Cultures uniquement) */}
              <Text style={styles.sectionHeader}>Raccourcis par culture</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.shortcutsScroll}
                contentContainerStyle={{ paddingRight: 16 }}
              >
                {CROP_SHORTCUTS.map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    style={styles.shortcutChip}
                    onPress={() => handleSend(item.prompt)}
                    disabled={isStreaming}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.shortcutEmoji}>{item.emoji}</Text>
                    <Text style={styles.shortcutName}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Suggestions rapides */}
              <Text style={styles.sectionHeader}>Questions courantes</Text>
              <View style={styles.suggestionsGrid}>
                {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.suggestionCard}
                    onPress={() => handleSend(suggestion)}
                    disabled={isStreaming}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="help-circle-outline" size={18} color="#059669" style={{ marginRight: 8 }} />
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Flux des Messages */}
          {messages.map((msg, index) => {
            const isLastAssistant = msg.role === 'assistant' && index === messages.length - 1;
            const isUser = msg.role === 'user';

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isUser ? styles.messageRowUser : styles.messageRowAssistant,
                ]}
              >
                {!isUser && (
                  <View style={styles.assistantAvatar}>
                    <Ionicons name="sparkles" size={14} color="#059669" />
                  </View>
                )}

                <View
                  style={[
                    styles.messageBubble,
                    isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.messageTextUser : styles.messageTextAssistant,
                    ]}
                  >
                    {msg.content}
                    {isStreaming && isLastAssistant && (
                      <Animated.Text style={[styles.geminiCursor, { opacity: cursorOpacity }]}>
                        ❚
                      </Animated.Text>
                    )}
                  </Text>
                  <Text
                    style={[
                      styles.timeText,
                      isUser ? styles.timeTextUser : styles.timeTextAssistant,
                    ]}
                  >
                    {formatTime(msg.timestamp)}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Loader de connexion IA */}
          {isLoading && !isStreaming && (
            <View style={[styles.messageRow, styles.messageRowAssistant]}>
              <View style={styles.assistantAvatar}>
                <Ionicons name="sparkles" size={14} color="#059669" />
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleAssistant, styles.loadingBubble]}>
                <ActivityIndicator size="small" color="#059669" />
                <Text style={styles.loadingText}>Analyse en cours...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ─── BARRE D'ENTRÉE MODERNE ────────────────────────────────────────── */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.input}
              placeholder="Posez une question à votre assistant..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={600}
              editable={!isStreaming}
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!inputText.trim() || isStreaming) && styles.sendBtnDisabled,
              ]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isStreaming}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isStreaming ? "stop" : "arrow-up"}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ─── MODAL HISTORIQUE STYLE SHEET ───────────────────────────────────── */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="chatbubbles-outline" size={22} color="#111827" />
                <Text style={styles.modalTitle}>Historique des conseils</Text>
              </View>
              <TouchableOpacity
                onPress={() => setHistoryModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.newChatModalBtn}
              onPress={() => {
                startNewChat();
                setHistoryModalVisible(false);
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.newChatModalBtnText}>Nouvelle consultation</Text>
            </TouchableOpacity>

            <FlatList
              data={conversations}
              keyExtractor={(item) => item._id}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyHistory}>
                  <Ionicons name="folder-open-outline" size={40} color="#D1D5DB" />
                  <Text style={styles.emptyHistoryText}>Aucune consultation antérieure.</Text>
                </View>
              }
              renderItem={({ item }) => {
                const isActive = item._id === activeConversationId;
                return (
                  <View style={[styles.historyCard, isActive && styles.historyCardActive]}>
                    <TouchableOpacity
                      style={styles.historyCardMain}
                      onPress={() => {
                        selectConversation(item._id);
                        setHistoryModalVisible(false);
                      }}
                    >
                      <Ionicons
                        name="chatbox-text-outline"
                        size={18}
                        color={isActive ? '#059669' : '#6B7280'}
                      />
                      <Text
                        style={[styles.historyTitle, isActive && styles.historyTitleActive]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteConversation(item._id)}
                      style={styles.deleteBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── STYLES ÉLÉGANTS ET HUMAINS ─────────────────────────────────────────────
const styles = StyleSheet.create({
  flex1: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FAFAFA' },

  // Guard Screen
  guardContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  guardIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  guardTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  guardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  guardBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  guardBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },

  // En-tête (Header)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  geminiBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10B981', marginRight: 6 },
  statusDotActive: { backgroundColor: '#F59E0B' },
  headerSubtitle: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  headerActions: { flexDirection: 'row', gap: 8 },

  // Conteneur de Chat
  chatContainer: { flex: 1 },
  chatContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  // Écran d'accueil / Bienvenue
  welcomeSection: { marginBottom: 20 },
  heroBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
  },
  heroSparkle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 6 },
  welcomeSubtitle: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  // Emojis Rois pour Raccourcis Fruits/Cultures
  shortcutsScroll: { marginBottom: 20 },
  shortcutChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shortcutEmoji: { fontSize: 20, marginRight: 8 },
  shortcutName: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // Suggestions
  suggestionsGrid: { gap: 8 },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionText: { color: '#374151', fontSize: 13, fontWeight: '500', flex: 1 },

  // Messages
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
    alignItems: 'flex-end',
  },
  messageRowUser: { alignSelf: 'flex-end' },
  messageRowAssistant: { alignSelf: 'flex-start' },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  messageBubbleUser: {
    backgroundColor: '#059669',
    borderBottomRightRadius: 4,
  },
  messageBubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: { fontSize: 15, lineHeight: 22 },
  messageTextUser: { color: '#FFFFFF' },
  messageTextAssistant: { color: '#1F2937' },
  geminiCursor: { color: '#059669', fontWeight: 'bold', marginLeft: 2 },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  timeTextUser: { color: '#A7F3D0' },
  timeTextAssistant: { color: '#9CA3AF' },
  loadingBubble: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  loadingText: { color: '#6B7280', fontSize: 14 },

  // Input moderne Gemini
  inputWrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 15,
    color: '#1F2937',
    paddingTop: 10,
    paddingBottom: 10,
  },
  sendBtn: {
    backgroundColor: '#059669',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 8,
  },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatModalBtn: {
    flexDirection: 'row',
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  newChatModalBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  historyCardActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  historyCardMain: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  historyTitle: { fontSize: 14, color: '#374151', flex: 1 },
  historyTitleActive: { fontWeight: '600', color: '#047857' },
  deleteBtn: { padding: 4 },
  emptyHistory: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyHistoryText: { color: '#9CA3AF', fontSize: 14 },
});