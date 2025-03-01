// src/navigation/MainNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// Navigators
import HomeStack from './HomeStack';
import OrdersStack from './OrdersStack';
import LoyaltyStack from './LoyaltyStack';
import ProfileStack from './ProfileStack';
import AdminStack from './AdminStack';

// Theme
import { colors } from '../utils/theme';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.isAdmin || false;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeStack') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'OrdersStack') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'LoyaltyStack') {
            iconName = focused ? 'gift' : 'gift-outline';
          } else if (route.name === 'ProfileStack') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'AdminStack') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStack} 
        options={{ tabBarLabel: 'Ana Sayfa' }}
      />
      <Tab.Screen 
        name="OrdersStack" 
        component={OrdersStack} 
        options={{ tabBarLabel: 'Siparişler' }}
      />
      <Tab.Screen 
        name="LoyaltyStack" 
        component={LoyaltyStack} 
        options={{ tabBarLabel: 'Sadakat' }}
      />
      <Tab.Screen 
        name="ProfileStack" 
        component={ProfileStack} 
        options={{ tabBarLabel: 'Profil' }}
      />
      {isAdmin && (
        <Tab.Screen 
          name="AdminStack" 
          component={AdminStack} 
          options={{ tabBarLabel: 'Admin' }}
        />
      )}
    </Tab.Navigator>
  );
};

export default MainNavigator;