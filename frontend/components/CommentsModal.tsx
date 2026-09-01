import { useComments } from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Post } from "@/types";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

interface CommentsModalProps {
  selectedPost: Post;
  onClose: () => void;
}

const CommentsModal = ({ selectedPost, onClose }: CommentsModalProps) => {
  const { commentText, setCommentText, createComment, isCreatingComment } = useComments();
  const { currentUser } = useCurrentUser();

  const handleClose = () => {
    onClose();
    setCommentText("");
  };

  return (
    <Modal visible={!!selectedPost} animationType="slide" presentationStyle="pageSheet">
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Text style={styles.closeButton}>Fermer</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Commenteurs</Text>
        <View style={{ width: 48 }} />
      </View>

      {selectedPost && (
        <ScrollView style={styles.scroll}>
          {/* ORIGINAL POST */}
          <View style={styles.postContainer}>
            <View style={styles.postRow}>
              <Image
                source={{ uri: selectedPost.user.profilePicture }}
                style={styles.avatarLarge}
              />

              <View style={styles.flex1}>
                <View style={styles.userRow}>
                  <Text style={styles.userName}>
                    {selectedPost.user.firstName} {selectedPost.user.lastName}
                  </Text>
                  <Text style={styles.userUsername}>
                    @{selectedPost.user.username}
                  </Text>
                </View>

                {selectedPost.content && (
                  <Text style={styles.postContent}>{selectedPost.content}</Text>
                )}

                {selectedPost.image && (
                  <Image
                    source={{ uri: selectedPost.image }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>
          </View>

          {/* COMMENTS */}
          {selectedPost.comments.map((comment) => (
            <View key={comment._id} style={styles.commentContainer}>
              <View style={styles.commentRow}>
                <Image
                  source={{ uri: comment.user.profilePicture }}
                  style={styles.avatarSmall}
                />

                <View style={styles.flex1}>
                  <View style={styles.commentHeaderRow}>
                    <Text style={styles.userNameSmall}>
                      {comment.user.firstName} {comment.user.lastName}
                    </Text>
                    <Text style={styles.userUsernameSmall}>
                      @{comment.user.username}
                    </Text>
                  </View>

                  <Text style={styles.commentText}>{comment.content}</Text>
                </View>
              </View>
            </View>
          ))}

          {/* ADD COMMENT */}
          <View style={styles.commentInputContainer}>
            <View style={styles.commentInputRow}>
              <Image
                source={{ uri: currentUser?.profilePicture }}
                style={styles.avatarSmall}
              />

              <View style={styles.flex1}>
                <TextInput
                  style={styles.input}
                  placeholder="Ecrivez un commentaire..."
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  style={[
                    styles.replyButton,
                    commentText.trim() ? styles.replyButtonActive : styles.replyButtonDisabled,
                  ]}
                  onPress={() => createComment(selectedPost._id)}
                  disabled={isCreatingComment || !commentText.trim()}
                >
                  {isCreatingComment ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text
                      style={[
                        styles.replyText,
                        commentText.trim() ? styles.replyTextActive : styles.replyTextDisabled,
                      ]}
                    >
                      Répondre
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </Modal>
  );
};

export default CommentsModal;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "white",
  },
  closeButton: {
    color: "#2E6B2E",
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },

  scroll: { flex: 1 },

  // Original post styles
  postContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  postRow: { flexDirection: "row" },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: 999,
    marginRight: 12,
  },
  flex1: { flex: 1 },
  userRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  userName: { fontWeight: "bold", color: "#111827", marginRight: 4 },
  userUsername: { color: "#6b7280" },
  postContent: {
    color: "#111827",
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 20,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },

  // Comments list
  commentContainer: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  commentRow: { flexDirection: "row" },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 999,
    marginRight: 12,
  },
  commentHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  userNameSmall: { fontWeight: "bold", color: "#111827", marginRight: 4 },
  userUsernameSmall: { color: "#6b7280", fontSize: 12 },
  commentText: {
    fontSize: 15,
    color: "#111827",
  },

  // Add comment
  commentInputContainer: {
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  commentInputRow: { flexDirection: "row" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  replyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  replyButtonActive: { backgroundColor: "#1d4ed8" },
  replyButtonDisabled: { backgroundColor: "#d1d5db" },
  replyText: { fontWeight: "600" },
  replyTextActive: { color: "white" },
  replyTextDisabled: { color: "#6b7280" },
});
