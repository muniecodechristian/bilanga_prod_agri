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
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAgriChat, Message } from '../../hooks/useAgriChat';

const QUICK_SUGGESTIONS = [
  "Comment traiter les chenilles sur mon maïs ?",
  "Quelle est la meilleure période pour semer le manioc ?",
  "Comment fabriquer un engrais naturel ?",
  "Mes tomates pourrissent avant de mûrir, que faire ?"
];

export default function AdviceDetail() {
  const router = useRouter();
  const { messages, sendMessage, isLoading, clearChat, error } = useAgriChat();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText('');
      Keyboard.dismiss();
    }
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
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
            <Text style={styles.headerSubtitle}>Toujours en ligne</Text>
          </View>
        </View>

        <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
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
          {messages.map((msg) => (
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
                </Text>
                <Text style={[
                  styles.timeText,
                  msg.role === 'user' ? styles.timeTextUser : styles.timeTextAssistant
                ]}>
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </View>
          ))}

          {isLoading && (
            <View style={[styles.messageWrapper, styles.messageWrapperAssistant]}>
              <View style={styles.smallAvatar}>
                <Text style={styles.smallAvatarText}>🤖</Text>
              </View>
              <View style={[styles.messageBubble, styles.messageBubbleAssistant, styles.loadingBubble]}>
                <ActivityIndicator size="small" color="#10B981" />
                <Text style={styles.loadingText}>AgriBilanga réfléchit...</Text>
              </View>
            </View>
          )}

          {/* Quick Suggestions (only show if it's the first interaction) */}
          {messages.length === 1 && !isLoading && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>Questions fréquentes :</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionsScroll}>
                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                  <TouchableOpacity 
                    key={index} 
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
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingTop: Platform.OS === 'android' ? 40 : 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DEF7EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  clearButton: {
    padding: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
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
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    elevation: 0,
    shadowOpacity: 0,
  }
});
