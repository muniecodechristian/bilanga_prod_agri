import { View, Text, TouchableOpacity ,StyleSheet} from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

const Backbutton = () => {
  return (
    
    <TouchableOpacity
          onPress={() => router.back()}
          style={styles.containerbutton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
      
  )
}

export default Backbutton 

const styles = StyleSheet.create({
containerbutton: {
   marginHorizontal: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",

    // Ombre iOS
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

    // Ombre Android
    elevation: 6,
  },
})