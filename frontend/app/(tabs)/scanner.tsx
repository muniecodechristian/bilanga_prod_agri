import React, { useState } from "react";
import {
  ImageBackground,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PlantScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const API_KEY = process.env.EXPO_PUBLIC_SCANNER_API_KEY || "";

  const pickImage = async (fromCamera = false) => {
    let resultImg: ImagePicker.ImagePickerResult;

    if (fromCamera) {
      resultImg = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: true,
      });
    } else {
      resultImg = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        base64: true,
      });
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
          "Inconnue",
        confidence:
          data.suggestions?.[0]?.probability ||
          data.result?.is_plant?.probability ||
          0,
        image_url: data.request?.images?.[0],
        timing: data.timing,
      });

      setModalVisible(true);
    } catch (error:any) {
      console.log("Erreur API:", error?.response?.data || error?.message);
      Alert.alert("Erreur", "Impossible de contacter le service Plant.ID");
    } finally {
      setLoading(false);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("result", JSON.stringify(result));
      alert("Données sauvegardées");

    } catch (error) {
      console.log("Erreur stockage local:", error);
      alert("Erreur stockage local");
    }
    finally {
      setModalVisible(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/back3.jpg")}
      blurRadius={18}
      style={styles.backgroundImage}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Plant Identifier </Text>
        <Text style={styles.subtitle}>
          capturer une plante pour l’identifier
        </Text>
      </View>

      <View style={styles.scanFrame}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.scanHint}>Place la plante dans le cadre</Text>
        )}
        <View style={styles.gridOverlay} />
      </View>

      <View style={styles.btnRow}>
        <TouchableOpacity
          style={styles.galleryBtn}
          onPress={() => pickImage(false)}
        >
          <Text style={styles.btnText}>
            <FontAwesome5 name="images" size={18} /> Galerie
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cameraBtn}
          onPress={() => pickImage(true)}
        >
          <Text style={styles.btnText}>
            <FontAwesome5 name="camera" size={18} /> Caméra
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <ActivityIndicator
          size="large"
          color="#3bf060"
          style={{ marginTop: 20 }}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Image source={{ uri: image || undefined }} style={styles.modalImage} />

            <Text style={styles.modalTitle}>
              {result?.isPlant
                ? result?.suggestion
                : " Ce n’est probablement pas une plante."}
            </Text>

            <Text style={styles.modalSub}>
              Confiance : {((result?.confidence || 0) * 100).toFixed(1)}%
            </Text>

            <Text style={styles.modalDesc}>
              {result?.isPlant
                ? " C’est bien une plante !"
                : " Ce n’est probablement pas une plante."}
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                 Modèle IA : {result?.model_version}
              </Text>

              <Text style={styles.infoText}>
                 Temps total :{" "}
                {(
                  (result?.timing?.completed - result?.timing?.created) * 1000
                ).toFixed(0)}{" "}
                ms
              </Text>

              <Text style={styles.infoText}> Coordonnées : 49.207, 16.608</Text>

              <Text style={styles.infoText}>
                 Token : {result?.access_token}
              </Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveData}>
              <Text style={styles.saveText}>+ Ajouter à mes plantes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

// STYLES
const green = "#3bf060";

const styles = StyleSheet.create({
  header: { alignItems: "center", marginTop: 20 },
  title: { fontSize: 26, fontWeight: "700", marginTop: 25, color: green },
  subtitle: {
    fontSize: 14,
    color: "#aaffaa",
    marginBottom: 10,
    marginTop: 10,
  },
  scanFrame: {
    width: "85%",
    height: "48%",
    alignSelf: "center",
    borderWidth: 3,
    borderColor: green,
    borderRadius: 18,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  scanHint: { color: "#89ff89", fontSize: 15 },
  gridOverlay: {
    position: "absolute",
    width: "80%",
    height: "80%",
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "rgba(255,255,255,0.3)",
  },
  image: { width: "100%", height: "100%" },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  galleryBtn: {
    backgroundColor: "rgba(0,255,70,0.2)",
    padding: 15,
    borderRadius: 50,
    width: "40%",
    alignItems: "center",
    borderColor: green,
    borderWidth: 1,
  },
  cameraBtn: {
    backgroundColor: green,
    padding: 15,
    borderRadius: 50,
    width: "40%",
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "600" },
  backgroundImage: { width: "100%", height: "100%" },
  modalContainer: {
    flex: 1,
    backgroundColor: "#EDF7EE",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    borderRadius: 10,
    borderColor: green,
    padding: 20,
    alignItems: "center",
  },
  modalImage: { width: 120, height: 120, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: green, marginTop: 10 },
  modalSub: { fontSize: 15, color: "black", marginVertical: 4 },
  modalDesc: { color: "black", textAlign: "center", marginVertical: 10 },
  infoBox: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
    padding: 10,
  },
  infoText: { color: "black", fontSize: 12, marginBottom: 4 },
  saveBtn: {
    width: "90%",
    backgroundColor: green,
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
  },
  saveText: { fontWeight: "bold", textAlign: "center" },
  closeBtn: { marginTop: 10 },
  closeText: { color: "black" },
});
