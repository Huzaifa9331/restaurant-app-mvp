// Bottom tabs + nested stacks. Role-based tab, themed, with a loading gate for AsyncStorage.
import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import MenuScreen from '../screens/MenuScreen';
import CartScreen from '../screens/CartScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import ReservationScreen from '../screens/ReservationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ManagerDashboardScreen from '../screens/ManagerDashboardScreen';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';
import { useOrders } from '../context/OrdersContext';
import { useReservationStore } from '../context/ReservationContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const icon = (emoji) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

function MenuStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MenuList" component={MenuScreen} options={{ title: 'Menu' }} />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="CartHome" component={CartScreen} options={{ title: 'Your Cart' }} />
      <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{ title: 'Order Summary' }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { itemCount } = useCart();
  return (
    <Tab.Navigator
      initialRouteName={user.role === 'manager' ? 'DashboardTab' : 'MenuTab'}
      screenOptions={{ tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.subtext }}
    >
      <Tab.Screen name="MenuTab" component={MenuStack} options={{ title: 'Menu', headerShown: false, tabBarIcon: icon('🍽️') }} />
      <Tab.Screen name="CartTab" component={CartStack} options={{ title: 'Cart', headerShown: false, tabBarIcon: icon('🛒'), tabBarBadge: itemCount > 0 ? itemCount : undefined }} />
      <Tab.Screen name="ReserveTab" component={ReservationScreen} options={{ title: 'Reserve', headerTitle: 'Reserve a Table', tabBarIcon: icon('📅') }} />
      <Tab.Screen name="OrdersTab" component={OrderTrackingScreen} options={{ title: 'Orders', headerTitle: 'Order Tracking', tabBarIcon: icon('🧾') }} />
      {user.role === 'manager' && (
        <Tab.Screen name="DashboardTab" component={ManagerDashboardScreen} options={{ title: 'Dashboard', headerTitle: 'Manager Dashboard', tabBarIcon: icon('📊') }} />
      )}
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile', tabBarIcon: icon('👤') }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();
  const { isDark, colors } = useTheme();
  const menuLoaded = useMenu().isLoaded;
  const ordersLoaded = useOrders().isLoaded;
  const reservationsLoaded = useReservationStore().isLoaded;

  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return { ...base, colors: { ...base.colors, primary: colors.primary, background: colors.bg, card: colors.card, text: colors.text, border: colors.border } };
  }, [isDark, colors]);

  // Never flash empty data: wait until every AsyncStorage load has finished.
  if (!(menuLoaded && ordersLoaded && reservationsLoaded)) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.subtext, marginTop: 12 }}>Loading your restaurant...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? (
        <MainTabs />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
