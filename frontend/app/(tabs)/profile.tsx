import React from "react";
import EditProfileModal from "@/components/EditProfileModal";
import PostsList from "@/components/PostsList";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePosts } from "@/hooks/usePosts";
import { useProfile } from "@/hooks/useProfile";
import { Feather } from "@expo/vector-icons";
import { format } from "date-fns";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { profileStyles as styles } from "@/GlobaleStyles/profile";

const green = "#3CB371";

const ProfileScreens = () => {
  const { currentUser, isLoading } = useCurrentUser();
  const insets = useSafeAreaInsets();

  const {
    posts: userPosts = [],
    refetch: refetchPosts,
    isLoading: isRefetching,
  } = usePosts(currentUser?.username);

  const {
    isEditModalVisible,
    openEditModal,
    closeEditModal,
    formData,
    saveProfile,
    updateFormField,
    isUpdating,
    refetch: refetchProfile,
  } = useProfile();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={green} />
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.textMuted}>Erreur de chargement de l'utilisateur</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerName}>
            {currentUser.firstName} {currentUser.lastName}
          </Text>
          <Text style={styles.textMuted}>{(userPosts || []).length} publications</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetchProfile();
              refetchPosts();
            }}
            tintColor={green}
          />
        }
      >
        <Image
          source={{
            uri:
              currentUser.bannerImage ||
              "https://images.unsplash.com/photo-1560493676-04071c5f467b",
          }}
          style={styles.banner}
          resizeMode="cover"
        />

        <View style={styles.profileSection}>
          <View style={styles.profileRow}>
            <Image
              source={{ uri: currentUser.profilePicture }}
              style={styles.profileAvatar}
            />

            <TouchableOpacity style={styles.editButton} onPress={openEditModal}>
              <Text style={styles.editButtonText}>Modifier le profil</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>
                {currentUser.firstName} {currentUser.lastName}
              </Text>
              <Feather name="check-circle" size={20} color={green} />
            </View>

            <Text style={styles.username}>@{currentUser.username}</Text>
            <Text style={styles.bio}>{currentUser.bio}</Text>

            <View style={styles.iconRow}>
              <Feather name="map-pin" size={16} color="#666" />
              <Text style={styles.textMuted}>{currentUser.location}</Text>
            </View>

            <View style={styles.iconRow}>
              <Feather name="calendar" size={16} color="#666" />
              <Text style={styles.textMuted}>
                Inscrit en {currentUser.createdAt ? format(new Date(currentUser.createdAt), "MMMM yyyy") : ""}
              </Text>
            </View>

            <View style={styles.followRow}>
              <TouchableOpacity style={styles.followItem}>
                <Text style={styles.followText}>
                  <Text style={styles.followNumber}>
                    {currentUser.following?.length || 0}
                  </Text>{" "}
                  abonnements
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.followItem}>
                <Text style={styles.followText}>
                  <Text style={styles.followNumber}>
                    {currentUser.followers?.length || 0}
                  </Text>{" "}
                  abonnés
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <PostsList username={currentUser?.username} />
      </ScrollView>
      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={closeEditModal}
        formData={formData}
        saveProfile={saveProfile}
        updateFormField={updateFormField}
        isUpdating={isUpdating}
      />
    </SafeAreaView>
  );
};

export default ProfileScreens;
