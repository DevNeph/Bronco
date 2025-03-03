import axios from 'axios';
import Cookies from 'js-cookie';

// API URL'yi .env dosyasından al, yoksa varsayılan değeri kullan
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

// Axios örneği oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// İstek öncesi çalışan interceptor - her istekte token ekle
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor - token yenileme, hata işleme
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Eğer hata 401 (Unauthorized) ise ve refresh token ile tekrar denemediyse
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Refresh token ile yeni bir token al
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        // Yeni tokenları kaydet
        Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 gün
        Cookies.set('refreshToken', newRefreshToken, { expires: 7 }); // 7 gün
        
        // Orjinal isteği yeni token ile tekrarla
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Token yenileme başarısız olduğunda çıkış yap
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
        
        // Eğer bir oturum sona erme callback'i varsa çağır
        if (window.onSessionExpired) {
          window.onSessionExpired();
        }
        
        // Giriş sayfasına yönlendir
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Hata mesajını ayıkla
    const errorMessage = error.response?.data?.message || error.message || 'Bir hata oluştu';
    return Promise.reject({ ...error, message: errorMessage });
  }
);

export default api;