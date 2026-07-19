/**
 * Main App Navigator with RBAC
 * Single navigator — Role-Based Access Control for USER and ADMIN
 */

import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth, useIsAdmin } from '../store/authStore';
import { colors, typography } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import UserDashboardScreen from '../screens/UserDashboardScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ChildDetailScreen from '../screens/ChildDetailScreen';
import AddChildScreen from '../screens/AddChildScreen';
import GrowthScreen from '../screens/GrowthScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AIVisionStadiometerScreen from '../screens/AIVisionStadiometerScreen';
import ManualMeasurementScreen from '../screens/ManualMeasurementScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import GrowthChartScreen from '../screens/GrowthChartScreen';
import EditChildProfileScreen from '../screens/EditChildProfileScreen';
import ChildrenScreen from '../screens/ChildrenScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function UserTabs() {
  return (
    <Tab.Navigator
      id="UserTabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface.lowest,
          borderTopWidth: 1,
          borderTopColor: colors.border.divider,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semiBold,
        },
      }}
    >
      <Tab.Screen
        name="UserDashboard"
        component={UserDashboardScreen}
        options={{
          tabBarLabel: 'Beranda',
          tabBarIcon: () => <Text>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="Children"
        component={ChildrenScreen}
        options={{
          tabBarLabel: 'Anak',
          tabBarIcon: () => <Text>👶</Text>,
        }}
      />
      <Tab.Screen
        name="Grafik"
        component={GrowthScreen}
        options={{
          tabBarLabel: 'Grafik',
          tabBarIcon: () => <Text>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      id="AdminTabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.admin.tabBar,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.primary.fixedDim,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.55)',
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semiBold,
        },
      }}
    >
      <Tab.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: () => <Text>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Children"
        component={ChildrenScreen}
        options={{
          tabBarLabel: 'Data',
          tabBarIcon: () => <Text>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAuth();
  const isAdmin = useIsAdmin();

  return (
    <NavigationContainer>
      <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : isAdmin ? (
          <>
            <Stack.Screen name="AdminTabs" component={AdminTabs} />
            <Stack.Screen name="ChildDetail" component={ChildDetailScreen} />
            <Stack.Screen name="AddChild" component={AddChildScreen} />
            <Stack.Screen
              name="GrowthChart"
              component={GrowthChartScreen}
              options={{ animation: 'slide_from_right', animationDuration: 300 }}
            />
            <Stack.Screen
              name="EditChildProfile"
              component={EditChildProfileScreen}
              options={{ animation: 'slide_from_bottom', animationDuration: 400 }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="UserTabs" component={UserTabs} />
            <Stack.Screen name="ChildDetail" component={ChildDetailScreen} />
            <Stack.Screen name="AddChild" component={AddChildScreen} />
            <Stack.Screen name="AIVisionStadiometer" component={AIVisionStadiometerScreen} />
            <Stack.Screen name="ManualMeasurement" component={ManualMeasurementScreen} />
            <Stack.Screen name="RecipeList" component={RecipeListScreen} />
            <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
            <Stack.Screen
              name="GrowthChart"
              component={GrowthChartScreen}
              options={{ animation: 'slide_from_right', animationDuration: 300 }}
            />
            <Stack.Screen
              name="EditChildProfile"
              component={EditChildProfileScreen}
              options={{ animation: 'slide_from_bottom', animationDuration: 400 }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
