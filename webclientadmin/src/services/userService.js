import api from './api';

// Kullanıcı servislerini içeren nesne
const userService = {
  /**
   * Tüm kullanıcıları getir
   * @param {Object} params - Sayfalama ve filtreleme parametreleri
   * @returns {Promise} - Kullanıcı listesi
   */
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data.data;
  },
  
  /**
   * Belirli bir kullanıcıyı ID'ye göre getir
   * @param {string} userId - Kullanıcı ID'si
   * @returns {Promise} - Kullanıcı detayları
   */
  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data.data;
  },
  
  /**
   * Kullanıcı istatistiklerini getir
   * @returns {Promise} - Kullanıcı istatistikleri
   */
  getUserStats: async () => {
    const response = await api.get('/admin/users/stats');
    return response.data.data;
  },
  
  /**
   * Yeni admin kullanıcısı oluştur
   * @param {Object} userData - Kullanıcı bilgileri
   * @returns {Promise} - Oluşturulan kullanıcı
   */
  createAdminUser: async (userData) => {
    const response = await api.post('/admin/users/admin', userData);
    return response.data.data;
  },
  
  /**
   * Kullanıcıyı güncelle
   * @param {string} userId - Kullanıcı ID'si
   * @param {Object} userData - Güncellenecek kullanıcı bilgileri
   * @returns {Promise} - Güncellenmiş kullanıcı
   */
  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data.data;
  },
  
  /**
   * Kullanıcı durumunu güncelle (aktif/pasif)
   * @param {string} userId - Kullanıcı ID'si
   * @param {boolean} isActive - Kullanıcı durumu
   * @returns {Promise} - İşlem sonucu
   */
  updateUserStatus: async (userId, isActive) => {
    const response = await api.put(`/admin/users/${userId}/status`, { isActive });
    return response.data.data;
  },
  
  /**
   * Kullanıcı şifresini sıfırla
   * @param {string} userId - Kullanıcı ID'si
   * @returns {Promise} - İşlem sonucu
   */
  resetUserPassword: async (userId) => {
    const response = await api.post(`/admin/users/${userId}/reset-password`);
    return response.data.data;
  },
  
  /**
   * Kullanıcının sipariş geçmişini getir
   * @param {string} userId - Kullanıcı ID'si
   * @param {Object} params - Sayfalama parametreleri
   * @returns {Promise} - Sipariş listesi
   */
  getUserOrders: async (userId, params = {}) => {
    const response = await api.get(`/admin/users/${userId}/orders`, { params });
    return response.data.data;
  },
  
  /**
   * Kullanıcının bakiye geçmişini getir
   * @param {string} userId - Kullanıcı ID'si
   * @param {Object} params - Sayfalama parametreleri
   * @returns {Promise} - Bakiye işlem listesi
   */
  getUserBalanceHistory: async (userId, params = {}) => {
    const response = await api.get(`/admin/users/${userId}/balance/history`, { params });
    return response.data.data;
  },
  
  /**
   * Kullanıcıya bakiye ekle
   * @param {string} userId - Kullanıcı ID'si
   * @param {number} amount - Eklenecek bakiye miktarı
   * @param {string} description - İşlem açıklaması
   * @returns {Promise} - İşlem sonucu
   */
  addUserBalance: async (userId, amount, description) => {
    const response = await api.post(`/admin/users/${userId}/balance/add`, {
      amount,
      description
    });
    return response.data.data;
  }
};

export default userService;