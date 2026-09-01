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

const green = "#2E7D32";
const lightGreen = "#E6F4EA";
const accent = "#34A853";

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
    // Validation
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
          {/* Header */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(100).springify()}
            style={styles.header}
          >
            <Text style={styles.title}>Créer un compte 🌱</Text>
            <Text style={styles.subtitle}>
              Rejoignez notre communauté agricole
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.duration(500).delay(200).springify()}
            style={styles.form}
          >
            {/* Sélecteur de type d'identifiant */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>S'inscrire avec</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    identifierType === "email" && styles.toggleButtonActive,
                  ]}
                  onPress={() => setIdentifierType("email")}
                >
                  <Feather
                    name="mail"
                    size={15}
                    color={identifierType === "email" ? "#fff" : green}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      identifierType === "email" && styles.toggleTextActive,
                    ]}
                  >
                    Email
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    identifierType === "phone" && styles.toggleButtonActive,
                  ]}
                  onPress={() => setIdentifierType("phone")}
                >
                  <Feather
                    name="phone"
                    size={15}
                    color={identifierType === "phone" ? "#fff" : green}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      identifierType === "phone" && styles.toggleTextActive,
                    ]}
                  >
                    Téléphone
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Email ou Téléphone */}
            {identifierType === "email" ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="mail" size={18} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="jean@example.com"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Numéro de téléphone</Text>
                <View style={styles.inputWrapper}>
                  <Feather name="phone" size={18} color="#888" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+243 000 000 000"
                    placeholderTextColor="#aaa"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}

            {/* Nom d'utilisateur */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom d'utilisateur *</Text>
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputIcon, { color: "#888", fontSize: 16 }]}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="jean_agri"
                  placeholderTextColor="#aaa"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Prénom & Nom */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Prénom</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Jean"
                    placeholderTextColor="#aaa"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Nom</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Dupont"
                    placeholderTextColor="#aaa"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            </View>

            {/* Mot de passe */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mot de passe *</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min. 6 caractères"
                  placeholderTextColor="#aaa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#888" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmer mot de passe */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe *</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#aaa"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
              </View>
            </View>

            {/* Rôle */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Je suis</Text>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "client" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("client")}
                >
                  <MaterialIcons
                    name="shopping-cart"
                    size={20}
                    color={role === "client" ? "#fff" : green}
                  />
                  <Text style={[styles.roleText, role === "client" && styles.roleTextActive]}>
                    Acheteur / Client
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.roleButton,
                    role === "proprietaire" && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole("proprietaire")}
                >
                  <MaterialIcons
                    name="agriculture"
                    size={20}
                    color={role === "proprietaire" ? "#fff" : green}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === "proprietaire" && styles.roleTextActive,
                    ]}
                  >
                    Propriétaire
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bouton inscription */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Créer mon compte</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Lien vers login */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(300).springify()}
            style={styles.footer}
          >
            <Text style={styles.footerText}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.footerLink}> Se connecter</Text>
            </TouchableOpacity>
          </Animated.View>

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
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
    marginTop: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: green,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 5,
  },
  label: {
    fontSize: 12,
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
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#222",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 10,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: green,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  toggleButtonActive: {
    backgroundColor: green,
  },
  toggleText: {
    color: green,
    fontSize: 14,
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#fff",
  },
  roleRow: {
    flexDirection: "row",
    gap: 10,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: green,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  roleButtonActive: {
    backgroundColor: green,
  },
  roleText: {
    color: green,
    fontSize: 13,
    fontWeight: "600",
  },
  roleTextActive: {
    color: "#fff",
  },
  button: {
    backgroundColor: accent,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
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
    marginTop: 24,
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
    marginTop: 24,
  },
  poweredText: {
    color: "#aaa",
    fontSize: 12,
  },
  poweredBrand: {
    color: accent,
    fontSize: 12,
    fontWeight: "700",
  },
});
