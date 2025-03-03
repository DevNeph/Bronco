import { apiClient } from './authService';

const orderService = {
  // Tüm siparişleri getir (admin)
  getAllOrders: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/orders', { params });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Siparişler alınamadı';
    }
  },
  
  // ID'ye göre sipariş detaylarını getir
  getOrderById: async (id) => {
    try {
      const response = await apiClient.get(`/admin/orders/${id}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Sipariş detayları alınamadı';
    }
  },
  
  // Sipariş durumunu güncelle
  updateOrderStatus: async (id, status) => {
    try {
      const response = await apiClient.put(`/admin/orders/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Sipariş durumu güncellenemedi';
    }
  },
  
  // Bugünün sipariş istatistiklerini getir
  getTodayOrderStats: async () => {
    try {
      // Tarih parametresiyle API'den bugünkü siparişleri getir
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatı
      const response = await apiClient.get(`/admin/orders`, { 
        params: { 
          startDate: today,
          endDate: today
        } 
      });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Sipariş istatistikleri alınamadı';
    }
  }
};

export default orderService;