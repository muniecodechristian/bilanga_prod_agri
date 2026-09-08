import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Switch,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/context/AuthContext';
import { useCreateRecoltePost } from '@/hooks/useCreateRecoltecPost';

type CreateMode = 'harvest' | 'video';

export default function CreateScreen() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [mode, setMode] = useState<CreateMode>('harvest');
  const [phoneValid, setPhoneValid] = useState(true);

  const {
    title, setTitle,
    description, setDescription,
    phone, setPhone,
    country, setCountry,
    city, setCity,
    price, setPrice,
    category, setCategory,
    quantity, setQuantity,
    images,
    autoLocation, setAutoLocation,
    createPost,
    pickImageFromGallery,
    loading,
  } = useCreateRecoltePost();

  // ─── Guard: Seuls les propriétaires ont accès ──────────────────────────────
  if (user?.role !== 'proprietaire') {
    return (
      <SafeAreaView style={styles.guardContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.guardIconBadge}>
          <Ionicons name="lock-closed" size={32} color="#EF4444" />
        </View>
        <Text style={styles.guardTitle}>Accès restreint</Text>
        <Text style={styles.guardSubtitle}>
          La création de contenus et la vente de récoltes sont réservées aux agriculteurs vérifiés.
        </Text>
        <TouchableOpacity style={styles.guardBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          <Text style={styles.guardBtnText}>Retourner à l'accueil</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Navigation fluide vers la vidéo sans side-effect pendant le rendu
  const handleModeChange = (newMode: CreateMode) => {
    if (newMode === 'video') {
      router.push('/(tabs)/publish' as any);
    } else {
      setMode('harvest');
    }
  };

  const isFormValid = title && description && phone && country && city && price && category && phoneValid;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header TikTok Style */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
          <Ionicons name="close" size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Créer une publication</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Contenu : Formulaire Récolte */}
      <ScrollView
        contentContainerStyle={styles.formContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Galerie d'images / Upload */}
        <Text style={styles.sectionLabel}>Photos du produit (4 max)</Text>
        <View style={styles.imageGrid}>
          {images.map((img: string, index: number) => (
            <View key={index} style={styles.previewContainer}>
              <Image source={{ uri: img }} style={styles.previewImage} />
            </View>
          ))}
          {images.length < 4 && (
            <TouchableOpacity style={styles.uploadBtn} onPress={pickImageFromGallery} activeOpacity={0.7}>
              <Ionicons name="camera" size={28} color="#10B981" />
              <Text style={styles.uploadBtnText}>Ajouter</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Option Localisation Auto */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleTextContainer}>
            <Ionicons name="location" size={20} color="#10B981" style={{ marginRight: 10 }} />
            <Text style={styles.toggleLabel}>Détection auto de la position</Text>
          </View>
          <Switch
            value={autoLocation}
            onValueChange={setAutoLocation}
            thumbColor={autoLocation ? '#10B981' : '#6B7280'}
            trackColor={{ false: '#374151', true: '#065F46' }}
          />
        </View>

        {/* Formulaire des champs */}
        <View style={styles.inputsGroup}>
          <FormField
            icon="pricetag"
            placeholder="Titre de l'annonce *"
            value={title}
            onChangeText={setTitle}
          />

          <FormField
            icon="document-text"
            placeholder="Description détaillée *"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <FormField
            icon="call"
            placeholder="Téléphone (ex: +243 812 345 678) *"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              setPhoneValid(text.length >= 8);
            }}
            keyboardType="phone-pad"
            error={!phoneValid ? 'Numéro de téléphone invalide' : undefined}
          />

          <View style={styles.rowInputs}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <FormField
                icon="cash"
                placeholder="Prix *"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <FormField
                icon="grid"
                placeholder="Catégorie *"
                value={category}
                onChangeText={setCategory}
              />
            </View>
          </View>

          <FormField
            icon="cube"
            placeholder="Quantité disponible (ex: 50 kg)"
            value={quantity}
            onChangeText={setQuantity}
          />

          <FormField
            icon="business"
            placeholder="Ville / Cité *"
            value={city}
            onChangeText={setCity}
            editable={!autoLocation}
          />

          <FormField
            icon="earth"
            placeholder="Pays *"
            value={country}
            onChangeText={setCountry}
            editable={!autoLocation}
          />
        </View>

        {/* Bouton de validation */}
        <TouchableOpacity
          style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
          onPress={createPost}
          disabled={!isFormValid || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Publier la récolte</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Mode Switcher (TikTok Create Camera Bar) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.modeTab, mode === 'harvest' && styles.modeTabActive]}
          onPress={() => handleModeChange('harvest')}
        >
          <MaterialCommunityIcons
            name="sprout"
            size={18}
            color={mode === 'harvest' ? '#FFFFFF' : '#9CA3AF'}
          />
          <Text style={[styles.modeTabText, mode === 'harvest' && styles.modeTabTextActive]}>
            Récolte
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeTab, mode === 'video' && styles.modeTabActive]}
          onPress={() => handleModeChange('video')}
        >
          <Ionicons
            name="videocam"
            size={18}
            color={mode === 'video' ? '#FFFFFF' : '#9CA3AF'}
          />
          <Text style={[styles.modeTabText, mode === 'video' && styles.modeTabTextActive]}>
            Vidéo Studio
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Composant Input Générique Stylisé TikTok Dark ───────────────────────────
interface FormFieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  editable?: boolean;
  error?: string;
}

function FormField({
  icon,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  keyboardType = 'default',
  editable = true,
  error,
}: FormFieldProps) {
  return (
    <View style={styles.fieldContainer}>
      <View style={[styles.inputWrapper, !editable && styles.inputDisabled]}>
        <Ionicons name={icon} size={20} color="#9CA3AF" style={styles.inputIcon} />
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          keyboardType={keyboardType}
          editable={editable}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ─── Styles Pro UI (Thème TikTok Studio) ──────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Guard Screen
  guardContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  guardIconBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  guardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  guardSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  guardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#27272A',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
  },
  guardBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },

  // Form Content
  formContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionLabel: {
    color: '#D1D5DB',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Images Grid
  imageGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  previewContainer: {
    width: 76,
    height: 76,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  uploadBtn: {
    width: 76,
    height: 76,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBtnText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },

  // Toggle Location Card
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2D2D2D',
  },
  toggleTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '500',
  },

  // Inputs Group
  inputsGroup: {
    gap: 12,
  },
  fieldContainer: {
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D2D2D',
    paddingHorizontal: 14,
  },
  inputDisabled: {
    opacity: 0.5,
    backgroundColor: '#161616',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 14,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  submitButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Bottom Camera Switcher Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#000000',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#1F2937',
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modeTabActive: {
    backgroundColor: '#1F2937',
  },
  modeTabText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
});