import { Stack } from "expo-router";
import React from "react";

export default function DetailsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: "Détails" }} />

      {/* Récoltes disponibles (anciennement chats) */}
      <Stack.Screen name="availableHarvests" options={{ title: "Récoltes Disponibles" }} />

      {/* Consultation IA (anciennement advice + adviceDetail) */}
      <Stack.Screen name="aiConsultation" options={{ title: "Conseiller Agricole IA" }} />

      {/* Scanner de plantes (anciennement dans tabs) */}
      <Stack.Screen name="scanner" options={{ title: "Identifier une plante" }} />

      {/* Messagerie followers */}
      <Stack.Screen
        name="followerschat"
        options={{ title: "Messages", presentation: "card" }}
      />

      {/* Chatroom individuel — à créer si besoin */}
      <Stack.Screen
        name="chatroom"
        options={{ title: "Conversation", presentation: "card" }}
      />

      <Stack.Screen name="news" options={{ title: "Actualités" }} />
      <Stack.Screen
        name="newsWebView"
        options={{
          title: "Article",
          presentation: "transparentModal",
          animation: "slide_from_bottom",
        }}
      />

      {/* Anciens écrans maintenus pour la rétrocompatibilité */}
      <Stack.Screen name="chats" options={{ href: null } as any} />
      <Stack.Screen name="advice" options={{ href: null } as any} />
      <Stack.Screen name="adviceDetail" options={{ href: null } as any} />
    </Stack>
  );
}
