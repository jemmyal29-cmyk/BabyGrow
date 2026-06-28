import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Screens
import LoginScreen from '../screens/LoginScreen_Premium'; // Premium Login
import ParentDataScreen from '../screens/RegistrationFlow/ParentDataScreen';
import ChildDataScreen from '../screens/RegistrationFlow/ChildDataScreen';
import HelpScreen from '../screens/HelpScreen';
import HomeScreen from '../screens/HomeScreenPremium'; // Premium Dashboard
import ChildrenScreen from '../screens/ChildrenScreen';
import ChildDetailScreen from '../screens/ChildDetailScreen';
import AddChildScreen from '../screens/AddChildScreen';
import GrowthScreen from '../screens/GrowthScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen_KAI'; // KAI-Inspired
import IoTDeviceScreen from '../screens/IoTDeviceScreen';
import ImmunizationScreen from '../screens/ImmunizationScreen';
import GuideScreen from '../screens/GuideScreen';

// Custom Bottom Navigation (KAI-Inspired)
import BottomNavigation from '../components/common/BottomNavigation';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator id="root-stack" screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        {/* FASE 1: Registration Flow */}
        <Stack.Screen name="ParentData" component={ParentDataScreen} />
        <Stack.Screen name="ChildData" component={ChildDataScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Help" component={HelpScreen} />
        
        {/* ANTI POP-UP: Full Page Screens */}
        <Stack.Screen 
          name="ChildDetail" 
          component={ChildDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddChild" 
          component={AddChildScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="AIAssistant" 
          component={AIAssistantScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="IoTDevice" 
          component={IoTDeviceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Immunization" 
          component={ImmunizationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Guide" 
          component={GuideScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      id="main-tabs"
      tabBar={(props) => <BottomNavigation {...props} />} // KAI-Inspired Custom Bottom Nav
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Beranda' }}
      />
      <Tab.Screen
        name="Growth"
        component={GrowthScreen}
        options={{ tabBarLabel: 'Riwayat' }}
      />
      <Tab.Screen
        name="AIAssistant"
        component={AIAssistantScreen}
        options={{ tabBarLabel: 'BabyGrow AI' }}
      />
      <Tab.Screen
        name="Immunization"
        component={ImmunizationScreen}
        options={{ tabBarLabel: 'Imunisasi' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Akun' }}
      />
    </Tab.Navigator>
  );
}
