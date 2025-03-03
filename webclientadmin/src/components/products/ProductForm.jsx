import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Upload, Save, ArrowLeft } from 'lucide-react';

const ProductForm = ({ 
  initialData = {}, 
  onSubmit, 
  isEditing = false, 
  loading = false, 
  error = null,
  categories = [] 
}) => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    isAvailable: true,
    imageUrl: '',
    customizationOptions: {},
    ...initialData
  });
  
  // Image preview state
  const [imagePreview, setImagePreview] = useState(initialData.imageUrl || '');
  
  // Customization state
  const [customizations, setCustomizations] = useState([]);
  const [newOption, setNewOption] = useState({ name: '', values: '' });
  
  // Update form when initial data changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price?.toString() || '',
        category: initialData.category || '',
        isAvailable: initialData.isAvailable ?? true,
        imageUrl: initialData.imageUrl || '',
        customizationOptions: initialData.customizationOptions || {}
      });
      
      setImagePreview(initialData.imageUrl || '');
      
      // Transform customizationOptions object to array for easier form handling
      const customizationArray = Object.entries(initialData.customizationOptions || {}).map(
        ([name, values]) => ({
          name,
          values: Array.isArray(values) ? values.join(', ') : values.toString()
        })
      );
      
      setCustomizations(customizationArray);
    }
  }, [initialData]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // In a real app, you would upload this to your server or cloud storage
    // For this example, we'll just use URL.createObjectURL for preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // In a real implementation, you would upload the file and get back a URL
    // setFormData({ ...formData, imageUrl: uploadedUrl });
    
    // For now, we'll just pretend we got a URL back from the server
    setFormData({ ...formData, imageUrl: previewUrl });
  };
  
  // Handle customization options
  const handleAddCustomization = () => {
    if (newOption.name.trim() && newOption.values.trim()) {
      setCustomizations([...customizations, { ...newOption }]);
      setNewOption({ name: '', values: '' });
    }
  };
  
  const handleCustomizationChange = (e, index, field) => {
    const newCustomizations = [...customizations];
    newCustomizations[index][field] = e.target.value;
    setCustomizations(newCustomizations);
  };
  
  const handleRemoveCustomization = (index) => {
    setCustomizations(customizations.filter((_, i) => i !== index));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Transform customizations array back to an object
    const customizationOptions = {};
    customizations.forEach(({ name, values }) => {
      customizationOptions[name] = values.split(',').map(value => value.trim());
    });
    
    // Create final form data
    const finalFormData = {
      ...formData,
      price: parseFloat(formData.price),
      customizationOptions
    };
    
    onSubmit(finalFormData);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
          </h2>
        </div>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-brown-700 text-white rounded-md hover:bg-brown-800"
        >
          {loading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Kaydediliyor...</span>
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              <span>Kaydet</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="m-6 p-4 bg-red-50 text-red-600 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Basic Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Adı *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat (₺) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                >
                  <option value="">Kategori Seçin</option>
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAvailable"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
              />
              <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                Ürün Aktif
              </label>
            </div>
          </div>
          
          {/* Right Column - Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ürün Görseli
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md h-64">
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="h-full max-h-full mx-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setFormData({ ...formData, imageUrl: '' });
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center flex flex-col items-center justify-center w-full">
                  <Upload size={36} className="mx-auto text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brown-600 hover:text-brown-500 focus-within:outline-none">
                      <span>Resim Yükle</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">ya da sürükleyip bırakın</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF formatı desteklenmektedir
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Customization Options */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Özelleştirme Seçenekleri</h3>
          
          {/* Existing Options */}
          {customizations.length > 0 && (
            <div className="mb-4 space-y-3">
              {customizations.map((option, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option.name}
                      onChange={(e) => handleCustomizationChange(e, index, 'name')}
                      placeholder="Özellik adı"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={option.values}
                      onChange={(e) => handleCustomizationChange(e, index, 'values')}
                      placeholder="Değerler (virgülle ayırın)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomization(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Add New Option */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={newOption.name}
                onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                placeholder="Özellik adı (örn. 'size', 'milk')"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={newOption.values}
                onChange={(e) => setNewOption({ ...newOption, values: e.target.value })}
                placeholder="Değerler (virgülle ayırın)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
              />
            </div>
            <button
              type="button"
              onClick={handleAddCustomization}
              disabled={!newOption.name || !newOption.values}
              className={`px-4 py-2 rounded-md ${
                !newOption.name || !newOption.values
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-brown-700 text-white hover:bg-brown-800'
              }`}
            >
              Ekle
            </button>
          </div>
          
          <p className="mt-2 text-sm text-gray-500">
            Örnek: Boyut için "size" adını ve "small, medium, large" değerlerini girin.
          </p>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;