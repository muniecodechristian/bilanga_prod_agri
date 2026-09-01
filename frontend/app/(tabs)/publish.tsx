import React from "react";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import NoNotificationsFound from "../../components/NoNotificationsFound";
import { useNotifications } from "../../hooks/useNotifications";
import { Notification } from "../../types";
import NotificationCard from "../../components/NotificationCard"; // Assure-toi que ce composant existe

const NotificationsScreen = () => {
  const { notifications, isLoading, error, refetch, isRefetching, deleteNotification } =
    useNotifications();

  const insets = useSafeAreaInsets();

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erreur de récupération des notifications</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Feather name="settings" size={24} color="#657786" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="green" />
        }
      >
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#1DA1F2" />
            <Text style={styles.loadingText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <NoNotificationsFound />
        ) : (
          notifications.map((notification: Notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onDelete={deleteNotification}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  errorText: { color: "#6B7280", marginBottom: 12, fontSize: 16 },
  retryBtn: {
    backgroundColor: "#3B82F6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "600" },
  loadingText: { color: "#6B7280", marginTop: 12, fontSize: 16 },
});
