import React, { useState, useEffect } from 'react';
import { getCategories } from '../../lib/api';

interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface CategorySelectorProps {
  value: string;
  onChange: (categoryId: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
  initialCategoryName?: string; // Untuk handle category yang berupa name string
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  value,
  onChange,
  error,
  required = false,
  className = '',
  initialCategoryName
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        console.log('Fetching categories...');
        const response = await getCategories();
        console.log('Categories response:', response);
        if (response.data && response.data.categories) {
          // Validasi dan filter data categories
          const validCategories = response.data.categories.filter((cat: any) => {
            return cat && 
                   typeof cat._id === 'string' && 
                   typeof cat.name === 'string' && 
                   cat.isActive === true;
          });
          console.log('Valid categories:', validCategories);
          setCategories(validCategories);
          
          // Jika ada initialCategoryName (category berupa string name), cari ID-nya
          if (initialCategoryName && !value) {
            const matchedCategory = validCategories.find((cat: Category) => 
              cat.name.toLowerCase() === initialCategoryName.toLowerCase()
            );
            if (matchedCategory) {
              console.log('Found matching category:', matchedCategory);
              onChange(matchedCategory._id);
            }
          }
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setFetchError(err.response?.data?.message || 'Gagal memuat kategori');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [value, onChange]);

  if (loading) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kategori {required && <span className="text-red-500">*</span>}
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
          <div className="animate-pulse">Memuat kategori...</div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kategori {required && <span className="text-red-500">*</span>}
        </label>
        <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-700">
          {fetchError}
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Kategori {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-300' : 'border-gray-300'
        } ${className}`}
        required={required}
      >
        <option value="">Pilih Kategori</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {categories.length === 0 && (
        <p className="mt-1 text-sm text-gray-500">
          Tidak ada kategori yang tersedia
        </p>
      )}
    </div>
  );
};

export default CategorySelector;
