import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuthContext } from "@/context/AuthContext";

const green = "#2E7D32";
const lightGreen = "#E6F4EA";
const accent = "#34A853";

export default function LoginScreen() {
  const { login } = useAuthContext();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert("Champs requis", "Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    try {
      await login({ identifier: identifier.trim(), password });
      router.replace("/(tabs)");
    } catch (error: any) {
      const message =
        error?.response?.data?.error ||
        "Identifiant ou mot de passe incorrect. Veuillez réessayer.";
      Alert.alert("Erreur de connexion", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(100).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>Bienvenue </Text>
            <Text style={styles.subtitle}>
              Connectez-vous pour accéder à votre espace
            </Text>
          </Animated.View>

          {/* Formulaire */}
          <Animated.View
            entering={FadeInDown.duration(500).delay(200).springify()}
            style={styles.form}
          >
            {/* Identifiant */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email, téléphone ou nom d'utilisateur</Text>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={18} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="ex: jean@example.com ou +243..."
                  placeholderTextColor="#aaa"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Mot de passe */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#aaa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={18}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bouton connexion */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Se connecter</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Lien vers inscription */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(300).springify()}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Pas encore de compte ?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={styles.footerLink}> S'inscrire</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Powered by */}
          <View style={styles.poweredBy}>
            <Text style={styles.poweredText}>Powered by </Text>
            <Text style={styles.poweredBrand}>Munie Group</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightGreen,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    marginBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: green,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: green,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#d0e8d0",
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#222",
  },
  eyeButton: {
    padding: 4,
  },
  button: {
    backgroundColor: accent,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 28,
  },
  footerText: {
    color: "#555",
    fontSize: 15,
  },
  footerLink: {
    color: accent,
    fontSize: 15,
    fontWeight: "700",
  },
  poweredBy: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
  },
  poweredText: {
    color: "#aaa",
    fontSize: 13,
  },
  poweredBrand: {
    color: accent,
    fontSize: 13,
    fontWeight: "700",
  },
});
