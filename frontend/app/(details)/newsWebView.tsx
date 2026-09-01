import React from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

export default function NewsWebView() {
  const { title, image } = useLocalSearchParams<{ title: string; image: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: image }} style={styles.image} />
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.containerbutton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <Text style={styles.title}>{title}</Text>
      </ScrollView>

      <StatusBar hidden />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageWrapper: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 400,
    resizeMode: "cover",
  },
  content: {
    marginTop: -28,
    padding: 16,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    lineHeight: 28,
  },
  containerbutton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
});
