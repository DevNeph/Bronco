import { useState, useEffect, useContext, createContext } from 'react';
import Cookies from 'js-cookie';
import api from '../services/api';

// Authentication context
const AuthContext = createContext(null);

// Provider bileşeni
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // İlk yükleme sırasında kullanıcı bilgisini kontrol et
  useEffect(() => {
    const initAuth = async () => {
      const userCookie = Cookies.get('user');
      const token = Cookies.get('accessToken');
      
      if (userCookie && token) {
        try {
          // Cookie'den kullanıcı bilgisini al
          setUser(JSON.parse(userCookie));
          
          // İsteğe bağlı: token'ın geçerliliğini kontrol et
          await api.get('/users/me');
        } catch (err) {
          console.error('Token validation failed:', err);
          Cookies.remove('user');
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Admin girişi
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = response.data.data;
      
      // Kullanıcı admin değilse hata ver
      if (!user.isAdmin) {
        throw new Error('Bu panel sadece yöneticiler içindir');
      }
      
      // Token ve kullanıcı bilgilerini kaydet
      Cookies.set('accessToken', accessToken, { expires: 1 }); // 1 gün
      Cookies.set('refreshToken', refreshToken, { expires: 7 }); // 7 gün
      Cookies.set('user', JSON.stringify(user), { expires: 7 });
      
      setUser(user);
      return user;
    } catch (err) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Çıkış yap
  const logout = () => {
    Cookies.remove('user');
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    setUser(null);
  };

  // Kullanıcı profilini güncelle
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/users/me', userData);
      const updatedUser = response.data.data;
      
      // Cookie'deki kullanıcı bilgisini güncelle
      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
      setUser(updatedUser);
      
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Profil güncellenirken bir hata oluştu');
      throw err;
    }
  };

  // Auth context değeri
  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user && user.isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Auth hook'u
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth hook must be used within an AuthProvider');
  }
  
  return context;
};

export default useAuth;