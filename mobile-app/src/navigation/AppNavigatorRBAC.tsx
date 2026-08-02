/**
 * Main App Navigator with strict RBAC
 * ROLE_USER → UserTabs only | ROLE_ADMIN → AdminTabs only | else Unauthorized
 */

import React from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth, useAuthStore } from '../store/authStore';
import type { UserRole } from '../types/auth';
import { colors, typography, borderRadius, shadows } from '../theme';

type TabIcon = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

function TabBarIcon({
  name,
  focused,
}: {
  name: TabIcon;
  focused: boolean;
}) {
  return (
    <MaterialCommunityIcons
      name={name}
      size={focused ? 26 : 24}
      color={focused ? colors.primary.main : 'rgba(94, 94, 94, 0.55)'}
    />
  );
}

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import UnauthorizedScreen from '../screens/UnauthorizedScreen';
import UserDashboardScreen from '../screens/UserDashboardScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import ChildDetailScreen from '../screens/ChildDetailScreen';
import AddChildScreen from '../screens/AddChildScreen';
import GrowthScreen from '../screens/GrowthScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AIVisionStadiometerScreen from '../screens/AIVisionStadiometerScreen';
import ManualMeasurementScreen from '../screens/ManualMeasurementScreen';
import MeasurementScreen from '../screens/MeasurementScreen';
import RecipeListScreen from '../screens/RecipeListScreen';
import GrowthChartScreen from '../screens/GrowthChartScreen';
import EditChildProfileScreen from '../screens/EditChildProfileScreen';
import ChildrenScreen from '../screens/ChildrenScreen';
import AIAssistantScreen from '../screens/AIAssistantScreen';
import HelpScreen from '../screens/HelpScreen';
import GuideScreen from '../screens/GuideScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const VALID_ROLES: UserRole[] = ['ROLE_USER', 'ROLE_ADMIN'];

function isValidRole(role: unknown): role is UserRole {
  return typeof role === 'string' && VALID_ROLES.includes(role as UserRole);
}

function AuthStack() {
  return (
    <Stack.Navigator
      id="AuthStack"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Guide" component={GuideScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
}

const userTabBar = {
  backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.92)' : colors.surface.lowest,
  borderTopWidth: 0,
  height: 72,
  paddingBottom: 12,
  paddingTop: 10,
  elevation: 0,
  borderTopLeftRadius: borderRadius.xl,
  borderTopRightRadius: borderRadius.xl,
  position: 'absolute' as const,
  ...shadows.diffusion,
};

function UserTabs() {
  return (
    <Tab.Navigator
      id="UserTabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: userTabBar,
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
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Children"
        component={ChildrenScreen}
        options={{
          tabBarLabel: 'Anak',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'baby-face' : 'baby-face-outline'}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Grafik"
        component={GrowthScreen}
        options={{
          tabBarLabel: 'Grafik',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'chart-line' : 'chart-line-variant'}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'account-circle' : 'account-circle-outline'}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/** Admin uses same surface tokens as UserTabs (no navy leak) */
function AdminTabs() {
  return (
    <Tab.Navigator
      id="AdminTabs"
      screenOptions={{
        headerShown: false,
        tabBarStyle: userTabBar,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
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
          tabBarLabel: 'Status',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'chart-box' : 'chart-box-outline'}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Children"
        component={ChildrenScreen}
        options={{
          tabBarLabel: 'Data',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'clipboard-list' : 'clipboard-list-outline'}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              name={focused ? 'account-circle' : 'account-circle-outline'}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/** Strict stack: USER never mounts AdminDashboard (and vice versa) */
function UserAppStack() {
  return (
    <Stack.Navigator id="UserStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs" component={UserTabs} />
      <Stack.Screen name="ChildDetail" component={ChildDetailScreen} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
      <Stack.Screen name="AIVisionStadiometer" component={AIVisionStadiometerScreen} />
      <Stack.Screen name="ManualMeasurement" component={ManualMeasurementScreen} />
      <Stack.Screen name="Measurement" component={MeasurementScreen} />
      <Stack.Screen name="RecipeList" component={RecipeListScreen} />
      <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Guide" component={GuideScreen} />
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
    </Stack.Navigator>
  );
}

function AdminAppStack() {
  return (
    <Stack.Navigator id="AdminStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="ChildDetail" component={ChildDetailScreen} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Guide" component={GuideScreen} />
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
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  if (!isInitialized || (isLoading && !isAuthenticated && !user)) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  let root: 'login' | 'unauthorized' | 'admin' | 'user' = 'login';
  if (isAuthenticated && user) {
    if (!isValidRole(role)) root = 'unauthorized';
    else if (role === 'ROLE_ADMIN') root = 'admin';
    else root = 'user';
  } else if (isAuthenticated && !user) {
    root = 'unauthorized';
  }

  return (
    <NavigationContainer>
      <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
        {root === 'login' ? (
          <Stack.Screen name="AuthRoot" component={AuthStack} />
        ) : root === 'unauthorized' ? (
          <Stack.Screen name="Unauthorized" component={UnauthorizedScreen} />
        ) : root === 'admin' ? (
          <Stack.Screen name="AdminRoot" component={AdminAppStack} />
        ) : (
          <Stack.Screen name="UserRoot" component={UserAppStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.default,
  },
});
