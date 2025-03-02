// src/services/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Determine the base URL based on platform and environment
let API_URL;

if (Platform.OS === 'android') {
  // For Android Emulator
  API_URL = 'http://10.0.2.2:4000/api/v1';
} else if (Platform.OS === 'ios') {
  // For iOS in Expo Go, use the actual IP
  API_URL = 'http://192.168.0.152:4000/api/v1';
} else {
  // For web
  API_URL = 'http://localhost:4000/api/v1';
}

console.log(`Using API URL: ${API_URL} for platform: ${Platform.OS}`);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Request interceptor for adding token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
      const tokensStr = await AsyncStorage.getItem('tokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        if (tokens.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`;
          console.log('Token added to request');
        }
      }
      return config;
    } catch (error) {
      console.error('Error in request interceptor:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for refreshing token
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response received from ${response.config.url} with status: ${response.status}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`API Error: ${error.config?.url} status ${error.response.status}`);
    } else if (error.request) {
      console.error(`API Error: ${error.config?.url} ${error.message}`);
    } else {
      console.error(`API Error: ${error.message}`);
    }
    
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Attempting to refresh token...');
        const tokensStr = await AsyncStorage.getItem('tokens');
        if (tokensStr) {
          const tokens = JSON.parse(tokensStr);
          
          // Try to refresh the token
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken: tokens.refreshToken,
          });
          
          const newTokens = {
            accessToken: response.data.data.accessToken,
            refreshToken: response.data.data.refreshToken,
          };
          
          // Save new tokens
          await AsyncStorage.setItem('tokens', JSON.stringify(newTokens));
          console.log('Token refreshed successfully');
          
          // Retry with new token
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.message);
        
        // If refresh fails, logout user
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('tokens');
        
        // This will be handled by the app's navigation in practice
        console.log('Logged out due to authentication failure');
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;