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

const RecoltesEcommerce = () => {
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
        <Text>Erreur</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: RecolteItem }) => (
    <Animated.View
      style={styles.card}
      entering={FadeInDown.duration(400).delay(200).springify().damping(25)}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: item.user?.profilePicture }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{item.user?.firstName}</Text>
      </View>

      <TouchableOpacity onPress={() => handleOpenItem(item)}>
        <Image source={{ uri: item.images?.[0] }} style={styles.image} />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <View style={styles.desc}>
          <Text style={styles.productName}>{item.title}</Text>
          <Text style={styles.city}>
            <Ionicons name="location" size={16} color="#fff" /> {item.city}
          </Text>
        </View>

        <View style={styles.desc}>
          <Text style={styles.price}>{item.price}</Text>
          <Text style={styles.oldPrice}>{item.country}</Text>
        </View>
      </View>
    </Animated.View>
  );

  const recoltesList = (dataRecoltes as any)?.recoltes || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      {/* HEADER */}
      <View style={styles.headerRecoltes}>
        <Backbutton />
        <Text style={styles.titleRecoltes}>Récoltes Disponibles</Text>
      </View>

      {/* LISTE */}
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
            <Image source={require("../../assets/images/user.png")} style={styles.emptyImage} />
            <Text style={styles.emptyText}>Aucune Recolte disponible</Text>
          </View>
        }
      />

      {/* MODAL */}
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
                  <Text>Coordonnées non trouvées</Text>
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
                    <Image
                      source={{ uri: selectedItem.images[0] }}
                      style={styles.modalImage}
                    />
                  ) : (
                    <Text>Aucune image disponible</Text>
                  )}
                      
                  <Text style={styles.modalTitle}>{selectedItem.title}</Text>
                  <Text style={styles.modalDesc}>
                    {selectedItem.description}
                  </Text>
                  <Text style={styles.modalPrice}>
                    {selectedItem.price} USD
                  </Text>
                  <Text>Quantité : {selectedItem.quantity}</Text>
                </ScrollView>
              )}
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowMap(!showMap)}
              >
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRecoltes: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  titleRecoltes: {
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    marginTop: 16,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 230,
  },
  cardContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 8,
  },
  desc: {
    alignItems: "center",
  },
  productName: {
    color: "#27ae60",
    fontWeight: "600",
  },
  city: {
    color: "#fff",
  },
  price: {
    color: "#fff",
    fontWeight: "700",
  },
  oldPrice: {
    color: "#ddd",
    fontSize: 12,
    textAlign: "center"
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  username: {
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 1,
  },
  toggleButton: {
    backgroundColor: "#27ae60",
    padding: 16,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  modalContent: {
    marginTop: 16,
  },
  modalImage: {
    width: "100%",
    height: 220,
    resizeMode: "contain",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalDesc: {
    fontSize: 16,
    marginVertical: 18,
    textAlign: "center",
  },
  modalPrice: {
    color: "#27ae60",
    fontWeight: "700",
    fontSize: 16,
    flexDirection: "row",
  },
  emptyContainer: { 
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyImage: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  }
});

export default RecoltesEcommerce;
