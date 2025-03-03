// src/services/apiClient.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Üretim ortamında canlı backend URL'si
let API_URL = 'https://nephslair.net/api/v1';

console.log(`Using API URL: ${API_URL} for platform: ${Platform.OS}`);

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 saniye zaman aşımı
});

// İstek interceptor'u: Her isteğe token ekler
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

// Yanıt interceptor'u: Token yenileme işlemi yapar
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
    
    // 401 hatası alındıysa ve token yenilemeyi henüz denemediysek
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        console.log('Attempting to refresh token...');
        const tokensStr = await AsyncStorage.getItem('tokens');
        if (tokensStr) {
          const tokens = JSON.parse(tokensStr);
          
          // Token yenileme isteği
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken: tokens.refreshToken,
          });
          
          const newTokens = {
            accessToken: response.data.data.accessToken,
            refreshToken: response.data.data.refreshToken,
          };
          
          // Yeni tokenları kaydet
          await AsyncStorage.setItem('tokens', JSON.stringify(newTokens));
          console.log('Token refreshed successfully');
          
          // Yeniden deneme
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError.message);
        
        // Yenileme başarısızsa kullanıcıyı çıkışa zorla
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('tokens');
        console.log('Logged out due to authentication failure');
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
