import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Backbutton from "@/components/backbutton";
import Api_KEY_NEWS from '../../utils/constant';

const Api_KEY = Api_KEY_NEWS;

interface NewsItem {
  id: string;
  title: string;
  image: string;
  url: string | null;
}

export default function HomeScreen() {
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch news
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async (pageNumber = 1) => {
    if (pageNumber === 1) setLoadingNews(true);
    else setLoadingMore(true);

    try {
      const url = `https://api.apitube.io/v1/news/everything?title=agriculture&language.code=fr&per_page=10&page=${pageNumber}`;
      const res = await fetch(url, {
        headers: { "X-API-Key": Api_KEY, Accept: "application/json" },
      });
      const json = await res.json();
      const items = json?.data || json?.results || json?.articles || [];

      if (Array.isArray(items) && items.length > 0) {
        const normalized = items.map((it: any) => ({
          title: it.title || it.headline || "Titre indisponible",
          image:
            it.image ||
            it.thumbnail ||
            (it.media && it.media[0]?.url) ||
            "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
          id: it.id || it.url || Math.random().toString(36).slice(2, 9),
          url: it.url || null, // fallback null si pas d'URL
        }));
        setNews((prev) =>
          pageNumber === 1 ? normalized : [...prev, ...normalized]
        );
        setHasMore(items.length >= 10);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn("Erreur APITube :", err);
    } finally {
      setLoadingNews(false);
      setLoadingMore(false);
    }
  };

  const handleNextPage = () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNews(nextPage);
    }
  };

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNews = ({ item }: { item: NewsItem }) => (
    <View style={styles.newsCard}>
      <Image
        source={{ uri: item.image }}
        style={styles.newsImage}
        resizeMode="cover"
      />
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <TouchableOpacity
          style={[
            styles.readMoreBtn,
            !item.title && { backgroundColor: "#A5D6A7", opacity: 0.6 },
          ]}
          disabled={!item.title}
          onPress={() =>
            item.title &&
            router.push(
              {
                pathname: "/newsWebView",
                params: {
                  title: item.title,
                  image: item.image,
                },
              } as any
            )
          }
        >
          <Text style={styles.readMoreText}>Lire la suite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Backbutton />
        <Text style={styles.title}>Actualités</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#777" />
        <TextInput
          placeholder="Rechercher une actualité..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* News List */}
      {loadingNews ? (
        <ActivityIndicator
          size="large"
          color="#2E7D32"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={filteredNews}
          renderItem={renderNews}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          onEndReached={handleNextPage}
          onEndReachedThreshold={0.5}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={7}
          removeClippedSubviews
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color="#2E7D32"
                style={{ marginVertical: 10 }}
              />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E6F5E8"
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    alignSelf: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E6F5E8",
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  newsCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  newsImage: { width: "100%", height: 180, backgroundColor: "#E0E0E0" },
  newsContent: { padding: 12 },
  newsTitle: { fontSize: 16, fontWeight: "700", color: "#164A16", marginBottom: 8 },
  readMoreBtn: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#2E7D32",
    borderRadius: 6,
  },
  readMoreText: { color: "#fff", fontWeight: "600" },
});
