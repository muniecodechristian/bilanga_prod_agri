import { Post, User } from "@/types";
import { formatDate, formatNumber } from "@/utils/formatters";
import { AntDesign, Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

interface PostCardProps {
  post: Post ;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onComment: (post: Post) => void;
  isLiked?: boolean;
  currentUser: User;
}

const green = "#2ECC71";

const PostCard = ({
  currentUser,
  onDelete,
  onLike,
  post,
  isLiked,
  onComment,
}: PostCardProps) => {
  const isOwnPost = post.user._id === currentUser._id;

  

  if (!post._id) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete(post._id),
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image
          source={{ uri: post.user.profilePicture || "" }}
          style={styles.avatar}
        />

        <View style={styles.flex1}>
          {/* USER INFO */}
          <View style={styles.headerRow}>
            <View style={styles.userInfoRow}>
              <Text style={styles.nameText}>
                {post.user.firstName} {post.user.lastName}
              </Text>

              <Text style={styles.metaText}>
                @{post.user.username} · {formatDate(post.createdAt)}
              </Text>
            </View>

            {isOwnPost && (
              <TouchableOpacity onPress={handleDelete}>
                <Feather name="trash" size={20} color="#657786" />
              </TouchableOpacity>
            )}
          </View>

          {/* CONTENT */}
          {post.content ? (
            <Text style={styles.postContent}>{post.content}</Text>
          ) : null}

          {/* IMAGE */}
          {post.image ? (
            <Image
              source={{ uri: post.image }}
              style={styles.postImage}
              resizeMode="cover"
            />
          ) : null}

          {/* ACTIONS */}
          <View style={styles.actionsRow}>
            {/* COMMENT */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onComment(post)}
            >
              <Feather name="message-circle" size={18} color={green} />
              <Text style={styles.iconText}>
                {formatNumber(post.comments?.length || 0)}
              </Text>
            </TouchableOpacity>

            {/* RETWEET */}
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="repeat" size={18} color="#657786" />
              <Text style={styles.iconText}>0</Text>
            </TouchableOpacity>

            {/* LIKE */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onLike(post._id)}
            >
              {isLiked ? (
                <AntDesign name="heart" size={18} color="#E0245E" />
              ) : (
                <Feather name="heart" size={18} color="#657786" />
              )}

              <Text
                style={[
                  styles.iconText,
                  isLiked && { color: "#E0245E" },
                ]}
              >
                {formatNumber(post.likes?.length || 0)}
              </Text>
            </TouchableOpacity>

            {/* SHARE */}
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="share" size={18} color="#657786" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PostCard;

// ======================
//       STYLESHEET
// ======================

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
    backgroundColor: "white",
  },

  row: {
    flexDirection: "row",
    padding: 16,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    marginRight: 12,
  },

  flex1: {
    flex: 1,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flexShrink: 1,
  },

  nameText: {
    fontWeight: "700",
    fontSize: 15,
    color: "#111827",
    marginRight: 4,
  },

  metaText: {
    color: "#6b7280",
    fontSize: 14,
  },

  postContent: {
    color: "#111827",
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },

  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    marginBottom: 12,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    maxWidth: 260,
  },

  iconButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconText: {
    color: "#6b7280",
    marginLeft: 6,
    fontSize: 13,
  },
});
