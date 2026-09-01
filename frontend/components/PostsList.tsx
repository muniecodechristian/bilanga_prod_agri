import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { Post } from "@/types";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import PostCard from "./PostCard";
import { useState } from "react";
import CommentsModal from "./CommentsModal";

const green = "#2ECC71";

const PostsList = ({ username }: { username?: string }) => {
  const { currentUser } = useCurrentUser();
  const {
    posts=[],
    isLoading,
    error,
    refetch,
    toggleLike,
    deletePost,
    checkIsLiked,
  } = usePosts(username);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const selectedPost = selectedPostId
    ? posts.find((p: Post) => p._id === selectedPostId)
    : null;

  // LOADING STATE
  if (isLoading) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={green} />
        <Text style={styles.loadingText}>chargement des posts...</Text>
      </View>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.errorText}>erreur de chargement des posts</Text>

        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Ressayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // EMPTY STATE
  if (posts.length === 0) {
    return (
      <View style={styles.centerBox}>
        <Text style={styles.emptyText}>pas de post pour l'instant.</Text>
      </View>
    );
  }

  // POSTS LIST
  return (
    <>
      {posts.map((post: Post) => (
        <PostCard
          key={post?._id}
          post={post}
          onLike={toggleLike}
          onDelete={deletePost}
          onComment={(p: Post) => setSelectedPostId(p?._id)}
          currentUser={currentUser}
          isLiked={checkIsLiked(post.likes, currentUser)}
        />
      ))}

      <CommentsModal
        selectedPost={selectedPost}
        onClose={() => setSelectedPostId(null)}
      />
    </>
  );
};

export default PostsList;

// ======================
//       STYLESHEET
// ======================

const styles = StyleSheet.create({
  centerBox: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 8,
    color: "#6b7280",
    fontSize: 15,
  },

  errorText: {
    marginBottom: 12,
    color: "#6b7280",
    fontSize: 16,
  },

  retryButton: {
    backgroundColor: green,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },

  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },

  emptyText: {
    color: "#6b7280",
    fontSize: 15,
  },
});
