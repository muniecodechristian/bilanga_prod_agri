import { View, Text, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuthContext } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const { isSignedIn, isLoading } = useAuthContext();
  const [hasInternet, setHasInternet] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  // Vérifier onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      const value = await AsyncStorage.getItem("hasOnboarded");
      setHasOnboarded(value === "true");
    };
    checkOnboarding();
  }, []);

  // Vérifier connexion internet
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected === false) {
        setHasInternet(false);
        Alert.alert(
          "Connexion impossible",
          "Aucune connexion Internet. Veuillez activer vos données ou Wi-Fi.",
          [{ text: "OK" }]
        );
      } else {
        setHasInternet(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🕒 Chargement de la session
  if (isLoading || hasOnboarded === null) {
    return (
      <View style={styles.container}>
        <Animated.Image
          entering={FadeInDown.duration(400).delay(200).springify().damping(25)}
          resizeMode="contain"
          source={require("../../assets/images/scanner.png")}
          style={styles.logo}
        />

        <ActivityIndicator size="small" color="green" />

        <Animated.Text
          entering={FadeInDown.duration(500).delay(300).springify().damping(25)}
          style={{
            marginTop: 10,
            fontSize: 16,
            color: "#555",
            fontWeight: "bold",
          }}
        >
          veuillez patienter...
        </Animated.Text>

        <View style={styles.footer}>
          <Text style={styles.powered}>Powered by</Text>
          <Text style={styles.brand}>MunieGroup</Text>
        </View>
      </View>
    );
  }

  // Pas internet → message
  if (!hasInternet) {
    return (
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/anim.gif")}
          style={{ width: 120, height: 120, marginBottom: 20 }}
        />
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "red" }}>
          Pas de connexion Internet
        </Text>
      </View>
    );
  }

  // 🔐 Non connecté
  if (!isSignedIn) {
    if (hasOnboarded) {
      return <Redirect href="/(auth)/login" />;
    } else {
      return <Redirect href="/(auth)/onboarding" />;
    }
  }

  // ✅ Connecté → tabs
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  logo: {
    width: 300,
    height: 250,
    marginBottom: 25,
    borderRadius: 10,
  },
  footer: {
    position: "absolute",
    bottom: 40,
    alignItems: "center",
  },
  powered: {
    fontSize: 14,
    color: "#555",
  },
  brand: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#34A853",
    marginTop: 2,
  },
});
