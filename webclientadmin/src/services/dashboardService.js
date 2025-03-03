import { apiClient } from './authService';

const dashboardService = {
  getDashboardStats: async () => {
    try {
      const response = await apiClient.get('/admin/dashboard/stats');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'İstatistikler alınamadı';
    }
  },
  
  getProductsWithStats: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/products/stats', { params });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Ürün istatistikleri alınamadı';
    }
  },
  
  getUserStats: async () => {
    try {
      const response = await apiClient.get('/admin/users/stats');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Kullanıcı istatistikleri alınamadı';
    }
  },
  
  getBalanceStats: async () => {
    try {
      const response = await apiClient.get('/admin/balance/stats');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Bakiye istatistikleri alınamadı';
    }
  },
  
  getLoyaltyStats: async () => {
    try {
      const response = await apiClient.get('/admin/loyalty/stats');
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Sadakat istatistikleri alınamadı';
    }
  }
};

export default dashboardService;