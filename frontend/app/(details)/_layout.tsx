import { Stack } from "expo-router";
import React from "react";

export default function DetailsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "Détails" }}
      />

      <Stack.Screen
        name="chats"
        options={{ title: "Chats" }}
      />

      <Stack.Screen
        name="news"
        options={{ title: "Actualités" }}
      />

      <Stack.Screen
        name="newsWebView"
        options={{
          title: "Article",
          presentation: "transparentModal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack>
  );
}
