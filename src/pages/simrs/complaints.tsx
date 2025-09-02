import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { withAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Complaint, User, ComplaintStatus, ComplaintPriority } from '@/types';
import { toast } from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  FireIcon
} from '@heroicons/react/24/outline';

const SimrsComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedComplaintForReject, setSelectedComplaintForReject] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: '' as ComplaintStatus | '',
    priority: '' as ComplaintPriority | '',
    category: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'createdAt' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch complaints and technicians in parallel
      const [complaintsResponse, techniciansResponse] = await Promise.all([
        apiClient.getComplaints(),
        apiClient.getTechnicians()
      ]);
      
      if (complaintsResponse.status === 'success') {
        // Backend returns { data: { complaints: [], pagination: {} } }
        const complaintsData = (complaintsResponse.data as any)?.complaints || [];
        setComplaints(complaintsData);
      }
      
      if (techniciansResponse.status === 'success') {
        const techniciansData = (techniciansResponse.data as any) || [];
        setTechnicians(techniciansData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyComplaint = async (complaintId: string, action: 'approve' | 'reject', data: any) => {
    try {
      const response = await apiClient.verifyComplaint(complaintId, { action, ...data });
      
      if (response.status === 'success') {
        toast.success(action === 'approve' ? 'Aduan disetujui!' : 'Aduan ditolak');
        fetchData();
      }
    } catch (error: any) {
      console.error('Error verifying complaint:', error);
      toast.error(error?.message || `Gagal ${action === 'approve' ? 'menyetujui' : 'menolak'} aduan`);
    }
  };

  const handleRejectClick = (complaintId: string) => {
    setSelectedComplaintForReject(complaintId);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedComplaintForReject) return;
    
    if (!rejectionReason.trim()) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }

    try {
      setRejectLoading(true);
      await handleVerifyComplaint(selectedComplaintForReject, 'reject', {
        rejectionReason: rejectionReason.trim()
      });
      
      setShowRejectModal(false);
      setSelectedComplaintForReject(null);
      setRejectionReason('');
    } catch (error) {
      // Error sudah dihandle di handleVerifyComplaint
    } finally {
      setRejectLoading(false);
    }
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setSelectedComplaintForReject(null);
    setRejectionReason('');
  };

  // Filter and sort complaints
  const filteredAndSortedComplaints = complaints
    .filter(complaint => {
      const matchesStatus = !filters.status || complaint.status === filters.status;
      const matchesPriority = !filters.priority || complaint.priority === filters.priority;
      const matchesCategory = !filters.category || complaint.category.toLowerCase().includes(filters.category.toLowerCase());
      const matchesSearch = !filters.search || 
        complaint.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.createdBy?.ruangan?.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder];
        const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder];
        return sortOrder === 'asc' ? priorityA - priorityB : priorityB - priorityA;
      } else {
        const dateA = new Date(a[sortBy]).getTime();
        const dateB = new Date(b[sortBy]).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

  if (loading) {
    return (
      <Layout title="Verifikasi Aduan">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  // Stats for high priority complaints
  const pendingComplaints = filteredAndSortedComplaints.filter(c => c.status === 'Menunggu Verifikasi');
  const highPriorityCount = pendingComplaints.filter(c => c.priority === 'high').length;

  return (
    <Layout title="Verifikasi Aduan">
      <div className="space-y-6">
        {/* Header with stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Verifikasi Aduan</h1>
              <p className="text-gray-600">Kelola dan verifikasi aduan yang masuk</p>
            </div>
            <div className="flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{pendingComplaints.length}</div>
                <div className="text-sm text-gray-500">Menunggu</div>
              </div>
              {highPriorityCount > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600 flex items-center">
                    <FireIcon className="w-6 h-6 mr-1" />
                    {highPriorityCount}
                  </div>
                  <div className="text-sm text-red-500">Prioritas Tinggi</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filter & Pencarian</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as ComplaintStatus | '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                <option value="Diterima SIM RS">Diterima SIM RS</option>
                <option value="Ditolak SIM RS">Ditolak SIM RS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as ComplaintPriority | '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Prioritas</option>
                <option value="high">Tinggi</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <input
                type="text"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Cari kategori..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pencarian</label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Cari aduan..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Sort options */}
          <div className="flex items-center space-x-4 mt-4 pt-4 border-t">
            <span className="text-sm font-medium text-gray-700">Urutkan:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'priority')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Tanggal</option>
              <option value="priority">Prioritas</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredAndSortedComplaints.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada aduan</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tidak ada aduan yang sesuai dengan filter yang dipilih.
              </p>
            </div>
          ) : (
            filteredAndSortedComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint._id}
                complaint={complaint}
                technicians={technicians}
                onVerify={handleVerifyComplaint}
                onReject={handleRejectClick}
                onImageClick={(url, title) => setSelectedImage({ url, title })}
              />
            ))
          )}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-4 -right-4 z-10 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 transition-all shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="bg-white rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Lampiran: {selectedImage.title}
                </h3>
                <img
                  src={selectedImage.url}
                  alt={`Lampiran: ${selectedImage.title}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  onError={() => setSelectedImage(null)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
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
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Tolak Aduan
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-4">
                          Berikan alasan mengapa aduan ini ditolak. Alasan ini akan dikirimkan kepada pelapor.
                        </p>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Masukkan alasan penolakan..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          rows={4}
                          disabled={rejectLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    disabled={rejectLoading || !rejectionReason.trim()}
                    onClick={handleRejectConfirm}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejectLoading ? 'Menolak...' : 'Tolak Aduan'}
                  </button>
                  <button
                    type="button"
                    disabled={rejectLoading}
                    onClick={handleRejectCancel}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Complaint Card Component
interface ComplaintCardProps {
  complaint: Complaint;
  technicians: User[];
  onVerify: (id: string, action: 'approve' | 'reject', data: any) => void;
  onReject: (id: string) => void;
  onImageClick: (url: string, title: string) => void;
}

const ComplaintCard = ({ complaint, technicians, onVerify, onReject, onImageClick }: ComplaintCardProps) => {
  const [showActions, setShowActions] = useState(false);

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

  const handleApprove = () => {
    onVerify(complaint._id, 'approve', {});
    setShowActions(false);
  };

  const handleRejectClick = () => {
    onReject(complaint._id);
    setShowActions(false);
  };

  return (
    <div className={`bg-white shadow rounded-lg ${
      complaint.priority === 'high' ? 'border-l-4 border-red-500' : ''
    }`}>
      <div className="px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {complaint.priority === 'high' && (
                <FireIcon className="w-5 h-5 text-red-500" />
              )}
              <h3 className="text-lg font-medium text-gray-900">
                {complaint.title}
              </h3>
              {getStatusBadge(complaint.status)}
              {getPriorityBadge(complaint.priority)}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {complaint.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Kategori:</span> {complaint.category}
              </div>
              <div>
                <span className="font-medium text-gray-700">Pelapor:</span> {complaint.createdBy?.ruangan || 'Tidak diketahui'}
              </div>
              <div>
                <span className="font-medium text-gray-700">Tanggal:</span> {new Date(complaint.createdAt).toLocaleDateString('id-ID')}
              </div>
              {complaint.assignedTo && (
                <div>
                  <span className="font-medium text-gray-700">Teknisi:</span> {complaint.assignedTo?.ruangan || 'Tidak diketahui'}
                </div>
              )}
            </div>

            {complaint.attachment && (
              <div className="mt-3">
                <button
                  onClick={() => onImageClick(complaint.attachment!, complaint.title)}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                  Lihat Lampiran
                </button>
              </div>
            )}
          </div>

          {/* Actions for pending complaints */}
          {complaint.status === 'Menunggu Verifikasi' && (
            <div className="flex-shrink-0">
              {!showActions ? (
                <button
                  onClick={() => setShowActions(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Verifikasi
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={handleApprove}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Setujui
                    </button>
                    <button
                      onClick={handleRejectClick}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => setShowActions(false)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(SimrsComplaints, ['simrs']);
