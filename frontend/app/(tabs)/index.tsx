import { useNotifications } from "@/hooks/useNotifications";

import { useAuthContext } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import SignoutButton from "@/components/signoutButton";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
  ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import useWeather from "@/hooks/useWeather";
import Slider from "@/components/swiper";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { styles } from "@/GlobaleStyles/styles";

interface ExtraCard {
  id: number;
  title: string;
  icon: ImageSourcePropType;
  route: string;
}

const extraCards: ExtraCard[] = [
  {
    id: 6,
    title: "Actualités Agricoles",
    icon: require("../../assets/images/news.png"),
    route: "/(details)/news",
  },
  {
    id: 7,
    title: "Scanner une Plante",
    icon: require("../../assets/images/scanner.png"),
    route: "/scanner",
  },
  {
    id: 8,
    title: "Conseils Agricoles",
    icon: require("../../assets/images/conseils.png"),
    route: "/(details)/index",
  },
  {
    id: 9,
    title: "Récoltes disponibles",
    icon: require("../../assets/images/splash.png"),
    route: "/(details)/chats",
  },
];

export default function HomeScreen() {
  const { isSignedIn } = useAuthContext();
  const router = useRouter();
  const { notifications } = useNotifications();
  const { weather, loading, permissionDenied, requestLocation } = useWeather();

  useEffect(() => {
    requestLocation();
  }, [permissionDenied]);



  const windSpeed = weather?.wind || 0;
  const humidity = weather?.humidity || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/publish")}
            style={styles.iconRound}
          >
            <Ionicons name="notifications" size={24} color="green" />
            {notifications && notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>
                  {notifications.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <SignoutButton />
        </View>

        <Slider />

        <Pressable
          onPress={() => router.push("/(details)")}
        >
          <LinearGradient
            colors={["#1B5E20", "#81C784"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.weatherCard}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={{
                  uri: weather?.icon
                    ? `https://openweathermap.org/img/wn/${weather.icon}@4x.png`
                    : "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
                }}
                style={styles.weatherIcon}
              />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.weatherTemp}>
                  {weather ? `${Math.round(weather.temp)}°C` : <ActivityIndicator size="small" color="#fff" />}
                </Text>
                <Text style={styles.weatherCity}>
                  <Ionicons name="location" color="white" />{" "}
                  {weather ? weather.city : "Localisation désactivée"}
                </Text>
                <Text style={styles.weatherDesc}>{weather?.desc ?? ""}</Text>
                <View style={styles.weatherStats}>
                  <View style={styles.statItem}>
                    <Ionicons name="water" size={18} color="#fff" />
                    <Text style={styles.statText}>{humidity}%</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="leaf" size={18} color="#fff" />
                    <Text style={styles.statText}>{windSpeed} km/h</Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={requestLocation}
              style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        </Pressable>

        <View style={{ marginTop: 20 }}>
          <View style={styles.gridContainer}>
            {extraCards.map((card, index) => (
              <Animated.View
                key={card.id}
                style={styles.gridCard}
                entering={FadeInDown.duration(400).delay(index * 200).springify().damping(25)}
              >
                <TouchableOpacity onPress={() => router.push(card.route as any)}>
                  <Image source={card.icon} style={styles.catIcon} />
                  <Text style={styles.gridTitle}>{card.title}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
