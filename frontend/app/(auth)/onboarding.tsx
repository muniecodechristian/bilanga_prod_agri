import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import Swiper from 'react-native-swiper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: 1,
    title: 'Analyse par IA',
    description: 'Diagnostiquez vos cultures en un instant grâce à la puissance de l\'intelligence artificielle.',
    image: require('../../assets/images/scan.png'),
    colors: ['#2c7744', '#4f6643ff',],
  },
  {
    id: 2,
    title: 'Assistant Personnel',
    description: 'Discutez avec notre IA pour obtenir des conseils agricoles sur mesure, 24/7.',
    image: require('../../assets/images/Chat.png'),
    colors: ['#56ab2f', '#2c7744'],
  },
  {
    id: 3,
    title: 'Actualités & Vidéos',
    description: 'Restez informé des dernières tendances agricoles et regardez des astuces en vidéo.',
    image: require('../../assets/images/Nature.png'),
    colors: ['#63b97eff', '#000',],
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
          <LinearGradient
            key={slide.id}
            colors={slide.colors}
            style={styles.slide}
          >
            <View style={styles.imageContainer}>
              <Animated.Image
                source={slide.image}
                style={styles.image}
                resizeMode="contain"
                entering={FadeInDown.duration(600).delay(100 * index).springify()}
              />
            </View>
            <Animated.View
              style={styles.textContainer}
              entering={FadeInUp.duration(600).delay(200).springify()}
            >
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.description}>{slide.description}</Text>
            </Animated.View>
          </LinearGradient>
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
    backgroundColor: '#fff',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  dot: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    marginBottom: 80,
  },
  activeDot: {
    backgroundColor: '#ffffff',
    width: 24,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    marginBottom: 80,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  nextText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c7744',
  }
});
