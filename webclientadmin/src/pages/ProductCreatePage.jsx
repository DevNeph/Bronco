import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../services/productService';

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'coffee', // default kategori
    imageUrl: '',
    isAvailable: true,
    customizationOptions: {}
  });
  
  // Customization options array for coffee products
  const [customizationFields, setCustomizationFields] = useState([
    { name: 'size', options: 'small,medium,large' },
    { name: 'milk', options: 'whole,skim,soy,almond,oat' },
    { name: 'sugar', options: 'none,low,medium,high' }
  ]);
  
  // Input değişikliklerini handle et
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct({
      ...product,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Customization alanlarını güncelle
  const handleCustomizationChange = (index, field, value) => {
    const updatedFields = [...customizationFields];
    updatedFields[index][field] = value;
    setCustomizationFields(updatedFields);
  };
  
  // Customization alanı ekle
  const addCustomizationField = () => {
    setCustomizationFields([
      ...customizationFields,
      { name: '', options: '' }
    ]);
  };
  
  // Customization alanını kaldır
  const removeCustomizationField = (index) => {
    setCustomizationFields(customizationFields.filter((_, i) => i !== index));
  };
  
  // Form gönderildiğinde
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Customization seçeneklerini hazırla
      const customizationOptions = {};
      if (product.category === 'coffee' || product.category === 'tea') {
        // Sadece geçerli alanları ekle
        customizationFields.forEach(field => {
          if (field.name && field.options) {
            customizationOptions[field.name] = field.options.split(',').map(opt => opt.trim());
          }
        });
      }
      
      // Ürün verisini hazırla
      const productData = {
        ...product,
        price: parseFloat(product.price),
        customizationOptions
      };
      
      // Ürünü oluştur
      await productService.createProduct(productData);
      navigate('/products');
    } catch (err) {
      setError('Ürün oluşturulurken bir hata oluştu: ' + err.toString());
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
        <button
          onClick={() => navigate('/products')}
          className="text-brown-600 hover:text-brown-800"
        >
          Ürünlere Dön
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Ürün Adı */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Ürün Adı *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={product.name}
                onChange={handleChange}
                className="mt-1 focus:ring-brown-500 focus:border-brown-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            {/* Kategori */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Kategori *
              </label>
              <select
                name="category"
                id="category"
                required
                value={product.category}
                onChange={handleChange}
                className="mt-1 focus:ring-brown-500 focus:border-brown-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              >
                <option value="coffee">Kahve</option>
                <option value="tea">Çay</option>
                <option value="food">Yiyecek</option>
                <option value="dessert">Tatlı</option>
                <option value="other">Diğer</option>
              </select>
            </div>
            
            {/* Fiyat */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Fiyat (₺) *
              </label>
              <input
                type="number"
                name="price"
                id="price"
                required
                min="0"
                step="0.01"
                value={product.price}
                onChange={handleChange}
                className="mt-1 focus:ring-brown-500 focus:border-brown-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            {/* Görsel URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Görsel URL
              </label>
              <input
                type="url"
                name="imageUrl"
                id="imageUrl"
                value={product.imageUrl}
                onChange={handleChange}
                className="mt-1 focus:ring-brown-500 focus:border-brown-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            {/* Durum */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                id="isAvailable"
                checked={product.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                Ürün Aktif Mi?
              </label>
            </div>
            
            {/* Açıklama */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Açıklama
              </label>
              <textarea
                name="description"
                id="description"
                rows="3"
                value={product.description}
                onChange={handleChange}
                className="mt-1 focus:ring-brown-500 focus:border-brown-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              ></textarea>
            </div>
            
            {/* Customization Options - sadece kahve ve çaylar için */}
            {(product.category === 'coffee' || product.category === 'tea') && (
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Özelleştirme Seçenekleri
                  </label>
                  <button
                    type="button"
                    onClick={addCustomizationField}
                    className="text-sm text-brown-600 hover:text-brown-800"
                  >
                    + Seçenek Ekle
                  </button>
                </div>
                
                <div className="space-y-4">
                  {customizationFields.map((field, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => handleCustomizationChange(index, 'name', e.target.value)}
                          placeholder="Örn: Boyut, Süt, Şeker, vb."
                          className="focus:ring-brown-500 focus:border-brown-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={field.options}
                          onChange={(e) => handleCustomizationChange(index, 'options', e.target.value)}
                          placeholder="Değerler (virgülle ayır): küçük,orta,büyük"
                          className="focus:ring-brown-500 focus:border-brown-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => removeCustomizationField(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="mt-2 text-sm text-gray-500">
                  Özelleştirme seçenekleri, müşterilerin ürünü kişiselleştirmesine izin verir (örn: boyut, süt türü, vb.)
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
           <button
             type="button"
             onClick={() => navigate('/products')}
             className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500"
           >
             İptal
           </button>
           <button
             type="submit"
             disabled={loading}
             className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brown-600 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500 disabled:opacity-75"
           >
             {loading ? 'Kaydediliyor...' : 'Kaydet'}
           </button>
         </div>
       </form>
     </div>
   </div>
 );
};

export default ProductCreatePage;