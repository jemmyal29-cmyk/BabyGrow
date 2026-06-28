import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

// Simple test screens
function HomeTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🍼</Text>
      <Text style={styles.title}>BabyGrow</Text>
      <Text style={styles.subtitle}>Home Screen Working!</Text>
    </View>
  );
}

function ChildrenTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👶</Text>
      <Text style={styles.title}>Anak</Text>
      <Text style={styles.subtitle}>Children Screen Working!</Text>
    </View>
  );
}

function GrowthTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>📊</Text>
      <Text style={styles.title}>Grafik</Text>
      <Text style={styles.subtitle}>Growth Screen Working!</Text>
    </View>
  );
}

function ProfileTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👤</Text>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.subtitle}>Profile Screen Working!</Text>
    </View>
  );
}

export default function AppNavigatorSimple() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        id="SimpleTabs"
        screenOptions={{
          tabBarActiveTintColor: '#FF69B4',
          tabBarInactiveTintColor: '#999',
          headerShown: false,
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeTestScreen}
          options={{
            tabBarLabel: 'Beranda',
            tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
          }}
        />
        <Tab.Screen 
          name="Children" 
          component={ChildrenTestScreen}
          options={{
            tabBarLabel: 'Anak',
            tabBarIcon: () => <Text style={{ fontSize: 24 }}>👶</Text>,
          }}
        />
        <Tab.Screen 
          name="Growth" 
          component={GrowthTestScreen}
          options={{
            tabBarLabel: 'Grafik',
            tabBarIcon: () => <Text style={{ fontSize: 24 }}>📊</Text>,
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileTestScreen}
          options={{
            tabBarLabel: 'Profil',
            tabBarIcon: () => <Text style={{ fontSize: 24 }}>👤</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF69B4',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
});
