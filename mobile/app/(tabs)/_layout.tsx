import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          height: 85,
          paddingBottom: 30,
          paddingTop: 10,
          borderTopWidth: 0,
          backgroundColor: '#0F172A',
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.1,
          shadowRadius: 15,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontWeight: '800',
          fontSize: 12,
          marginTop: -5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Icon name="view-dashboard" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Fleet Health',
          tabBarIcon: ({ color }) => <Icon name="heart-pulse" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
