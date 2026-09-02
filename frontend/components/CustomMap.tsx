import React from "react";
import MapView, { Marker } from "react-native-maps";
import { ViewStyle, StyleProp } from "react-native";

interface CustomMapProps {
  coords: { lat: number; lon: number };
  title?: string;
  style?: StyleProp<ViewStyle>;
}

export default function CustomMap({ coords, title, style }: CustomMapProps) {
  return (
    <MapView
      style={style}
      initialRegion={{
        latitude: coords.lat,
        longitude: coords.lon,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      <Marker
        coordinate={{
          latitude: coords.lat,
          longitude: coords.lon,
        }}
        title={title}
      />
    </MapView>
  );
}
