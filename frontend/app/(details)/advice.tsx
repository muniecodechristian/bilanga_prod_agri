import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

interface FruitItem {
  id: number;
  name: string;
  emoji: string;
}

const fruits: FruitItem[] = [
  { id: 1, name: "Apple", emoji: "🍎" },
  { id: 2, name: "Banana", emoji: "🍌" },
  { id: 3, name: "Cherry", emoji: "🍒" },
  { id: 4, name: "Grapes", emoji: "🍇" },
  { id: 5, name: "Lemon", emoji: "🍋" },
  { id: 6, name: "Mango", emoji: "🥭" },
  { id: 7, name: "Orange", emoji: "🍊" },
  { id: 8, name: "Strawberry", emoji: "🍓" },
];

export default function FruitsScreen() {
  const router = useRouter();

  const handlePress = (fruit: FruitItem) => {
    router.push({
      pathname: "/(details)/chats",
      params: { fruitName: fruit.name },
    } as any);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Fruit</Text>
      <FlatList
        data={fruits}
        keyExtractor={(item) => item.id.toString()}
        numColumns={4}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handlePress(item)}
          >
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 16, textAlign: "center" },
  row: { justifyContent: "space-between", marginBottom: 16 },
  card: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    marginHorizontal: 4,
    backgroundColor: "#E9F6EA",
    borderRadius: 12,
  },
  emoji: { fontSize: 36 },
  name: { marginTop: 8, fontWeight: "600", color: "#163916" },
});
