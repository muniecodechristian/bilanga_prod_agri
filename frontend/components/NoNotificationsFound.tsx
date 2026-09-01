import { Feather } from "@expo/vector-icons";
import { Text, View, StyleSheet } from "react-native";

const NoNotificationsFound = () => {
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Feather name="bell" size={80} color="#E1E8ED" />
        <Text style={styles.title}>Pas de notifications</Text>
        <Text style={styles.subtitle}>
         quand quelqu'un aime, commente, ou vous suive, Vous recevrez une notification.
        </Text>
      </View>
    </View>
  );
};

export default NoNotificationsFound;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    minHeight: 400,
    backgroundColor: "#F6FFF6", // Optionnel: fond similaire à ton app
  },
  inner: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#6B7280", // gris
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#9CA3AF", // gris clair
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
});
