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
import { Feather, MaterialIcons } from "@expo/vector-icons";
import { useAuthContext } from "@/context/AuthContext";
import type { UserRole } from "@/context/AuthContext";

const COLORS = {
  background: "#FFFFFF",
  primary: "#10B981",
  text: "#000000",
  textMuted: "#737373",
  inputBg: "#FAFAFA",
  inputBorder: "#E5E5E5",
};

type IdentifierType = "email" | "phone";

export default function SignupScreen() {
  const { register } = useAuthContext();

  const [identifierType, setIdentifierType] = useState<IdentifierType>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole>("client");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!username.trim()) {
      return Alert.alert("Erreur", "Le nom d'utilisateur est requis.");
    }
    if (identifierType === "email" && !email.trim()) {
      return Alert.alert("Erreur", "L'email est requis.");
    }
    if (identifierType === "phone" && !phone.trim()) {
      return Alert.alert("Erreur", "Le numéro de téléphone est requis.");
    }
    if (password.length < 6) {
      return Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
    }
    if (password !== confirmPassword) {
      return Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
    }

    setIsLoading(true);
    try {
      await register({
        email: identifierType === "email" ? email.trim() : undefined,
        phone: identifierType === "phone" ? phone.trim() : undefined,
        username: username.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
      });
      router.replace("/(tabs)");
    } catch (error: any) {
      const message =
        error?.response?.data?.error || "Erreur lors de la création du compte.";
      Alert.alert("Erreur", message);
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
          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>

          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(100).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>Créer un compte</Text>
            <Text style={styles.subtitle}>
              Rejoignez la communauté agricole Bilang'App
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(200).springify()}
            style={styles.form}
          >
            {/* Email / Phone segmented control */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segment,
                  identifierType === "email" && styles.segmentActive,
                ]}
                onPress={() => setIdentifierType("email")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    identifierType === "email" && styles.segmentTextActive,
                  ]}
                >
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segment,
                  identifierType === "phone" && styles.segmentActive,
                ]}
                onPress={() => setIdentifierType("phone")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    identifierType === "phone" && styles.segmentTextActive,
                  ]}
                >
                  Téléphone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email or Phone input */}
            {identifierType === "email" ? (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            ) : (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Numéro de téléphone"
                  placeholderTextColor={COLORS.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            )}

            {/* Username */}
            <View style={styles.inputWrapper}>
              <Text style={styles.atSign}>@</Text>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Nom d'utilisateur"
                placeholderTextColor={COLORS.textMuted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            {/* Prénom & Nom */}
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Prénom"
                  placeholderTextColor={COLORS.textMuted}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Nom"
                  placeholderTextColor={COLORS.textMuted}
                  value={lastName}
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Mot de passe"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
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

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={COLORS.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            {/* Role segmented control */}
            <Text style={styles.sectionLabel}>Je suis</Text>
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[styles.segment, role === "client" && styles.segmentActive]}
                onPress={() => setRole("client")}
              >
                <MaterialIcons
                  name="shopping-cart"
                  size={15}
                  color={role === "client" ? COLORS.primary : COLORS.textMuted}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.segmentText,
                    role === "client" && styles.segmentTextActive,
                  ]}
                >
                  Acheteur
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segment,
                  role === "proprietaire" && styles.segmentActive,
                ]}
                onPress={() => setRole("proprietaire")}
              >
                <MaterialIcons
                  name="agriculture"
                  size={15}
                  color={role === "proprietaire" ? COLORS.primary : COLORS.textMuted}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.segmentText,
                    role === "proprietaire" && styles.segmentTextActive,
                  ]}
                >
                  Propriétaire
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Créer mon compte</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(300).springify()}
            style={styles.footer}
          >
            <View style={styles.divider} />
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Déjà un compte ?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text style={styles.footerLink}> Connectez-vous.</Text>
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
    paddingBottom: 40,
  },
  backButton: {
    padding: 20,
    paddingBottom: 0,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: -0.5,
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
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    overflow: "hidden",
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
  },
  segmentActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.primary,
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
  atSign: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginRight: 6,
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
  row: {
    flexDirection: "row",
    gap: 10,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 24,
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
