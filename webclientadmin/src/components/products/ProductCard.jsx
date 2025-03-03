import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash, CheckCircle, XCircle } from 'lucide-react';

const ProductCard = ({ product, onDelete, categories = [] }) => {
  // Kategori adını getiren yardımcı fonksiyon
  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
      {/* Ürün Görseli */}
      <div className="relative h-48">
        <img
          className="w-full h-full object-cover"
          src={product.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'}
          alt={product.name}
        />
        
        {/* Durum Etiketi */}
        <div className="absolute top-2 right-2">
          {product.isAvailable ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle size={12} className="mr-1" />
              Aktif
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <XCircle size={12} className="mr-1" />
              Pasif
            </span>
          )}
        </div>
        
        {/* Kategori Etiketi */}
        <div className="absolute bottom-2 left-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brown-100 text-brown-800">
            {getCategoryLabel(product.category)}
          </span>
        </div>
      </div>
      
      {/* Ürün Bilgileri */}
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
        
        {product.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        )}
        
        <div className="mt-2 flex justify-between items-center">
          <p className="text-lg font-bold text-brown-700">{product.price.toFixed(2)} ₺</p>
          
          {/* Ürün İstatistikleri */}
          <div className="text-xs text-gray-500">
            {product.totalSold > 0 && (
              <span>{product.totalSold} satış</span>
            )}
          </div>
        </div>
      </div>
      
      {/* İşlem Butonları */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex justify-between">
          <Link 
            to={`/products/edit/${product.id}`} 
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-blue-700 bg-white hover:text-blue-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-blue-800"
          >
            <Edit size={16} className="mr-1" />
            Düzenle
          </Link>
          
          <button
            onClick={() => onDelete(product.id)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-red-700 bg-white hover:text-red-500 focus:outline-none focus:border-red-300 focus:shadow-outline-red active:text-red-800"
          >
            <Trash size={16} className="mr-1" />
            Sil
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;