import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Auth
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/auth/PrivateRoute';

// Main Pages
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import ProductCreatePage from './pages/ProductCreatePage';
import ProductEditPage from './pages/ProductEditPage';
import UsersPage from './pages/UsersPage';
import UserDetailsPage from './pages/UserDetailsPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <PrivateRoute>
          <MainLayout />
        </PrivateRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        <Route path="products">
          <Route index element={<ProductsPage />} />
          <Route path="new" element={<ProductCreatePage />} />
          <Route path=":id" element={<ProductEditPage />} />
        </Route>
        
        <Route path="users">
          <Route index element={<UsersPage />} />
          <Route path=":id" element={<UserDetailsPage />} />
        </Route>
        
        <Route path="orders">
          <Route index element={<OrdersPage />} />
          <Route path=":id" element={<OrderDetailsPage />} />
        </Route>
        
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
