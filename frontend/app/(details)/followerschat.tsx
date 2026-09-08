// followerschat.tsx
// Fonction : Messagerie entre utilisateurs (style WhatsApp)
// - Propriétaire → peut contacter ses followers
// - Client → voit uniquement les propriétaires à abonner / contacter

import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/utils/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    username: string;
    firstName: string;
    profilePicture?: string;
    role: string;
  }>;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount?: number;
}

interface UserContact {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  role: string;
}

// ─── Sous-composant : Bulle de conversation ───────────────────────────────────
const ConversationItem = ({
  conversation,
  currentUserId,
  onPress,
}: {
  conversation: Conversation;
  currentUserId: string;
  onPress: () => void;
}) => {
  const otherUser = conversation.participants.find((p) => p._id !== currentUserId);
  const initial = otherUser?.username?.charAt(0).toUpperCase() || '?';

  return (
    <TouchableOpacity style={styles.convItem} onPress={onPress} activeOpacity={0.75}>
      {otherUser?.profilePicture ? (
        <Image source={{ uri: otherUser.profilePicture }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarFallback}>
          <Text style={styles.avatarInitial}>{initial}</Text>
        </View>
      )}

      <View style={styles.convInfo}>
        <Text style={styles.convName}>{otherUser?.firstName || otherUser?.username}</Text>
        <Text style={styles.convLastMsg} numberOfLines={1}>
          {conversation.lastMessage?.content || 'Démarrer la conversation'}
        </Text>
      </View>

      <View style={styles.convMeta}>
        {conversation.unreadCount && conversation.unreadCount > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{conversation.unreadCount}</Text>
          </View>
        ) : null}
        <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );
};

// ─── Sous-composant : Contact à ajouter ──────────────────────────────────────
const ContactItem = ({
  user,
  onAdd,
}: {
  user: UserContact;
  onAdd: (user: UserContact) => void;
}) => (
  <View style={styles.contactItem}>
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitial}>{user.username?.charAt(0).toUpperCase()}</Text>
    </View>
    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>{user.firstName} {user.lastName}</Text>
      <Text style={styles.contactUsername}>@{user.username}</Text>
      {user.role === 'proprietaire' && (
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>🌾 Agriculteur</Text>
        </View>
      )}
    </View>
    <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(user)}>
      <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
    </TouchableOpacity>
  </View>
);

// ─── Écran Principal ──────────────────────────────────────────────────────────
export default function FollowersChat() {
  const router = useRouter();
  const { user } = useAuthContext();
  const api = useApiClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'conversations' | 'contacts'>('conversations');

  const isOwner = user?.role === 'proprietaire';

  // Récupération des conversations existantes
  const { data: conversations, isLoading: loadingConvs } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: () => api.get('/conversations').then((r) => r.data),
  });

  // Récupération des contacts disponibles (followers pour proprio, propriétaires pour client)
  const { data: contacts, isLoading: loadingContacts } = useQuery<UserContact[]>({
    queryKey: ['contacts', isOwner ? 'followers' : 'owners'],
    queryFn: () =>
      api
        .get(isOwner ? '/users/followers' : '/users?role=proprietaire')
        .then((r) => r.data),
  });

  const handleStartConversation = async (contact: UserContact) => {
    try {
      const response = await api.post('/conversations', { participantId: contact._id });
      router.push({
        pathname: '/(details)/chatroom',
        params: { conversationId: response.data._id, username: contact.firstName },
      } as any);
    } catch (err) {
      console.error('Erreur création conversation:', err);
    }
  };

  const handleOpenConversation = (conv: Conversation) => {
    const other = conv.participants.find((p) => p._id !== user?._id);
    router.push({
      pathname: '/(details)/chatroom',
      params: { conversationId: conv._id, username: other?.firstName || other?.username },
    } as any);
  };

  const filteredConversations = (conversations || []).filter((c) => {
    const other = c.participants.find((p) => p._id !== user?._id);
    return other?.username?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredContacts = (contacts || []).filter(
    (c) =>
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.firstName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newChatBtn} onPress={() => setTab('contacts')}>
          <Ionicons name="person-add-outline" size={22} color="#22C55E" />
        </TouchableOpacity>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Onglets */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'conversations' && styles.tabBtnActive]}
          onPress={() => setTab('conversations')}
        >
          <Text style={[styles.tabText, tab === 'conversations' && styles.tabTextActive]}>
            Messages
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'contacts' && styles.tabBtnActive]}
          onPress={() => setTab('contacts')}
        >
          <Text style={[styles.tabText, tab === 'contacts' && styles.tabTextActive]}>
            {isOwner ? 'Mes Followers' : 'Agriculteurs'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenu */}
      {tab === 'conversations' ? (
        loadingConvs ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#22C55E" />
        ) : filteredConversations.length === 0 ? (
          // Empty state
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="chat-outline" size={72} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Aucune conversation</Text>
            <Text style={styles.emptySubtitle}>
              {isOwner
                ? 'Contactez vos followers pour discuter de vos récoltes.'
                : 'Abonnez-vous à des agriculteurs pour leur envoyer un message.'}
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => setTab('contacts')}
            >
              <Ionicons name="person-add-outline" size={18} color="#fff" />
              <Text style={styles.emptyActionBtnText}>
                {isOwner ? 'Voir mes followers' : 'Découvrir des agriculteurs'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ConversationItem
                conversation={item}
                currentUserId={user?._id || ''}
                onPress={() => handleOpenConversation(item)}
              />
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        loadingContacts ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#22C55E" />
        ) : filteredContacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={72} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {isOwner ? 'Aucun follower' : 'Aucun agriculteur trouvé'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {isOwner
                ? 'Vous n\'avez pas encore de followers pour discuter.'
                : 'Parcourez l\'application pour trouver des agriculteurs et vous y abonner.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ContactItem user={item} onAdd={handleStartConversation} />
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    elevation: 2,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  newChatBtn: { padding: 4 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    margin: 12, backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E5E7EB', elevation: 1,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1F2937' },
  tabs: {
    flexDirection: 'row', paddingHorizontal: 16, marginBottom: 4,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderColor: 'transparent' },
  tabBtnActive: { borderColor: '#22C55E' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#9CA3AF' },
  tabTextActive: { color: '#22C55E', fontWeight: '700' },
  convItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 12, marginTop: 8,
    borderRadius: 16, padding: 14, elevation: 1,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  avatarFallback: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: '#D1FAE5',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  avatarInitial: { fontSize: 20, fontWeight: '700', color: '#065F46' },
  convInfo: { flex: 1 },
  convName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 3 },
  convLastMsg: { fontSize: 13, color: '#9CA3AF' },
  convMeta: { alignItems: 'flex-end', gap: 6 },
  unreadBadge: {
    backgroundColor: '#22C55E', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  unreadCount: { color: '#fff', fontSize: 11, fontWeight: '700' },
  contactItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 12, marginTop: 8,
    borderRadius: 16, padding: 14, elevation: 1,
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  contactUsername: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start', marginTop: 4,
    backgroundColor: '#F0FDF4', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  roleBadgeText: { fontSize: 11, color: '#15803D', fontWeight: '600' },
  addBtn: {
    backgroundColor: '#22C55E', borderRadius: 12,
    padding: 10, marginLeft: 8,
    elevation: 2,
  },
  emptyState: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 40, paddingBottom: 60,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#374151', marginTop: 20, marginBottom: 10 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 22 },
  emptyActionBtn: {
    marginTop: 28, backgroundColor: '#22C55E',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14,
    elevation: 3,
  },
  emptyActionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
