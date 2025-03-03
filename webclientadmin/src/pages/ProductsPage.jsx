import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';

// Yardımcı bileşenler oluşturalım
const ProductTable = ({ products, onEdit, onToggleAvailability, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ürün
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kategori
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fiyat
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Satış
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Durum
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              İşlemler
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img 
                      className="h-10 w-10 rounded-full object-cover" 
                      src={product.imageUrl || `https://via.placeholder.com/40?text=${product.name.charAt(0)}`} 
                      alt={product.name} 
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {product.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {parseFloat(product.price).toLocaleString('tr-TR')} ₺
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.totalSold || 0} adet
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  product.isAvailable 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.isAvailable ? 'Aktif' : 'Pasif'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                  onClick={() => onEdit(product.id)} 
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Düzenle
                </button>
                <button 
                  onClick={() => onToggleAvailability(product.id, !product.isAvailable)} 
                  className={`${
                    product.isAvailable ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                  } mr-4`}
                >
                  {product.isAvailable ? 'Pasif Yap' : 'Aktif Yap'}
                </button>
                <button 
                  onClick={() => onDelete(product.id)} 
                  className="text-red-600 hover:text-red-900"
                >
                  Sil
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  // Ürünleri yükle
  const loadProducts = async (page = 1, filters = {}) => {
    setLoading(true);
    
    try {
      const params = {
        page,
        limit: 10,
        ...filters
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      const data = await productService.getProductsWithStats(params);
      setProducts(data.products);
      setCategories(data.categories);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError('Ürünler yüklenirken bir hata oluştu: ' + err.toString());
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde ürünleri getir
  useEffect(() => {
    loadProducts();
  }, []);

  // Filtre değiştiğinde ürünleri yeniden yükle
  useEffect(() => {
    loadProducts(1, { search: searchTerm, category: selectedCategory });
  }, [searchTerm, selectedCategory]);

  // Ürün düzenleme sayfasına git
  const handleEditProduct = (id) => {
    navigate(`/products/${id}`);
  };

  // Ürün durumunu değiştir
  const handleToggleAvailability = async (id, isAvailable) => {
    try {
      await productService.updateProductAvailability(id, isAvailable);
      
      // Ürün listesini güncelle
      setProducts(products.map(product => 
        product.id === id 
          ? { ...product, isAvailable } 
          : product
      ));
    } catch (err) {
      setError('Ürün durumu güncellenirken bir hata oluştu: ' + err.toString());
    }
  };

  // Ürün sil
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      return;
    }
    
    try {
      await productService.deleteProduct(id);
      
      // Ürün listesini güncelle
      setProducts(products.filter(product => product.id !== id));
    } catch (err) {
      setError('Ürün silinirken bir hata oluştu: ' + err.toString());
    }
  };

  // Arama terimini değiştir
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Kategori filtresini değiştir
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Sayfa değiştir
  const handlePageChange = (page) => {
    loadProducts(page, { search: searchTerm, category: selectedCategory });
  };

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
        <button
          onClick={() => navigate('/products/new')}
          className="bg-brown-600 hover:bg-brown-700 text-white px-4 py-2 rounded-md"
        >
          Yeni Ürün Ekle
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {/* Filtreler */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Ara
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Ürün adı..."
              className="shadow-sm focus:ring-brown-500 focus:border-brown-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div className="w-full md:w-64">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="shadow-sm focus:ring-brown-500 focus:border-brown-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map(category => (
                <option key={category.category} value={category.category}>
                  {category.category} ({category.count})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ürün Tablosu */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brown-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="mt-2 text-gray-500">Ürün bulunamadı</p>
            <button
              onClick={() => navigate('/products/new')}
              className="mt-4 bg-brown-600 hover:bg-brown-700 text-white px-4 py-2 rounded-md"
            >
              Yeni Ürün Ekle
            </button>
          </div>
        ) : (
          <ProductTable
            products={products}
            onEdit={handleEditProduct}
            onToggleAvailability={handleToggleAvailability}
            onDelete={handleDeleteProduct}
          />
        )}
      </div>

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Önceki</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => handlePageChange(idx + 1)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === idx + 1
                    ? 'text-brown-600 bg-brown-50 border-brown-500 z-10'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <span className="sr-only">Sonraki</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;