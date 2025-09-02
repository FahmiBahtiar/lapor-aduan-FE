import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import Layout from '@/components/layout/Layout';
import { useAuth, withAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Complaint, ComplaintFormData } from '@/types';
import { toast } from 'react-hot-toast';

interface EditComplaintForm {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  attachment?: FileList;
}

const EditComplaint = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [currentAttachment, setCurrentAttachment] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<EditComplaintForm>();

  useEffect(() => {
    if (id) {
      fetchComplaint();
    }
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComplaintById(id as string);
      
      if (response.status === 'success' && response.data) {
        const complaintData = response.data.complaint || response.data;
        if (!complaintData) {
          throw new Error('Complaint data not found');
        }
        
        setComplaint(complaintData);
        setCurrentAttachment(complaintData.attachment || null);
        
        // Check if user can edit this complaint
        if (complaintData.createdBy._id !== user?._id) {
          toast.error('Anda tidak berhak mengedit aduan ini');
          router.push('/ruangan/complaints');
          return;
        }

        if (complaintData.status !== 'Menunggu Verifikasi') {
          toast.error('Aduan yang sudah diverifikasi tidak dapat diedit');
          router.push('/ruangan/complaints');
          return;
        }
        
        // Set form values
        setValue('title', complaintData.title);
        setValue('description', complaintData.description);
        setValue('category', complaintData.category);
        setValue('priority', complaintData.priority);
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast.error('Gagal memuat data aduan');
      router.push('/ruangan/complaints');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EditComplaintForm) => {
    try {
      setSubmitting(true);
      
      const formData: ComplaintFormData = {
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        attachment: data.attachment
      };

      await apiClient.updateComplaint(id as string, formData);
      
      toast.success('Aduan berhasil diperbarui');
      router.push('/ruangan/complaints');
    } catch (error: any) {
      console.error('Error updating complaint:', error);
      toast.error(error.message || 'Gagal memperbarui aduan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Edit Aduan">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!complaint) {
    return (
      <Layout title="Edit Aduan">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aduan tidak ditemukan</h3>
          <p className="text-gray-500 mb-6">Aduan yang Anda cari tidak ditemukan atau telah dihapus.</p>
          <button
            onClick={() => router.push('/ruangan/complaints')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Kembali ke Daftar Aduan
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Aduan">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Aduan</h1>
          <p className="mt-2 text-gray-600">
            Perbarui informasi aduan Anda. Hanya aduan yang masih menunggu verifikasi yang dapat diedit.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Judul Aduan *
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Judul harus diisi' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Masukkan judul aduan"
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Deskripsi *
              </label>
              <textarea
                id="description"
                rows={4}
                {...register('description', { required: 'Deskripsi harus diisi' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Jelaskan detail masalah yang Anda alami..."
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Kategori *
              </label>
              <select
                id="category"
                {...register('category', { required: 'Kategori harus dipilih' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Pilih kategori...</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Jaringan">Jaringan</option>
                <option value="AC/Pendingin">AC/Pendingin</option>
                <option value="Listrik">Listrik</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              {errors.category && (
                <p className="mt-2 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Prioritas *
              </label>
              <select
                id="priority"
                {...register('priority', { required: 'Prioritas harus dipilih' })}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="">Pilih prioritas...</option>
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
              </select>
              {errors.priority && (
                <p className="mt-2 text-sm text-red-600">{errors.priority.message}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                <strong>Tinggi:</strong> Masalah mendesak yang mengganggu operasional<br/>
                <strong>Sedang:</strong> Masalah perlu diperbaiki dalam beberapa hari<br/>
                <strong>Rendah:</strong> Masalah tidak mendesak
              </p>
            </div>

            {/* Current Attachment */}
            {currentAttachment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lampiran Saat Ini
                </label>
                <div className="flex items-center space-x-3">
                  <img
                    src={currentAttachment}
                    alt="Current attachment"
                    className="h-20 w-20 object-cover rounded-md border border-gray-300"
                  />
                  <div>
                    <p className="text-sm text-gray-600">Gambar saat ini</p>
                    <p className="text-xs text-gray-500">Upload gambar baru untuk mengganti</p>
                  </div>
                </div>
              </div>
            )}

            {/* New Attachment */}
            <div>
              <label htmlFor="attachment" className="block text-sm font-medium text-gray-700">
                Lampiran Baru (Opsional)
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
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/ruangan/complaints')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Memperbarui...' : 'Perbarui Aduan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(EditComplaint, ['ruangan']);
