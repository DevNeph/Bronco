// src/navigation/LoyaltyStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoyaltyScreen from '../screens/loyalty/LoyaltyScreen';

const Stack = createNativeStackNavigator();

const LoyaltyStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#5D4037',
      }}
    >
      <Stack.Screen 
        name="Loyalty" 
        component={LoyaltyScreen} 
        options={{ title: 'Sadakat Programı' }} 
      />
    </Stack.Navigator>
  );
};

export default LoyaltyStack;