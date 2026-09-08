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

const COLORS = {
  background: "#FFFFFF",
  primary: "#10B981",
  text: "#000000",
  textMuted: "#737373",
  inputBg: "#FAFAFA",
  inputBorder: "#E5E5E5",
};

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
          <View style={styles.topContainer}>
            {/* Header */}
            <Animated.View
              entering={FadeInDown.duration(400).delay(100).springify()}
              style={styles.header}
            >
              <Text style={styles.title}>Hereux de vous revoir !</Text>
              <Text style={styles.subtitle}>
                Connectez-vous pour accéder à votre espace
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View
              entering={FadeInDown.duration(500).delay(200).springify()}
              style={styles.form}
            >
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Email, téléphone ou nom d'utilisateur"
                  placeholderTextColor={COLORS.textMuted}
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Mot de passe"
                  placeholderTextColor={COLORS.textMuted}
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
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  (!identifier || !password) && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={isLoading || !identifier || !password}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Se connecter</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <View style={{ flex: 1, minHeight: 40 }} />

          {/* Footer */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(300).springify()}
            style={styles.footer}
          >
            <View style={styles.divider} />
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Pas encore de compte ?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.footerLink}> Inscrivez-vous.</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.poweredBy}>
              <Text style={styles.poweredText}> from </Text>
              <Text style={styles.poweredBrand}>Munie Group</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topContainer: {
    paddingTop: 80,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  form: {
    paddingHorizontal: 24,
    gap: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 16,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: "#A7F3D0",
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  footer: {
    alignItems: "center",
    paddingBottom: 30,
    paddingTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    width: "100%",
    marginBottom: 20,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  poweredBy: {
    flexDirection: "row",
    justifyContent: "center",
  },
  poweredText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  poweredBrand: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
});
