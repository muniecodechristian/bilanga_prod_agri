import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Alert,
  StatusBar,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { Ionicons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PlantScanner() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const API_KEY = process.env.EXPO_PUBLIC_SCANNER_API_KEY || "";

  const pickImage = async (fromCamera = false) => {
    let resultImg: ImagePicker.ImagePickerResult;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      base64: true,
    };

    if (fromCamera) {
      resultImg = await ImagePicker.launchCameraAsync(options);
    } else {
      resultImg = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!resultImg.canceled) {
      const base64Img = resultImg.assets[0].base64;
      setImage(resultImg.assets[0].uri);
      sendToAPI(base64Img);
    }
  };

  const sendToAPI = async (base64Image: any) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        "https://plant.id/api/v3/identification",
        {
          images: [`data:image/jpg;base64,${base64Image}`],
          latitude: 49.207,
          longitude: 16.608,
          similar_images: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Api-Key": API_KEY,
          },
        }
      );

      const data = response.data;
      setResult({
        status: data.status,
        model_version: data.model_version,
        access_token: data.access_token,
        isPlant: data.result?.is_plant?.binary,
        probability: data.result?.is_plant?.probability,
        suggestion:
          data.result?.classification?.suggestions?.[0]?.name ||
          data.suggestions?.[0]?.plant_name ||
          "Plante inconnue",
        confidence:
          data.suggestions?.[0]?.probability ||
          data.result?.is_plant?.probability ||
          0,
        timing: data.timing,
      });

      setModalVisible(true);
    } catch (error: any) {
      console.error("Erreur API Plant.ID:", error?.response?.data || error?.message);
      Alert.alert("Erreur de connexion", "Impossible d'analyser l'image pour le moment.");
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("scanner_result", JSON.stringify(result));
      Alert.alert("Succès", "L'identification a bien été enregistrée dans vos collections.");
    } catch (error) {
      console.error("Erreur stockage local:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder la fiche.");
    } finally {
      setModalVisible(false);
    }
  };

  const confidencePercent = Math.round((result?.confidence || 0) * 100);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header & Controls Overlay */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Identification</Text>
          <View style={styles.placeholderIcon} />
        </View>
      </SafeAreaView>

      {/* Camera Viewfinder Area */}
      <View style={styles.scannerViewport}>
        {image ? (
          <Image source={{ uri: image }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderViewport}>
            <Feather name="aperture" size={48} color="rgba(255,255,255,0.2)" />
            <Text style={styles.instructionText}>
              Cadrez la feuille ou la fleur au centre
            </Text>
          </View>
        )}

        {/* Framing Corners (Design Pro) */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.loadingText}>Analyse en cours...</Text>
          </View>
        )}
      </View>

      {/* Bottom Controls Bar (Style Appareil Photo Pro) */}
      <SafeAreaView style={styles.controlsSafeArea}>
        <View style={styles.controlsBar}>
          {/* Bouton Galerie */}
          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => pickImage(false)}
            activeOpacity={0.8}
          >
            <Ionicons name="images-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Déclencheur Caméra */}
          <TouchableOpacity
            style={styles.shutterOuterBtn}
            onPress={() => pickImage(true)}
            activeOpacity={0.85}
          >
            <View style={styles.shutterInnerBtn} />
          </TouchableOpacity>

          {/* Espaceur pour équilibrer la barre */}
          <View style={styles.secondaryActionBtnPlaceholder} />
        </View>
      </SafeAreaView>

      {/* Modal / BottomSheet de Résultat */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            {/* Handle Bar pour UX Drag */}
            <View style={styles.dragHandle} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
              {/* Image d'analyse */}
              {image && (
                <Image source={{ uri: image }} style={styles.resultThumbnail} />
              )}

              {/* Statut & Titre */}
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>
                  {result?.isPlant ? result?.suggestion : "Non identifié"}
                </Text>

                {result?.isPlant && (
                  <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>{confidencePercent}% de certitude</Text>
                  </View>
                )}
              </View>

              <Text style={styles.resultDescription}>
                {result?.isPlant
                  ? "Les caractéristiques visuelles correspondent à cette espèce."
                  : "L'image ne permet pas de reconnaître une plante de façon fiable."}
              </Text>

              {/* Métadonnées API (Style Clean) */}
              <View style={styles.metaContainer}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Modèle d'analyse</Text>
                  <Text style={styles.metaValue}>{result?.model_version || "v3"}</Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Temps de réponse</Text>
                  <Text style={styles.metaValue}>
                    {result?.timing?.completed && result?.timing?.created
                      ? `${((result.timing.completed - result.timing.created) * 1000).toFixed(0)} ms`
                      : "Direct"}
                  </Text>
                </View>
              </View>

              {/* Actions */}
              {result?.isPlant && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={saveData}
                  activeOpacity={0.85}
                >
                  <Ionicons name="bookmark-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>Enregistrer dans mes plantes</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.ghostButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.ghostButtonText}>Scanner une autre plante</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0D0A",
  },

  // Header
  headerSafeArea: {
    zIndex: 10,
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 50,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    width: 40,
  },

  // Viewport Caméra
  scannerViewport: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#121612",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderViewport: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  instructionText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    fontWeight: "400",
  },

  // Coins de cadrage (Design Viseur Natif)
  corner: {
    position: "absolute",
    width: 24,
    height: 24,
    borderColor: "rgba(255,255,255,0.6)",
  },
  topLeft: {
    top: 20,
    left: 20,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 20,
    right: 20,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 20,
    left: 20,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 20,
    right: 20,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomRightRadius: 8,
  },

  // Loading Overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 13, 10, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "500",
  },

  // Bottom Controls
  controlsSafeArea: {
    paddingBottom: 10,
  },
  controlsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 40,
    height: 90,
  },
  shutterOuterBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  shutterInnerBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#10B981",
  },
  secondaryActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryActionBtnPlaceholder: {
    width: 48,
  },

  // Modal / BottomSheet
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#161B16",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
    maxHeight: "80%",
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetContent: {
    alignItems: "center",
  },
  resultThumbnail: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginBottom: 16,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  confidenceBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  confidenceText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "600",
  },
  resultDescription: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  // Meta info box
  metaContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    color: "#6B7280",
    fontSize: 13,
  },
  metaValue: {
    color: "#E5E7EB",
    fontSize: 13,
    fontWeight: "500",
  },
  metaDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 10,
    marginVertical: 10,
  },

  // Buttons
  primaryButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#10B981",
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  ghostButton: {
    width: "100%",
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  ghostButtonText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
});