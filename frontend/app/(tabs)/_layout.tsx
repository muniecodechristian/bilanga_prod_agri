import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import FloatingChatButton from '@/components/FloatingChatButton';
import { View } from 'react-native';

export default function TabLayout() {
  const activeColor = '#4CAF50';
  const inactiveColor = '#6B7280';

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            height: 62,
            paddingBottom: 10,
            paddingTop: 6,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarLabelStyle: {
            fontWeight: '500',
            fontSize: 10,
          },
        }}
      >
        {/* Home */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="home-filled"
                size={28}
                color={focused ? activeColor : inactiveColor}
              />
            ),
          }}
        />

        {/* Vidéos */}
        <Tabs.Screen
          name="videos"
          options={{
            title: 'Vidéos',
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="ondemand-video"
                size={26}
                color={focused ? activeColor : inactiveColor}
              />
            ),
          }}
        />

        {/* Créer — bouton central TikTok style */}
        <Tabs.Screen
          name="create"
          options={{
            title: '',
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="plus-circle"
                size={52}
                color={focused ? activeColor : '#22C55E'}
                style={{
                  position: 'absolute',
                  top: -10,
                  shadowColor: '#22C55E',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
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
            title: 'Communauté',
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="account-group"
                size={26}
                color={focused ? activeColor : inactiveColor}
              />
            ),
          }}
        />

        {/* Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Moi',
            tabBarIcon: ({ focused }) => (
              <MaterialCommunityIcons
                name="account-circle"
                size={28}
                color={focused ? activeColor : inactiveColor}
              />
            ),
          }}
        />

        {/* Écrans cachés du tab navigator — accessibles via navigation mais sans icône */}
        <Tabs.Screen name="scanner" options={{ href: null }} />
        <Tabs.Screen name="publish" options={{ href: null }} />
      </Tabs>

      {/* Floating Chat Button — visible globalement sur tous les tabs */}
      <FloatingChatButton />
    </View>
  );
}
