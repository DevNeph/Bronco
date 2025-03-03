import React, { useState, useEffect } from 'react';
import { Plus, Trash, Edit, Save, X } from 'lucide-react';

const CategoryManager = ({ categories = [], onAddCategory, onUpdateCategory, onDeleteCategory }) => {
  const [categoryList, setCategoryList] = useState(categories);
  const [newCategory, setNewCategory] = useState({ value: '', label: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setCategoryList(categories);
  }, [categories]);

  const handleAddCategory = () => {
    if (!newCategory.value || !newCategory.label) {
      setError('Kategori değeri ve etiketi gereklidir.');
      return;
    }

    if (categoryList.some(cat => cat.value === newCategory.value)) {
      setError('Bu kategori zaten mevcut.');
      return;
    }

    onAddCategory(newCategory);
    setNewCategory({ value: '', label: '' });
    setError('');
  };

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
  };

  const handleSaveEdit = () => {
    if (!editingCategory.value || !editingCategory.label) {
      setError('Kategori değeri ve etiketi gereklidir.');
      return;
    }

    // Check if the value exists in another category
    const duplicateValue = categoryList.some(
      cat => cat.value === editingCategory.value && cat.id !== editingCategory.id
    );

    if (duplicateValue) {
      setError('Bu kategori değeri zaten kullanılıyor.');
      return;
    }

    onUpdateCategory(editingCategory);
    setEditingCategory(null);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setError('');
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Kategori Yönetimi</h2>
        <p className="mt-1 text-sm text-gray-500">
          Ürünler için kategorileri ekleyin, düzenleyin veya silin.
        </p>
      </div>

      {error && (
        <div className="mx-5 mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="p-5">
        {/* Add New Category */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Kategori Değeri (ör: coffee)"
              value={newCategory.value}
              onChange={(e) => setNewCategory({ ...newCategory, value: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            />
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Kategori Etiketi (ör: Kahve)"
              value={newCategory.label}
              onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
            />
          </div>
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-brown-700 text-white rounded-md hover:bg-brown-800 flex items-center whitespace-nowrap"
          >
            <Plus size={16} className="mr-1" />
            Kategori Ekle
          </button>
        </div>

        {/* Category List */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Değer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Etiket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryList.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    Henüz kategori eklenemedi.
                  </td>
                </tr>
              ) : (
                categoryList.map((category) => (
                  <tr key={category.id || category.value}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingCategory && editingCategory.id === category.id ? (
                        <input
                          type="text"
                          value={editingCategory.value}
                          onChange={(e) => setEditingCategory({ ...editingCategory, value: e.target.value })}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                        />
                      ) : (
                        category.value
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingCategory && editingCategory.id === category.id ? (
                        <input
                          type="text"
                          value={editingCategory.label}
                          onChange={(e) => setEditingCategory({ ...editingCategory, label: e.target.value })}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brown-500"
                        />
                      ) : (
                        category.label
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingCategory && editingCategory.id === category.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save size={18} />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => onDeleteCategory(category.id || category.value)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;