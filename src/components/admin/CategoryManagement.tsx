import React, { useState, useEffect } from 'react';
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  restoreCategory 
} from '../../lib/api';

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryManagementProps {
  isAdmin: boolean;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ isAdmin }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      console.log('Fetching categories in CategoryManagement...');
      // Admin bisa melihat semua kategori termasuk yang tidak aktif
      const response = await getCategories(isAdmin);
      console.log('Categories response:', response);
      if (response.data && response.data.categories) {
        setCategories(response.data.categories);
        console.log('Categories set:', response.data.categories);
      } else {
        console.log('No categories data found in response');
        setCategories([]);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [isAdmin]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Submitting form:', formData);
      if (editingCategory) {
        // Update category
        console.log('Updating category:', editingCategory._id);
        await updateCategory(editingCategory._id, formData);
      } else {
        // Create new category
        console.log('Creating new category');
        await createCategory(formData);
      }
      
      // Reset form and refresh data
      setFormData({ name: '', description: '' });
      setShowForm(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setError(err.response?.data?.message || 'Gagal menyimpan kategori');
    }
  };

  // Handle edit
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setShowForm(true);
  };

  // Handle delete/toggle active
  const handleToggleActive = async (category: Category) => {
    try {
      if (category.isActive) {
        // Deactivate category
        await deleteCategory(category._id);
      } else {
        // Reactivate category
        await restoreCategory(category._id);
      }
      fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengubah status kategori');
    }
  };

  // Handle permanent delete
  const handlePermanentDelete = async (category: Category) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori ini secara permanen? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    try {
      await deleteCategory(category._id, true);
      fetchCategories();
    } catch (err: any) {
      if (err.response?.status === 409) {
        if (confirm(err.response.data.message + ' Tetap hapus?')) {
          await deleteCategory(category._id, true);
          fetchCategories();
        }
      } else {
        setError(err.response?.data?.message || 'Gagal menghapus kategori');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Manajemen Kategori
        </h2>
        {isAdmin && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingCategory(null);
              setFormData({ name: '', description: '' });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Tambah Kategori
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && isAdmin && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Kategori *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                {editingCategory ? 'Perbarui' : 'Simpan'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                  setFormData({ name: '', description: '' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deskripsi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dibuat
              </th>
              {isAdmin && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {category.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {category.description || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(category.createdAt).toLocaleDateString('id-ID')}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(category)}
                      className={`${
                        category.isActive 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {category.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    {!category.isActive && (
                      <button
                        onClick={() => handlePermanentDelete(category)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Hapus Permanen
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada kategori yang ditemukan
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
