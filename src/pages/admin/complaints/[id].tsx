import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import { withAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Complaint } from '@/types';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import ImageViewer from '@/components/ImageViewer';

const AdminComplaintDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);

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
        setComplaint(response.data.complaint || response.data);
      }
    } catch (error) {
      console.error('Error fetching complaint:', error);
      toast.error('Gagal memuat detail aduan');
    } finally {
      setLoading(false);
    }
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
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!complaint) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aduan tidak ditemukan</h3>
            <p className="text-gray-500 mb-6">Aduan yang Anda cari tidak ditemukan atau telah dihapus.</p>
            <Link
              href="/admin/complaints"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Daftar Aduan
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/admin/complaints"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
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
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Kategori</h3>
                  <p className="text-gray-900">{complaint.category}</p>
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
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Lihat Lampiran
                    </button>
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
                  href="/admin/complaints"
                  className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition-colors"
                >
                  Kembali ke Daftar
                </Link>
                
                <Link
                  href="/admin/dashboard"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 text-center rounded-md hover:bg-gray-200 transition-colors"
                >
                  Dashboard Admin
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && complaint?.attachment && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute -top-4 -right-4 z-10 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 transition-all shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Lampiran: {complaint.title}
                </h3>
                <img
                  src={complaint.attachment}
                  alt={`Lampiran: ${complaint.title}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={() => setShowImageModal(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default withAuth(AdminComplaintDetail, ['admin']);
