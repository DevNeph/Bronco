// src/navigation/HomeStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import ProductDetailsScreen from '../screens/home/ProductDetailsScreen';
import CartScreen from '../screens/home/CartScreen';
import CheckoutScreen from '../screens/home/CheckoutScreen';
import OrderSuccessScreen from '../screens/home/OrderSuccessScreen';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: true,
        headerTintColor: '#5D4037',
      }}
    >
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Bronco Kahve',
          headerTitleStyle: { fontWeight: 'bold' },
        }} 
      />
      <Stack.Screen 
        name="ProductDetails" 
        component={ProductDetailsScreen} 
        options={{ title: 'Ürün Detayı' }} 
      />
      <Stack.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ title: 'Sepetim' }} 
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen} 
        options={{ title: 'Sipariş Onayı' }} 
      />
      <Stack.Screen 
        name="OrderSuccess" 
        component={OrderSuccessScreen} 
        options={{ 
          title: 'Sipariş Tamamlandı',
          headerLeft: () => null, // Geri butonu devre dışı bırakıldı
        }} 
      />
    </Stack.Navigator>
  );
};

export default HomeStack;