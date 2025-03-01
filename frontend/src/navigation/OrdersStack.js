// src/navigation/OrdersStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import OrdersScreen from '../screens/orders/OrdersScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';

const Stack = createNativeStackNavigator();

const OrdersStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#5D4037',
      }}
    >
      <Stack.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{ title: 'Siparişlerim' }} 
      />
      <Stack.Screen 
        name="OrderDetails" 
        component={OrderDetailsScreen} 
        options={{ title: 'Sipariş Detayı' }} 
      />
    </Stack.Navigator>
  );
};

export default OrdersStack;