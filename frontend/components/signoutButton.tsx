import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native'
import React from 'react'
import { useAuthContext } from '@/context/AuthContext'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'

 export const signoutButton = () => {

    const router = useRouter();



 const { logout } = useAuthContext()

   const handleLogout = () => {
  Alert.alert(
    "Déconnexion",
    "Voulez-vous vraiment vous déconnecter ?",
    [
      {
        text: "Annuler",
        style: "cancel",
      },
      {
        text: "Déconnexion",
        onPress: async () => {
          try {
            await logout();         // Déconnexion JWT
            router.replace("/(auth)"); // Redirection immédiate
          } catch (error) {
            console.log("Erreur logout :", error);
          }
        },
      },
    ],
    { cancelable: true }
  );
};


  return (
     <TouchableOpacity
            onPress={() => handleLogout()}
           style={styles.iconRound}>
            <Text style={{ fontSize: 18 }}> <Ionicons name="power-sharp" size={24} color="green" /></Text>
          </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
    iconRound: {
    backgroundColor: "#E9F6EA",
    padding: 10,
    borderRadius: 12,
  },
})

export default signoutButton

