import { apiClient } from './authService';

const productService = {
  // Tüm ürünleri getir
  getAllProducts: async (params = {}) => {
    try {
      const response = await apiClient.get('/products', { params });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Ürünler alınamadı';
    }
  },
  
  // İstatistiklerle birlikte ürünleri getir (admin özel endpoint)
  getProductsWithStats: async (params = {}) => {
    try {
      const response = await apiClient.get('/admin/products/stats', { params });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Ürün istatistikleri alınamadı';
    }
  },
  
  // ID'ye göre ürün getir
  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Ürün alınamadı';
    }
  },
  
  // Yeni ürün oluştur
  createProduct: async (productData) => {
    try {
      const response = await apiClient.post('/products', productData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Ürün oluşturulamadı';
    }
  },
  
  // Mevcut ürünü güncelle
  updateProduct: async (id, productData) => {
    try {
      const response = await apiClient.put(`/products/${id}`, productData);
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Ürün güncellenemedi';
    }
  },
  
  // Ürün durumunu güncelle (aktif/pasif)
  updateProductAvailability: async (id, isAvailable) => {
    try {
      const response = await apiClient.put(`/products/${id}/availability`, { isAvailable });
      return response.data.data;
    } catch (error) {
      throw error.response?.data?.message || 'Ürün durumu güncellenemedi';
    }
  },
  
  // Ürün sil
  deleteProduct: async (id) => {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Ürün silinemedi';
    }
  },
  
  // Ürün kategorilerini getir (unique kategori listesi)
  getProductCategories: async () => {
    try {
      // Bu endpoint olmayabilir, genellikle getAllProducts'dan kategorileri çıkarırız
      // Ancak admin controller'da eklediğimiz getProductsWithStats içinde categories dönüyoruz
      const response = await apiClient.get('/admin/products/stats', { params: { limit: 1 } });
      return response.data.data.categories;
    } catch (error) {
      throw error.response?.data?.message || 'Kategoriler alınamadı';
    }
  }
};

export default productService;