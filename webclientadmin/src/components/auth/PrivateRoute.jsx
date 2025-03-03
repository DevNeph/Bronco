import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!isAdmin) {
    // Redirect to unauthorized page if not admin
    authService.logout();
    return <Navigate to="/login" state={{ error: 'Yetkisiz erişim. Bu sayfa sadece admin kullanıcılar içindir.' }} replace />;
  }
  
  return children;
};

export default PrivateRoute;