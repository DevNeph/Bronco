// src/navigation/ProfileStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';
import BalanceScreen from '../screens/profile/BalanceScreen';
import BalanceHistoryScreen from '../screens/profile/BalanceHistoryScreen';

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#5D4037',
      }}
    >
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profilim' }} 
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ title: 'Profili Düzenle' }} 
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen} 
        options={{ title: 'Şifre Değiştir' }} 
      />
      <Stack.Screen 
        name="Balance" 
        component={BalanceScreen} 
        options={{ title: 'Bakiyem' }} 
      />
      <Stack.Screen 
        name="BalanceHistory" 
        component={BalanceHistoryScreen} 
        options={{ title: 'Bakiye Geçmişi' }} 
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;