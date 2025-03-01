// src/services/authService.js
import apiClient from './apiClient';

const AuthService = {
  login: (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },
  
  register: (email, password, firstName, lastName, phone) => {
    return apiClient.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
      phone,
    });
  },
  
  forgotPassword: (email) => {
    return apiClient.post('/auth/forgot-password', { email });
  },
  
  resetPassword: (token, newPassword) => {
    return apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
  },
  
  logout: () => {
    // Client-side logout only
    return Promise.resolve();
  },
  
  updateFcmToken: (fcmToken) => {
    return apiClient.put('/auth/fcm-token', { fcmToken });
  },
};

export default AuthService;