import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import { withAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { ComplaintFormData } from '@/types';
import { toast } from 'react-hot-toast';
import CategorySelector from '@/components/forms/CategorySelector';

const CreateComplaint = () => {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ComplaintFormData>();

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      setLoading(true);
      
      // Validate category
      if (!selectedCategory) {
        setCategoryError('Kategori wajib dipilih');
        setLoading(false);
        return;
      }
      
      const formData = {
        ...data,
        category: selectedCategory
      };
      
      const response = await apiClient.createComplaint(formData);
      
      if (response.status === 'success') {
        toast.success('Aduan berhasil dibuat!');
        reset();
        setSelectedCategory('');
        setCategoryError('');
        router.push('/ruangan/complaints');
      }
    } catch (error: any) {
      console.error('Error creating complaint:', error);
      toast.error(error?.message || 'Gagal membuat aduan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Buat Aduan Baru">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h1 className="text-lg leading-6 font-medium text-gray-900">
                Buat Aduan Baru
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Laporkan masalah atau kerusakan yang perlu diperbaiki
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Judul Aduan *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="title"
                    {...register('title', { 
                      required: 'Judul aduan wajib diisi',
                      minLength: {
                        value: 5,
                        message: 'Judul minimal 5 karakter'
                      }
                    })}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Contoh: AC Ruang ICU tidak dingin"
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Deskripsi Masalah *
                </label>
                <div className="mt-1">
                  <textarea
                    id="description"
                    rows={4}
                    {...register('description', { 
                      required: 'Deskripsi masalah wajib diisi',
                      minLength: {
                        value: 10,
                        message: 'Deskripsi minimal 10 karakter'
                      }
                    })}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Jelaskan masalah secara detail..."
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <CategorySelector
                value={selectedCategory}
                onChange={(categoryId) => {
                  setSelectedCategory(categoryId);
                  setCategoryError('');
                }}
                error={categoryError}
                required={true}
              />

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Prioritas *
                </label>
                <div className="mt-1">
                  <select
                    id="priority"
                    {...register('priority', { required: 'Prioritas wajib dipilih' })}
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Pilih prioritas...</option>
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                  {errors.priority && (
                    <p className="mt-2 text-sm text-red-600">{errors.priority.message}</p>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  <strong>Tinggi:</strong> Masalah mendesak yang mengganggu operasional<br/>
                  <strong>Sedang:</strong> Masalah perlu diperbaiki dalam beberapa hari<br/>
                  <strong>Rendah:</strong> Masalah tidak mendesak
                </p>
              </div>

              {/* Attachment */}
              <div>
                <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">
                  Lampiran Foto (Opsional)
                </label>
                <input
                  type="file"
                  id="attachment"
                  accept="image/*"
                  {...register('attachment')}
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p className="mt-2 text-sm text-gray-500">
                  Format yang didukung: JPG, PNG, GIF. Maksimal 5MB.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    'Buat Aduan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(CreateComplaint, ['ruangan']);
