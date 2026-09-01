import { Notification } from "@/types";
import { formatDate } from "@/utils/formatters";
import { Feather } from "@expo/vector-icons";
import { View, Text, Alert, Image, TouchableOpacity, StyleSheet } from "react-native";

interface NotificationCardProps {
  notification: Notification;
  onDelete: (notificationId: string) => void;
}

const NotificationCard = ({ notification, onDelete }: NotificationCardProps) => {
  const getNotificationText = () => {
    const name = `${notification.from.firstName} ${notification.from.lastName}`;
    switch (notification.type) {
      case "like":
        return `${name} a aimé votre publication`;
      case "comment":
        return `${name} a commenté votre publication`;
      case "follow":
        return `${name} a commencé à vous suivre`;
      default:
        return "";
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return <Feather name="heart" size={20} color="#E0245E" />;
      case "comment":
        return <Feather name="message-circle" size={20} color="#1DA1F2" />;
      case "follow":
        return <Feather name="user-plus" size={20} color="#17BF63" />;
      default:
        return <Feather name="bell" size={20} color="#657786" />;
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Supprimer la notification",
      "Êtes-vous sûr de vouloir supprimer cette notification ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => onDelete(notification._id),
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: notification.from.profilePicture }} style={styles.avatar} />
          <View style={styles.iconOverlay}>{getNotificationIcon()}</View>
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.username}>
                <Text style={styles.bold}>
                  {notification.from.firstName} {notification.from.lastName}
                </Text>
                <Text style={styles.handle}> @{notification.from.username}</Text>
              </Text>
              <Text style={styles.text}>{getNotificationText()}</Text>
            </View>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Feather name="trash" size={16} color="#E0245E" />
            </TouchableOpacity>
          </View>

          {notification.post && (
            <View style={styles.postContainer}>
              <Text style={styles.postText} numberOfLines={3}>
                {notification.post.content}
              </Text>
              {notification.post.image && (
                <Image
                  source={{ uri: notification.post.image }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              )}
            </View>
          )}

          {notification.comment && (
            <View style={styles.commentContainer}>
              <Text style={styles.commentLabel}>Commentaire :</Text>
              <Text style={styles.commentText} numberOfLines={2}>
                &ldquo;{notification.comment.content}&rdquo;
              </Text>
            </View>
          )}

          <Text style={styles.date}>{formatDate(notification.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
};

export default NotificationCard;

const styles = StyleSheet.create({
  card: { borderBottomWidth: 1, borderBottomColor: "#F3F4F6", backgroundColor: "#fff" },
  row: { flexDirection: "row", padding: 12 },
  avatarContainer: { marginRight: 12, position: "relative" },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  iconOverlay: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  username: { color: "#111827", fontSize: 14, marginBottom: 2 },
  bold: { fontWeight: "600" },
  handle: { color: "#6B7280" },
  text: { color: "#374151", fontSize: 13, marginBottom: 4 },
  deleteBtn: { marginLeft: 8, padding: 4 },
  postContainer: { backgroundColor: "#F9FAFB", borderRadius: 8, padding: 8, marginBottom: 8 },
  postText: { color: "#374151", fontSize: 13, marginBottom: 4 },
  postImage: { width: "100%", height: 128, borderRadius: 8, marginTop: 4 },
  commentContainer: { backgroundColor: "#DBEAFE", borderRadius: 8, padding: 8, marginBottom: 4 },
  commentLabel: { fontSize: 11, color: "#4B5563", marginBottom: 2 },
  commentText: { fontSize: 13, color: "#374151" },
  date: { fontSize: 11, color: "#9CA3AF" },
});
