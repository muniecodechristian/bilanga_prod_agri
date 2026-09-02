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
  SafeAreaView,
  Modal,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAgriChat } from '@/hooks/useAgriChat';

const QUICK_SUGGESTIONS = [
  "Comment traiter les chenilles sur mon maïs ?",
  "Quelle est la meilleure période pour semer le manioc ?",
  "Comment fabriquer un engrais naturel ?",
  "Mes tomates pourrissent avant de mûrir, que faire ?"
];

export default function AdviceDetail() {
  const router = useRouter();
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
    error 
  } = useAgriChat();

  const [inputText, setInputText] = useState('');
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll au bas lors de la réception des jetons SSE
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, [messages, isStreaming]);

  const handleSend = () => {
    if (inputText.trim() && !isStreaming) {
      sendMessage(inputText);
      setInputText('');
      Keyboard.dismiss();
    }
  };

  const handleSuggestion = (text: string) => {
    if (!isStreaming) {
      sendMessage(text);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>🌱</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>AgriBilanga IA</Text>
            <Text style={styles.headerSubtitle}>
              {isStreaming ? "Écriture en direct..." : "Toujours en ligne (30d TTL)"}
            </Text>
          </View>
        </View>

        {/* Bouton Nouvelle Discussion */}
        <TouchableOpacity onPress={startNewChat} style={styles.headerIconBtn}>
          <Ionicons name="create-outline" size={22} color="#10B981" />
        </TouchableOpacity>

        {/* Bouton Historique des discussions (Style Gemini) */}
        <TouchableOpacity onPress={() => setHistoryModalVisible(true)} style={styles.headerIconBtn}>
          <Ionicons name="time-outline" size={22} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* CHAT AREA */}
      <KeyboardAvoidingView 
        style={styles.flex1} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        >
          {messages.map((msg, index) => {
            const isLastAssistantMessage = msg.role === 'assistant' && index === messages.length - 1;
            
            return (
              <View 
                key={msg.id} 
                style={[
                  styles.messageWrapper, 
                  msg.role === 'user' ? styles.messageWrapperUser : styles.messageWrapperAssistant
                ]}
              >
                {msg.role === 'assistant' && (
                  <View style={styles.smallAvatar}>
                    <Text style={styles.smallAvatarText}>🤖</Text>
                  </View>
                )}
                <View 
                  style={[
                    styles.messageBubble, 
                    msg.role === 'user' ? styles.messageBubbleUser : styles.messageBubbleAssistant
                  ]}
                >
                  <Text style={[
                    styles.messageText,
                    msg.role === 'user' ? styles.messageTextUser : styles.messageTextAssistant
                  ]}>
                    {msg.content}
                    {/* Indicateur de frappe clignotant pour le streaming SSE */}
                    {isStreaming && isLastAssistantMessage && (
                      <Text style={styles.cursorText}> ▍</Text>
                    )}
                  </Text>
                  <Text style={[
                    styles.timeText,
                    msg.role === 'user' ? styles.timeTextUser : styles.timeTextAssistant
                  ]}>
                    {formatTime(msg.timestamp)}
                  </Text>
                </View>
              </View>
            );
          })}

          {isLoading && !isStreaming && (
            <View style={[styles.messageWrapper, styles.messageWrapperAssistant]}>
              <View style={styles.smallAvatar}>
                <Text style={styles.smallAvatarText}>🤖</Text>
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleAssistant, styles.loadingBubble]}>
                <ActivityIndicator size="small" color="#10B981" />
                <Text style={styles.loadingText}>Connexion au flux IA...</Text>
              </View>
            </View>
          )}

          {/* Quick Suggestions (Seulement si c'est une nouvelle discussion) */}
          {messages.length === 1 && !isLoading && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Questions fréquentes :</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
                {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestion(suggestion)}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        {/* INPUT AREA */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Posez votre question agricole..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isStreaming}
          />
          <TouchableOpacity 
            style={[styles.sendButton, (!inputText.trim() || isStreaming) && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim() || isStreaming}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* MODAL HISTORIQUE DES CONVERSATIONS (Style Gemini) */}
      <Modal
        visible={historyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setHistoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mes discussions IA (30j)</Text>
              <TouchableOpacity onPress={() => setHistoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.newChatModalBtn}
              onPress={() => {
                startNewChat();
                setHistoryModalVisible(false);
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.newChatModalBtnText}>Nouvelle discussion</Text>
            </TouchableOpacity>

            <FlatList
              data={conversations}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.historyList}
              ListEmptyComponent={
                <View style={styles.emptyHistory}>
                  <Text style={styles.emptyHistoryText}>Aucune discussion enregistrée.</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={[
                  styles.historyItem,
                  item._id === activeConversationId && styles.historyItemActive
                ]}>
                  <TouchableOpacity 
                    style={styles.historyItemMain}
                    onPress={() => {
                      selectConversation(item._id);
                      setHistoryModalVisible(false);
                    }}
                  >
                    <Ionicons 
                      name="chatbubble-ellipses-outline" 
                      size={18} 
                      color={item._id === activeConversationId ? "#10B981" : "#6B7280"} 
                    />
                    <Text 
                      style={[
                        styles.historyItemTitle,
                        item._id === activeConversationId && styles.historyItemTitleActive
                      ]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => deleteConversation(item._id)}
                    style={styles.deleteHistoryBtn}
                  >
                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    paddingTop: Platform.OS === 'android' ? 40 : 12,
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DEF7EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  headerIconBtn: {
    padding: 8,
    marginLeft: 4,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 32,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  messageWrapperUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageWrapperAssistant: {
    alignSelf: 'flex-start',
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  smallAvatarText: {
    fontSize: 14,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    elevation: 1,
  },
  messageBubbleUser: {
    backgroundColor: '#10B981',
    borderBottomRightRadius: 4,
  },
  messageBubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageTextUser: {
    color: '#FFFFFF',
  },
  messageTextAssistant: {
    color: '#1F2937',
  },
  cursorText: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeTextUser: {
    color: '#D1FAE5',
  },
  timeTextAssistant: {
    color: '#9CA3AF',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  loadingText: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 14,
    fontStyle: 'italic',
  },
  suggestionsContainer: {
    marginTop: 24,
    marginBottom: 8,
  },
  suggestionsTitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '600',
  },
  suggestionsScroll: {
    paddingBottom: 8,
  },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 45,
    maxHeight: 120,
    fontSize: 15,
    color: '#1F2937',
  },
  sendButton: {
    backgroundColor: '#10B981',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  // MODAL HISTORIQUE
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  newChatModalBtn: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  newChatModalBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  historyList: {
    paddingBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  historyItemActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  historyItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  historyItemTitle: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  historyItemTitleActive: {
    fontWeight: '600',
    color: '#065F46',
  },
  deleteHistoryBtn: {
    padding: 6,
  },
  emptyHistory: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyHistoryText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
