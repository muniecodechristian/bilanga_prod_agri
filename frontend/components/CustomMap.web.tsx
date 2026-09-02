import React from "react";
import { View, ViewStyle, StyleProp } from "react-native";

interface CustomMapProps {
  coords: { lat: number; lon: number };
  title?: string;
  style?: StyleProp<ViewStyle>;
}

export default function CustomMap({ coords, title, style }: CustomMapProps) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.05},${coords.lat - 0.05},${coords.lon + 0.05},${coords.lat + 0.05}&layer=mapnik&marker=${coords.lat},${coords.lon}`;

  return (
    <View style={style}>
      {/* @ts-ignore - iframe is valid on web */}
      <iframe
        width="100%"
        height="100%"
        src={mapUrl}
        style={{ border: 0 }}
        allowFullScreen
        title={title || "Map"}
      />
    </View>
  );
}
