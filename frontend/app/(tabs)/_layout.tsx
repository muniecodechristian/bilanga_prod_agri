import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const activeColor = '#4CAF50';
  const inactiveColor = 'black';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#F6FFF6',
          borderTopWidth: 0,
          height: 57,
          paddingBottom: 12,
        },
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarLabelStyle: {
          fontWeight: "200",
        },
      }}
    >
      {/* Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <MaterialIcons
              name="home-filled"
              size={28}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />

      {/* Scanner */}
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'prendre une photo',
          tabBarIcon: ({ focused }) => (
            <FontAwesome5
              name="qrcode"
              size={28}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />

      {/* Create — style TikTok */}
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={50} // PLUS GRAND
              color={focused ? activeColor : inactiveColor}
              style={{
                position: "absolute",
                top: -6,
                left: -8,
                right: -20 // monte l'icône au-dessus du tab bar
              }}
            />
          ),
          tabBarLabel: () => null,
        }}
      />

      {/* Communauté */}
      <Tabs.Screen
        name="community"
        options={{
          title: 'communauté',
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="account-group"
              size={28}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />

      {/* Publier */}
      <Tabs.Screen
        name="publish"
        options={{
          title: 'publish',
          href: null, // Désactive navigation auto, agit comme un bouton
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={32}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />

      {/* Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'moi',
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="account"
              size={32}
              color={focused ? activeColor : inactiveColor}
            />
          ),
        }}
      />
    </Tabs>
  );
}
