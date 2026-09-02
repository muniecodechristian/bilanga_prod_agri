import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, ImageBackground } from "react-native";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    title: "Actualités Agricoles",
    image: require("../assets/images/anim.gif"),
  },
  {
    id: 2,
    title: "Scanner une Plante",
    image: require("../assets/images/back.jpg"),
  },
  {
    id: 3,
    title: "Conseils Agricoles",
    image: require("../assets/images/back2.jpg"),
  },
];

const Slider = () => {
  const [current, setCurrent] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const slide = slides[current];

  return (
    <View style={styles.container}>
      <ImageBackground
        source={slide.image}
        style={styles.slide}
        imageStyle={styles.image}
      >
        <View style={styles.overlay} />
        <Text style={styles.title}>{slide.title}</Text>
      </ImageBackground>

      {/* Dots */}
      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === current && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
};

export default Slider;

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
    height: 180,
    marginVertical: 10,
  },
  slide: {
    width: width - 32,
    height: 170,
    alignSelf: "center",
    justifyContent: "flex-end",
    padding: 16,
  },
  image: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 16,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    backgroundColor: "rgba(255,255,255,0.4)",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#27ae60",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
