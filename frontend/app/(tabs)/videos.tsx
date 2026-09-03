import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import { useApiClient, videoApi } from '@/utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import CommentModal from '@/components/CommentModal';

const { height: windowHeight, width: windowWidth } = Dimensions.get('window');
const ITEM_HEIGHT = windowHeight - 80;

// ─── Single Video Item ────────────────────────────────────────────────────────
const VideoItem = React.memo(({ item, isVisible, onLikePress, onCommentPress }: any) => {
  const player = useVideoPlayer(item.videoUrl, p => {
    p.loop = true;
  });

  const [hasLiked, setHasLiked] = useState(item.hasLiked || false);
  const [likesCount, setLikesCount] = useState(item.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(item.commentsCount || 0);

  React.useEffect(() => {
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible, player]);

  const handleLike = () => {
    // Optimistic update
    setHasLiked(!hasLiked);
    setLikesCount((prev: number) => (hasLiked ? prev - 1 : prev + 1));
    onLikePress(item._id);
  };

  const handleCommentAdded = () => {
    setCommentsCount((prev: number) => prev + 1);
  };

  return (
    <View style={[styles.videoContainer, { height: ITEM_HEIGHT }]}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        contentFit="cover"
      />

      {/* Gradient Overlay Bottom */}
      <View style={styles.gradientOverlay} />

      {/* Bottom Left: User + Caption */}
      <View style={styles.overlayBottom}>
        <Text style={styles.username}>@{item.user?.username || 'agriculteur'}</Text>
        {item.caption ? <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text> : null}
      </View>

      {/* Right: Action Buttons */}
      <View style={styles.overlayRight}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {item.user?.username?.charAt(0).toUpperCase() || 'A'}
            </Text>
          </View>
          <View style={styles.followDot}>
            <Ionicons name="add" size={10} color="white" />
          </View>
        </View>

        {/* Like */}
        <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
          <Ionicons name={hasLiked ? 'heart' : 'heart-outline'} size={38} color={hasLiked ? '#EF4444' : 'white'} />
          <Text style={styles.actionCount}>{likesCount}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={styles.actionBtn} onPress={() => onCommentPress(item, handleCommentAdded)}>
          <Ionicons name="chatbubble-ellipses-outline" size={34} color="white" />
          <Text style={styles.actionCount}>{commentsCount}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="arrow-redo-outline" size={34} color="white" />
          <Text style={styles.actionCount}>{item.sharesCount || 0}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function VideosScreen() {
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentVideo, setCommentVideo] = useState<any>(null);
  const [commentCallback, setCommentCallback] = useState<(() => void) | null>(null);

  // React Query — Infinite Feed
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['videoFeed'],
    queryFn: ({ pageParam = 1 }) => videoApi.getFeed(api, pageParam, 5).then(r => r.data),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 5 ? allPages.length + 1 : undefined,
    initialPageParam: 1,
  });

  const videos = data?.pages.flat() ?? [];

  // Like Mutation
  const likeMutation = useMutation({
    mutationFn: (videoId: string) => videoApi.toggleLike(api, videoId),
  });

  const handleLike = (videoId: string) => {
    likeMutation.mutate(videoId);
  };

  const handleOpenComments = (video: any, onCommentAdded: () => void) => {
    setCommentVideo(video);
    setCommentCallback(() => onCommentAdded);
  };

  const handleCloseComments = () => {
    setCommentVideo(null);
    setCommentCallback(null);
  };

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      setActiveIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 60 }).current;

  // ── States ──
  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Chargement des vidéos...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.loadingScreen}>
        <Ionicons name="wifi-outline" size={60} color="#6B7280" />
        <Text style={[styles.loadingText, { marginTop: 16 }]}>Erreur de connexion</Text>
      </View>
    );
  }

  if (videos.length === 0) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={{ fontSize: 40 }}>🌾</Text>
        <Text style={[styles.loadingText, { marginTop: 16 }]}>Aucune vidéo publiée.</Text>
        <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 8 }}>
          Sois le premier à partager !
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="black" />
      <FlatList
        data={videos}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <VideoItem
            item={item}
            isVisible={activeIndex === index}
            onLikePress={handleLike}
            onCommentPress={handleOpenComments}
          />
        )}
        pagingEnabled
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={{ height: ITEM_HEIGHT, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator color="#10B981" />
            </View>
          ) : null
        }
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />

      {/* Comments Modal */}
      <CommentModal
        visible={!!commentVideo}
        videoId={commentVideo?._id ?? null}
        onClose={handleCloseComments}
        onCommentAdded={() => commentCallback?.()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12,
  },
  videoContainer: {
    width: windowWidth,
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden',
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // On simule un gradient en bas avec une vue semi-transparente
    borderTopWidth: 0,
    top: '50%',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    width: '68%',
  },
  username: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  caption: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  overlayRight: {
    position: 'absolute',
    right: 12,
    bottom: 24,
    alignItems: 'center',
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  followDot: {
    position: 'absolute',
    bottom: -8,
    alignSelf: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  actionBtn: {
    alignItems: 'center',
    marginBottom: 22,
  },
  actionCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
