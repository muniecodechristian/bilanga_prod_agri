import React, { useRef } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Animated,
  View,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/**
 * FloatingChatButton
 * Bouton flottant global pour accéder à la messagerie (FollowersChat).
 * Positionné en bas à droite, au-dessus de la tab bar.
 * Utilise une animation de pulsation (ring) pour attirer l'attention.
 */
export default function FloatingChatButton() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation de pulsation douce
  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handlePress = () => {
    router.push('/(details)/followerschat' as any);
  };

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {/* Ring pulsant derrière le bouton */}
      <Animated.View
        style={[
          styles.pulseRing,
          { transform: [{ scale: pulseAnim }] },
        ]}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={handlePress}
        activeOpacity={0.85}
        accessibilityLabel="Ouvrir la messagerie"
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 80, // juste au-dessus de la tab bar (62px height + margin)
    right: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    // ne bloque pas les interactions derrière
  },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
});
