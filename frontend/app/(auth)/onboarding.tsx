import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Analyse par IA',
    description: 'Diagnostiquez vos cultures en un instant grâce à la puissance de l\'intelligence artificielle.',
    // A relevant agriculture/scan lottie url
    lottieSource: { uri: 'https://lottie.host/80dc3d48-8df0-4b36-a367-27af72e27bcf/kG1YJg4P1q.json' },
  },
  {
    id: 2,
    title: 'Assistant Personnel',
    description: 'Discutez avec notre IA pour obtenir des conseils agricoles sur mesure, 24/7.',
    // A relevant chat/assistant lottie url
    lottieSource: { uri: 'https://lottie.host/76231e3d-71b5-41e9-92db-5c62ec96f30d/274aP8H8Hh.json' },
  },
  {
    id: 3,
    title: 'Actualités & Vidéos',
    description: 'Restez informé des dernières tendances agricoles et regardez des astuces en vidéo.',
    // A relevant news/video/agriculture lottie url
    lottieSource: { uri: 'https://lottie.host/362547b7-6ec7-463d-b4b6-e2a23b3a6c22/RMBmD31hLz.json' },
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<Swiper>(null);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    router.replace('/(auth)/login');
  };

  const handleSkip = () => {
    finishOnboarding();
  };

  const handleNext = () => {
    if (activeIndex < slides.length - 1) {
      swiperRef.current?.scrollBy(1);
    } else {
      finishOnboarding();
    }
  };

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        loop={false}
        showsPagination={true}
        dot={<View style={styles.dot} />}
        activeDot={<Animated.View style={styles.activeDot} entering={FadeInUp} />}
        onIndexChanged={(index) => setActiveIndex(index)}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.imageContainer}>
              <Animated.View entering={FadeInDown.duration(600).delay(100 * index).springify()}>
                <LottieView
                  source={slide.lottieSource}
                  autoPlay
                  loop
                  style={styles.lottie}
                />
              </Animated.View>
            </View>
            
            <Animated.View
              style={styles.textContainer}
              entering={FadeInUp.duration(600).delay(200).springify()}
            >
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </Animated.View>
          </View>
        ))}
      </Swiper>

      {/* Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextText}>
            {activeIndex === slides.length - 1 ? 'Commencer' : 'Suivant'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean white background
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    flex: 0.55,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  lottie: {
    width: width * 0.85,
    height: width * 0.85,
  },
  textContainer: {
    flex: 0.45,
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937', // Dark gray for high contrast
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    color: '#6B7280', // Lighter elegant gray
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  dot: {
    backgroundColor: '#E5E7EB',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginBottom: 100,
  },
  activeDot: {
    backgroundColor: '#10B981', // Brand green
    width: 24,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    marginBottom: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  skipButton: {
    padding: 12,
  },
  skipText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#10B981', // Brand green for primary action
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF', // White text on green button
  }
});
