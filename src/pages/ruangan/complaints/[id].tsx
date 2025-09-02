import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useAuth, withAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Complaint } from '@/types';
import { toast } from 'react-hot-toast';
import { PencilIcon, TrashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import ImageViewer from '@/components/ImageViewer';

const ComplaintDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
        
        // Check if user can view this complaint
        if (complaintData.createdBy._id !== user?._id) {
          toast.error('Anda tidak berhak melihat aduan ini');
          router.push('/ruangan/complaints');
          return;
        }
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast.error('Gagal memuat detail aduan');
      router.push('/ruangan/complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/ruangan/edit-complaint/${id}`);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!complaint) return;

    try {
      setDeleteLoading(true);
      await apiClient.deleteComplaint(complaint._id);
      
      toast.success('Aduan berhasil dihapus');
      router.push('/ruangan/complaints');
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast.error('Gagal menghapus aduan');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Menunggu Verifikasi':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Ditolak SIM RS':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Diterima SIM RS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Diproses Teknisi':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Selesai':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Tinggi';
      case 'medium':
        return 'Sedang';
      case 'low':
        return 'Rendah';
      default:
        return priority;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout title="Detail Aduan">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (!complaint) {
    return (
      <Layout title="Detail Aduan">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aduan tidak ditemukan</h3>
          <p className="text-gray-500 mb-6">Aduan yang Anda cari tidak ditemukan atau telah dihapus.</p>
          <Link
            href="/ruangan/complaints"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Kembali ke Daftar Aduan
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Detail Aduan">
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/ruangan/complaints"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Kembali ke Daftar Aduan
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Detail Aduan</h1>
          <p className="text-gray-600">ID: {complaint._id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{complaint.title}</h2>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(complaint.priority)}`}>
                      Prioritas {getPriorityLabel(complaint.priority)}
                    </span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                {complaint.status === 'Menunggu Verifikasi' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleEdit}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4 mr-1" />
                      Hapus
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Kategori</h3>
                  <p className="text-gray-900">{typeof complaint.category === 'object' && (complaint.category as any)?.name ? (complaint.category as any).name : complaint.category}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Deskripsi</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{complaint.description}</p>
                  </div>
                </div>

                {complaint.attachment && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Lampiran</h3>
                    <div className="flex items-start space-x-4">
                      <ImageViewer
                        imageUrl={complaint.attachment}
                        alt="Lampiran aduan"
                        className="h-32 w-32"
                      />
                      <div>
                        <p className="text-sm text-gray-600">Klik gambar untuk memperbesar</p>
                        <p className="text-xs text-gray-500 mt-1">Gambar lampiran aduan</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Catatan & Riwayat</h3>
              <div className="space-y-4">
                {complaint.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-red-800 mb-2">Alasan Penolakan</h4>
                    <p className="text-red-700">{complaint.rejectionReason}</p>
                  </div>
                )}

                {complaint.notes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Catatan Verifikasi</h4>
                    <p className="text-blue-700">{complaint.notes}</p>
                  </div>
                )}

                {complaint.processNotes && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-purple-800 mb-2">Catatan Proses</h4>
                    <p className="text-purple-700">{complaint.processNotes}</p>
                  </div>
                )}

                {complaint.completionNotes && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Catatan Penyelesaian</h4>
                    <p className="text-green-700">{complaint.completionNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* People Involved */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pihak Terkait</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Pelapor</h4>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {complaint.createdBy?.username || 'Tidak diketahui'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {complaint.createdBy?.ruangan || 'Tidak diketahui'}
                      </p>
                    </div>
                  </div>
                </div>

                {complaint.verifiedBy && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Diverifikasi oleh</h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {complaint.verifiedBy.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {complaint.verifiedBy.ruangan}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {complaint.assignedTo && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ditugaskan ke</h4>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {complaint.assignedTo.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          {complaint.assignedTo.ruangan}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Aduan Dibuat</p>
                    <p className="text-xs text-gray-500">{formatDate(complaint.createdAt)}</p>
                  </div>
                </div>
                
                {complaint.updatedAt !== complaint.createdAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Terakhir Diperbarui</p>
                      <p className="text-xs text-gray-500">{formatDate(complaint.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
              <div className="space-y-3">
                <Link
                  href="/ruangan/complaints"
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                >
                  Kembali ke Daftar
                </Link>
                
                <Link
                  href="/ruangan/dashboard"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-md hover:bg-gray-200 transition-colors"
                >
                  Dashboard Ruangan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Hapus Aduan
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus aduan "{complaint.title}"? Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDeleteConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? 'Menghapus...' : 'Hapus'}
                </button>
                <button
                  type="button"
                  disabled={deleteLoading}
                  onClick={handleDeleteCancel}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default withAuth(ComplaintDetail, ['ruangan']);
