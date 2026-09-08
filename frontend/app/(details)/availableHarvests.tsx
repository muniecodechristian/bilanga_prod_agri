// availableHarvests.tsx
// Anciennement : chats.tsx
// Fonction : Affichage et exploration des récoltes disponibles à l'achat

import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetRecoltes } from "@/hooks/userecolte";
import { reverseCityToCoords } from "@/utils/reverseGeocode";
import { SafeAreaView } from "react-native-safe-area-context";
import Backbutton from "@/components/backbutton";
import CustomMap from "@/components/CustomMap";
import Modal from "react-native-modal";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (width - CARD_GAP * 3) / 2;

interface UserInfo {
  firstName: string;
  profilePicture?: string;
}

interface RecolteItem {
  _id: string;
  title: string;
  description: string;
  price: string;
  quantity: string;
  city: string;
  country: string;
  images: string[];
  user?: UserInfo;
}

const AvailableHarvests = () => {
  const { dataRecoltes, loading, error } = useGetRecoltes();
  const [selectedItem, setSelectedItem] = useState<RecolteItem | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [loadingCoords, setLoadingCoords] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleOpenItem = async (item: RecolteItem) => {
    setSelectedItem(item);
    setLoadingCoords(true);
    const c = await reverseCityToCoords(item.city);
    setCoords(c);
    setLoadingCoords(false);
    setShowMap(false);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setCoords(null);
    setShowMap(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ecc71" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="wifi-outline" size={60} color="#9CA3AF" />
        <Text style={styles.errorText}>Erreur de connexion</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: RecolteItem }) => (
    <Animated.View
      style={styles.card}
      entering={FadeInDown.duration(400).delay(200).springify().damping(25)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.user?.profilePicture }} style={styles.avatar} />
        <Text style={styles.username}>{item.user?.firstName}</Text>
      </View>

      <TouchableOpacity onPress={() => handleOpenItem(item)}>
        <Image source={{ uri: item.images?.[0] }} style={styles.image} />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <View style={styles.desc}>
          <Text style={styles.productName} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.city}>
            <Ionicons name="location" size={14} color="#fff" /> {item.city}
          </Text>
        </View>
        <View style={styles.desc}>
          <Text style={styles.price}>{item.price} USD</Text>
          <Text style={styles.oldPrice}>{item.country}</Text>
        </View>
      </View>
    </Animated.View>
  );

  const recoltesList = (dataRecoltes as any)?.recoltes || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      <View style={styles.headerRecoltes}>
        <Backbutton />
        <Text style={styles.titleRecoltes}>Récoltes Disponibles</Text>
      </View>

      <FlatList
        data={recoltesList}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{
          justifyContent: "space-between",
          paddingHorizontal: CARD_GAP,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 64 }}>🌾</Text>
            <Text style={styles.emptyText}>Aucune récolte disponible</Text>
          </View>
        }
      />

      <Modal
        isVisible={!!selectedItem}
        onBackdropPress={closeModal}
        onBackButtonPress={closeModal}
        swipeDirection="down"
        animationIn="slideInUp"
        animationOut="slideOutDown"
        style={{ margin: 0 }}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
            <Ionicons name="close" size={30} color="#000" />
          </TouchableOpacity>

          {selectedItem && (
            <>
              {showMap ? (
                loadingCoords ? (
                  <ActivityIndicator size="small" />
                ) : coords ? (
                  <CustomMap
                    style={{ flex: 1, margin: 0 }}
                    coords={coords}
                    title={selectedItem?.title}
                  />
                ) : (
                  <Text style={{ textAlign: 'center', marginTop: 20 }}>Coordonnées non trouvées</Text>
                )
              ) : (
                <ScrollView style={styles.modalContent}>
                  {Array.isArray(selectedItem.images) && selectedItem.images.length > 1 ? (
                    <ScrollView
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      style={{ height: width * 0.9 }}
                    >
                      {selectedItem.images.map((img, i) => (
                        <Image
                          key={i}
                          source={{ uri: img }}
                          style={[styles.modalImage, { width }]}
                        />
                      ))}
                    </ScrollView>
                  ) : selectedItem.images?.[0] ? (
                    <Image source={{ uri: selectedItem.images[0] }} style={styles.modalImage} />
                  ) : null}

                  <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                  <Text style={styles.modalDesc}>{selectedItem.description}</Text>
                  <Text style={styles.modalPrice}>{selectedItem.price} USD</Text>
                  <Text style={{ textAlign: 'center', color: '#6B7280', marginTop: 4 }}>
                    Quantité : {selectedItem.quantity}
                  </Text>
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowMap(!showMap)}
              >
                <Ionicons name={showMap ? "images-outline" : "map-outline"} size={18} color="#fff" />
                <Text style={styles.toggleButtonText}>
                  {showMap ? "Voir photos" : "Voir la carte"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F7F7F7" },
  errorText: { color: "#9CA3AF", fontSize: 16, marginTop: 12 },
  headerRecoltes: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  titleRecoltes: { fontSize: 20, fontWeight: "700", marginLeft: 10, color: "#111827" },
  card: { width: CARD_WIDTH, borderRadius: 16, marginTop: 16, overflow: "hidden", backgroundColor: "#fff", elevation: 3 },
  image: { width: "100%", height: 200 },
  cardContent: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.6)", padding: 8,
  },
  desc: { alignItems: "center" },
  productName: { color: "#27ae60", fontWeight: "600", fontSize: 13 },
  city: { color: "#fff", fontSize: 12 },
  price: { color: "#fff", fontWeight: "700" },
  oldPrice: { color: "#ddd", fontSize: 11 },
  avatarContainer: { flexDirection: "row", alignItems: "center", padding: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  username: { marginLeft: 8, fontSize: 12, fontWeight: "600", color: "#374151" },
  modalContainer: {
    flex: 1, backgroundColor: "#fff",
    borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16,
  },
  closeBtn: { position: "absolute", top: 16, right: 16, zIndex: 1 },
  toggleButton: {
    backgroundColor: "#27ae60", padding: 14, borderRadius: 12,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8,
  },
  toggleButtonText: { color: "#fff", fontWeight: "600", textAlign: "center" },
  modalContent: { marginTop: 16 },
  modalImage: { width: "100%", height: 220, resizeMode: "contain", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center", color: "#111827" },
  modalDesc: { fontSize: 15, marginVertical: 14, textAlign: "center", color: "#4B5563", lineHeight: 22 },
  modalPrice: { color: "#27ae60", fontWeight: "700", fontSize: 18, textAlign: "center" },
  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyText: { fontSize: 18, fontWeight: "bold", marginTop: 16, color: "#374151" },
});

export default AvailableHarvests;
