// src/navigation/AdminStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import OrderManagementScreen from '../screens/admin/OrderManagementScreen';
import AdminOrderDetailsScreen from '../screens/admin/AdminOrderDetailsScreen';
import ScanQRScreen from '../screens/admin/ScanQRScreen';

const Stack = createNativeStackNavigator();

const AdminStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: '#5D4037',
      }}
    >
      <Stack.Screen 
        name="AdminDashboard" 
        component={AdminDashboardScreen} 
        options={{ title: 'Admin Panel' }} 
      />
      <Stack.Screen 
        name="OrderManagement" 
        component={OrderManagementScreen} 
        options={{ title: 'Sipariş Yönetimi' }} 
      />
      <Stack.Screen 
        name="AdminOrderDetails" 
        component={AdminOrderDetailsScreen} 
        options={{ title: 'Sipariş Detayı' }} 
      />
      <Stack.Screen 
        name="ScanQR" 
        component={ScanQRScreen} 
        options={{ title: 'QR Kod Tara' }} 
      />
    </Stack.Navigator>
  );
};

export default AdminStack;