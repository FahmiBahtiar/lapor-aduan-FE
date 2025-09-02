import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useAuth, withAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Complaint } from '@/types';
import { toast } from 'react-hot-toast';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const RuanganComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComplaints({
        createdBy: user?._id
      });
      
      if (response.status === 'success') {
        // Backend returns { data: { complaints: [], pagination: {} } }
        const complaintsData = (response.data as any)?.complaints || [];
        setComplaints(complaintsData);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Gagal memuat data aduan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Menunggu Verifikasi': 'bg-yellow-100 text-yellow-800',
      'Ditolak SIM RS': 'bg-red-100 text-red-800',
      'Diterima SIM RS': 'bg-blue-100 text-blue-800',
      'Diproses Teknisi': 'bg-purple-100 text-purple-800',
      'Selesai': 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };

    const priorityLabels = {
      'low': 'Rendah',
      'medium': 'Sedang',
      'high': 'Tinggi'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityStyles[priority as keyof typeof priorityStyles] || 'bg-gray-100 text-gray-800'}`}>
        {priorityLabels[priority as keyof typeof priorityLabels] || priority}
      </span>
    );
  };

  const handleEdit = (complaintId: string) => {
    router.push(`/ruangan/edit-complaint/${complaintId}`);
  };

  const handleDeleteClick = (complaintId: string) => {
    setComplaintToDelete(complaintId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!complaintToDelete) return;

    try {
      setDeleteLoading(true);
      await apiClient.deleteComplaint(complaintToDelete);
      
      // Remove complaint from state
      setComplaints(complaints.filter(c => c._id !== complaintToDelete));
      
      toast.success('Aduan berhasil dihapus');
      setShowDeleteModal(false);
      setComplaintToDelete(null);
    } catch (error) {
      console.error('Error deleting complaint:', error);
      toast.error('Gagal menghapus aduan');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setComplaintToDelete(null);
  };

  if (loading) {
    return (
      <Layout title="Aduan Saya">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Aduan Saya">
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Aduan Saya</h1>
            <p className="mt-2 text-sm text-gray-700">
              Daftar semua aduan yang telah Anda buat
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              type="button"
              onClick={() => router.push('/ruangan/create-complaint')}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Buat Aduan Baru
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {complaints.length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Aduan
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {complaints.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {complaints.filter(c => c.status === 'Menunggu Verifikasi').length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Menunggu Verifikasi
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {complaints.filter(c => c.status === 'Menunggu Verifikasi').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {complaints.filter(c => c.status === 'Diproses Teknisi').length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Diproses
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {complaints.filter(c => c.status === 'Diproses Teknisi').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {complaints.filter(c => c.status === 'Selesai').length}
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Selesai
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {complaints.filter(c => c.status === 'Selesai').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Daftar Aduan
            </h3>
            
            {complaints.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada aduan</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Mulai dengan membuat aduan pertama Anda.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/ruangan/create-complaint')}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Buat Aduan Baru
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aduan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Prioritas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {complaints.map((complaint) => (
                      <tr key={complaint._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              <Link 
                                href={`/ruangan/complaints/${complaint._id}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {complaint.title}
                              </Link>
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {complaint.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{complaint.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPriorityBadge(complaint.priority)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(complaint.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(complaint.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {complaint.status === 'Menunggu Verifikasi' ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(complaint._id)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                title="Edit Aduan"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(complaint._id)}
                                className="text-red-600 hover:text-red-900 flex items-center"
                                title="Hapus Aduan"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
                        Apakah Anda yakin ingin menghapus aduan ini? Tindakan ini tidak dapat dibatalkan.
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

export default withAuth(RuanganComplaints, ['ruangan']);
