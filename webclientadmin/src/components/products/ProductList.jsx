import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash, Search, Plus, Filter, ChevronDown, CheckCircle, XCircle } from 'lucide-react';

// Filtreleme ve sıralama fonksiyonları
const ProductList = ({ products, onDelete, loading, error }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filtre ve sıralama seçenekleri
  const categories = ['Tümü', 'coffee', 'tea', 'food', 'dessert', 'other'];
  const sortOptions = [
    { value: 'name', label: 'İsim' },
    { value: 'price', label: 'Fiyat' },
    { value: 'category', label: 'Kategori' },
    { value: 'updatedAt', label: 'Son Güncelleme' }
  ];

  // Filtre ve sıralama işlemleri
  const filteredProducts = products
    ?.filter(product => {
      // Arama filtreleme
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Kategori filtreleme
      const matchesCategory = !categoryFilter || categoryFilter === 'Tümü' || product.category === categoryFilter;
      
      // Durum filtreleme
      const matchesAvailability = availabilityFilter === '' || 
        (availabilityFilter === 'available' && product.isAvailable) ||
        (availabilityFilter === 'unavailable' && !product.isAvailable);
      
      return matchesSearch && matchesCategory && matchesAvailability;
    })
    .sort((a, b) => {
      // Sıralama
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      } else if (sortBy === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === 'updatedAt') {
        comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    }) || [];

  // Kategori isimleri için yardımcı fonksiyon
  const getCategoryName = (category) => {
    const categoryNames = {
      'coffee': 'Kahve',
      'tea': 'Çay',
      'food': 'Yiyecek',
      'dessert': 'Tatlı',
      'other': 'Diğer'
    };
    
    return categoryNames[category] || category;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Üst Toolbar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Ürün ara..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Kategori Filtresi */}
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brown-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{getCategoryName(cat)}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            
            {/* Durum Filtresi */}
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brown-500"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="">Tüm Durumlar</option>
                <option value="available">Aktif</option>
                <option value="unavailable">Pasif</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            
            {/* Sıralama */}
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-brown-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            
            {/* Sıralama Yönü */}
            <button
              className="px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </button>
            
            {/* Yeni Ürün Ekle Butonu */}
            <Link
              to="/products/create"
              className="flex items-center px-3 py-2 bg-brown-700 text-white rounded-md hover:bg-brown-800 ml-2"
            >
              <Plus size={18} className="mr-1" />
              <span>Yeni Ürün</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Ürün Listesi */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brown-700 mx-auto"></div>
            <p className="mt-2 text-gray-600">Ürünler yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <p>Ürün bulunamadı.</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fiyat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İstatistikler</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-md object-cover" 
                          src={product.imageUrl || 'https://via.placeholder.com/150?text=No+Image'} 
                          alt={product.name} 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.description && (
                          <div className="text-sm text-gray-500 max-w-xs truncate">{product.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-brown-100 text-brown-800">
                      {getCategoryName(product.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {product.price.toFixed(2)} ₺
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.isAvailable ? (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle size={16} className="mr-1" />
                        Aktif
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600 text-sm">
                        <XCircle size={16} className="mr-1" />
                        Pasif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Satış: {product.totalSold || 0} adet</div>
                    <div>Sipariş: {product.orderCount || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      to={`/products/edit/${product.id}`}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      <Edit size={18} className="inline" />
                    </Link>
                    <button
                      onClick={() => onDelete(product.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash size={18} className="inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProductList;