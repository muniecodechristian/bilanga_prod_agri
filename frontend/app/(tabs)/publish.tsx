import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useApiClient, videoApi } from '@/utils/api';
import { useQueryClient } from '@tanstack/react-query';


export default function PublishVideoScreen() {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const api = useApiClient();
  const router = useRouter();
  const queryClient = useQueryClient();

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Accorde l\'accès à ta galerie pour choisir une vidéo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!videoUri) {
      Alert.alert('Vidéo manquante', 'Sélectionne une vidéo avant de publier.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      const uriParts = videoUri.split('.');
      const fileType = uriParts[uriParts.length - 1]?.toLowerCase() || 'mp4';
      const mimeType = fileType === 'mov' ? 'video/quicktime' : 'video/mp4';

      formData.append('video', {
        uri: videoUri,
        name: `video.${fileType}`,
        type: mimeType,
      } as any);

      if (caption.trim()) {
        formData.append('caption', caption.trim());
      }

      await videoApi.uploadVideo(api, formData);

      // Invalidate the video feed cache so next visit shows the new video
      queryClient.invalidateQueries({ queryKey: ['videoFeed'] });

      Alert.alert(' Vidéo publiée !', 'Ta vidéo est maintenant visible dans le fil.', [
        {
          text: 'Voir le fil',
          onPress: () => router.replace('/(tabs)/videos'),
        },
      ]);

      setVideoUri(null);
      setCaption('');
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Erreur', error?.response?.data?.msg || 'Impossible de publier la vidéo. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Publier une Vidéo</Text>
          <Text style={styles.headerSub}>Partage tes récoltes avec la communauté </Text>
        </View>

        {/* Video Picker */}
        <TouchableOpacity style={styles.videoPicker} onPress={pickVideo} disabled={loading}>
          {videoUri ? (
            <View style={styles.videoPreviewContainer}>
              <Ionicons name="videocam" size={40} color="#10B981" />
              <Text style={styles.videoReadyText}>Vidéo sélectionnée ✓</Text>
              <Text style={styles.videoChangeText}>Appuie pour changer</Text>
            </View>
          ) : (
            <View style={styles.videoPickerContent}>
              <Ionicons name="cloud-upload-outline" size={60} color="#9CA3AF" />
              <Text style={styles.videoPickerTitle}>Choisir une vidéo</Text>
              <Text style={styles.videoPickerSub}>Max 60 secondes • MP4 / MOV</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Caption */}
        <View style={styles.captionContainer}>
          <Text style={styles.captionLabel}>Description</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Décris ta récolte, ajoute des hashtags... #tomates #maïs"
            placeholderTextColor="#9CA3AF"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={280}
          />
          <Text style={styles.captionCount}>{caption.length}/280</Text>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}> Conseils pour une bonne vidéo</Text>
          <Text style={styles.tipItem}>• Montre clairement tes cultures et récoltes</Text>
          <Text style={styles.tipItem}>• Filme en lumière naturelle pour une meilleure qualité</Text>
          <Text style={styles.tipItem}>• Ajoute une description pour faciliter la vente</Text>
        </View>

        {/* Publish Button */}
        <TouchableOpacity
          style={[styles.publishBtn, (!videoUri || loading) && styles.publishBtnDisabled]}
          onPress={handlePublish}
          disabled={!videoUri || loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.publishBtnText}>Publication en cours...</Text>
            </>
          ) : (
            <>
              <Ionicons name="play-circle" size={22} color="white" />
              <Text style={styles.publishBtnText}>Publier la vidéo</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  headerSub: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  videoPicker: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  videoPickerContent: {
    alignItems: 'center',
    gap: 8,
  },
  videoPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  videoPickerSub: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  videoPreviewContainer: {
    alignItems: 'center',
    gap: 8,
  },
  videoReadyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  videoChangeText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  captionContainer: {
    marginBottom: 20,
  },
  captionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  captionInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  captionCount: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  tipsContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 22,
  },
  publishBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  publishBtnDisabled: {
    backgroundColor: '#D1D5DB',
    elevation: 0,
    shadowOpacity: 0,
  },
  publishBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
