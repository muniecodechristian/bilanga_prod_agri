import { Alert } from "react-native";
import { router } from "expo-router";
import { useAuthContext } from "@/context/AuthContext";

export const useSignOut = () => {
  const { logout } = useAuthContext();

  const handleSignOut = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  return { handleSignOut };
};
