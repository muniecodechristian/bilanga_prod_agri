import { useCreatePost } from "@/hooks/useCreatePost";
import { useAuthContext } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

const green = "#2ECC71";

const PostComposer = () => {
  const {
    content,
    setContent,
    selectedImage,
    isCreating,
    pickImageFromGallery,
    takePhoto,
    removeImage,
    createPost,
  } = useCreatePost();

  const { user } = useAuthContext();

  return (
    <View style={styles.container}>
      {/* Composer Row */}
      <View style={styles.row}>
        <Image source={{ uri: user?.profilePicture }} style={styles.avatar} />

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Que voulez-vous partager ?"
            placeholderTextColor="#657786"
            multiline
            value={content}
            onChangeText={setContent}
            maxLength={280}
          />
        </View>
      </View>

      {/* Selected Image */}
      {selectedImage && (
        <View style={styles.imageWrapper}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.selectedImage}
              resizeMode="cover"
            />

            <TouchableOpacity
              style={styles.removeButton}
              onPress={removeImage}
            >
              <Feather name="x" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.bottomRow}>
        <View style={styles.iconRow}>
          <TouchableOpacity style={styles.iconButton} onPress={pickImageFromGallery}>
            <Feather name="image" size={20} color={green} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
            <Feather name="camera" size={20} color={green} />
          </TouchableOpacity>
        </View>

        <View style={styles.postRow}>
          {content.length > 0 && (
            <Text
              style={[
                styles.charCount,
                content.length > 260 && styles.charCountDanger,
              ]}
            >
              {280 - content.length}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.postButton,
              content.trim() || selectedImage
                ? styles.postButtonActive
                : styles.postButtonDisabled,
            ]}
            onPress={createPost}
            disabled={isCreating || !(content.trim() || selectedImage)}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text
                style={[
                  styles.postText,
                  content.trim() || selectedImage
                    ? styles.postTextActive
                    : styles.postTextDisabled,
                ]}
              >
                Poster
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostComposer;

// =====================
//      STYLESHEET
// =====================

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    padding: 16,
    backgroundColor: "white",
  },

  row: {
    flexDirection: "row",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 999,
    marginRight: 12,
  },

  inputWrapper: {
    flex: 1,
  },

  input: {
    color: "#111827",
    fontSize: 18,
  },

  imageWrapper: {
    marginTop: 12,
    marginLeft: 60,
  },

  imageContainer: {
    position: "relative",
  },

  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },

  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  bottomRow: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  iconRow: {
    flexDirection: "row",
  },

  iconButton: {
    marginRight: 16,
  },

  postRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  charCount: {
    fontSize: 14,
    marginRight: 12,
    color: "#6b7280",
  },

  charCountDanger: {
    color: "#ef4444",
  },

  postButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 999,
  },

  postButtonActive: {
    backgroundColor: green,
  },

  postButtonDisabled: {
    backgroundColor: "#d1d5db",
  },

  postText: {
    fontSize: 16,
    fontWeight: "600",
  },

  postTextActive: {
    color: "white",
  },

  postTextDisabled: {
    color: "#6b7280",
  },
});
