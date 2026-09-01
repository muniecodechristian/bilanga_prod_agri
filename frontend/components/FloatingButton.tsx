import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function FloatingButton() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.push("/garden" as any)}
        style={styles.button}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name="plus"
          size={32}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom:6,
    
    alignSelf: "center",
    zIndex: 10,
  },
  button: {
    backgroundColor: "#4CAF50",
    width: 60,
    height: 60,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 8,
  },
});
