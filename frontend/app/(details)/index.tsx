import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import useWeather from "@/hooks/useWeather";
import { useRouter } from "expo-router";

export default function MeteoScreen() {
  const router = useRouter();
  const { weather, forecast, loading, permissionDenied, requestLocation } =
    useWeather();

  useEffect(() => {
    requestLocation();
  }, []);

  const fakeForecast = [
    { dt: Date.now() / 1000, temp: 27, weather: [{ icon: "04d" }] },
    { dt: Date.now() / 1000 + 3600, temp: 28, weather: [{ icon: "10d" }] },
    { dt: Date.now() / 1000 + 7200, temp: 29, weather: [{ icon: "01d" }] },
    { dt: Date.now() / 1000 + 10800, temp: 26, weather: [{ icon: "03d" }] },
  ];

  if (permissionDenied) {
    return (
      <View style={styles.center}>
        <Ionicons name="location" size={60} color="#ff4444" />
        <Text style={styles.title}>Localisation désactivée</Text>
        <Text style={styles.subtitle}>
          Active la localisation pour afficher la météo exacte de ta position.
        </Text>

        <TouchableOpacity style={styles.btn} onPress={requestLocation}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.btnText}>Autoriser la localisation</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={{ marginTop: 10 }}>Chargement de la météo...</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.center}>
        <Text>Impossible de charger les météo</Text>
        <TouchableOpacity style={styles.btn} onPress={requestLocation}>
          {loading ? (
            <ActivityIndicator size="small" color="green" />
          ) : (
            <Text style={styles.btnText}>Recharger</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#2E7D32", "#E9F6EA"]} style={styles.container}>
      {/* BOUTON RETOUR */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ---- TEMPERATURE ACTUELLE ---- */}
      <View style={styles.mainCard}>
        <Text style={styles.city}>
          <Ionicons name="location" size={22} color="#fff" /> {weather.city}
        </Text>

        <View style={styles.tempRow}>
          <Image
            style={styles.mainIcon}
            source={{
              uri: `https://openweathermap.org/img/wn/${weather.icon}@4x.png`,
            }}
          />
        </View>

        <View>
          <Text style={styles.temp}>{Math.round(weather.temp)}°C</Text>
        </View>

        <Text style={styles.desc}>{weather?.desc}</Text>

        <View style={styles.extraRow}>
          <View style={styles.extraItem}>
            <Ionicons name="water" size={22} color="#fff" />
            <Text style={styles.extraText}>{weather?.humidity}%</Text>
          </View>

          <View style={styles.extraItem}>
            <Ionicons name="leaf" size={22} color="#fff" />
            <Text style={styles.extraText}>{weather.wind} km/h</Text>
          </View>
        </View>
      </View>

      {/* ---- PREVISIONS HORAIRES ---- */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, marginTop: 15 }}
        data={forecast && forecast.length > 0 ? forecast : fakeForecast}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.hourCard}>
            <Text style={styles.hour}>
              {new Date(item.dt * 1000).getHours()}h
            </Text>

            <Image
              style={{ width: 45, height: 45 }}
              source={{
                uri: `https://openweathermap.org/img/wn/${item.weather[0].icon}.png`,
              }}
            />

            <Text style={styles.hourTemp}>{Math.round(item.temp)}°</Text>
          </View>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 999,
    backgroundColor: "rgba(0,0,0,0.2)",
    padding: 10,
    borderRadius: 50,
  },
  mainCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    margin: 15,
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
  },
  city: {
    fontSize: 30,
    fontWeight: "900",
    color: "#fff",
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  mainIcon: {
    width: 130,
    height: 130,
  },
  temp: {
    fontSize: 75,
    fontWeight: "800",
    color: "#fff",
    marginLeft: -10,
  },
  desc: {
    fontSize: 20,
    color: "#f1f1f1",
    marginTop: -10,
    textTransform: "capitalize",
  },
  extraRow: {
    flexDirection: "row",
    marginTop: 15,
  },
  extraItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
  },
  extraText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 18,
    fontWeight: "600",
  },
  hourCard: {
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginRight: 12,
    borderRadius: 20,
    alignItems: "center",
    width: 85,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    height: 160,
  },
  hour: {
    fontWeight: "700",
    marginBottom: 5,
    color: "#fff",
    fontSize: 16,
  },
  hourTemp: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginTop: 5,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 22, fontWeight: "700", marginTop: 10 },
  subtitle: {
    textAlign: "center",
    color: "#555",
    marginVertical: 10,
    fontSize: 15,
  },
  btn: {
    backgroundColor: "green",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
  },
  btnText: { color: "white", fontWeight: "700" },
});
