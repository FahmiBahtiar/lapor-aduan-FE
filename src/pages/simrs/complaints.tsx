import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    fetchComplaints();
    fetchTechnicians();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComplaints();
      
      if (response.status === 'success') {
        // Handle both possible response structures
        const complaintsData = (response.data as any)?.complaints || response.data || [];
        setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
      } else {
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Gagal memuat data aduan');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await apiClient.getTechnicians();
      
      if (response.status === 'success') {
        // Handle both possible response structures
        const techniciansData = (response.data as any)?.users || response.data || [];
        setTechnicians(Array.isArray(techniciansData) ? techniciansData : []);
      } else {
        setTechnicians([]);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
      setTechnicians([]);
    }
  };

  const handleVerifyComplaint = async (complaintId: string, action: 'approve' | 'reject', data: any) => {
    try {
      const response = await apiClient.verifyComplaint(complaintId, {
        action,
        assignedTo: data.assignedTo,
        rejectionReason: data.rejectionReason
      });

      if (response.status === 'success') {
        toast.success(action === 'approve' ? 'Aduan berhasil disetujui' : 'Aduan berhasil ditolak');
        fetchComplaints();
      }
    } catch (error) {
      console.error('Error verifying complaint:', error);
      toast.error('Gagal memverifikasi aduan');
    }
  };

  const handleRejectClick = (complaintId: string) => {
    setSelectedComplaintForReject(complaintId);
    setShowRejectModal(true);
  };

  const submitReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Alasan penolakan harus diisi');
      return;
    }

    if (selectedComplaintForReject) {
      setRejectLoading(true);
      try {
        await handleVerifyComplaint(selectedComplaintForReject, 'reject', {
          rejectionReason: rejectionReason.trim()
        });
        setShowRejectModal(false);
        setSelectedComplaintForReject(null);
        setRejectionReason('');
      } catch (error) {
        console.error('Error rejecting complaint:', error);
      } finally {
        setRejectLoading(false);
      }
    }
  };

  // Filter dan sort complaints
  const safeComplaints = Array.isArray(complaints) ? complaints : [];
  const filteredAndSortedComplaints = safeComplaints
    .filter(complaint => {
      const matchesStatus = !filters.status || complaint.status === filters.status;
      const matchesPriority = !filters.priority || complaint.priority === filters.priority;
      const matchesCategory = !filters.category || 
        (typeof complaint.category === 'string' ? 
          complaint.category.toLowerCase().includes(filters.category.toLowerCase()) :
          (complaint.category as any)?.name?.toLowerCase().includes(filters.category.toLowerCase())
        );
      const matchesSearch = !filters.search || 
        complaint.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        complaint.description.toLowerCase().includes(filters.search.toLowerCase());

      return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const getStatsCards = () => {
    const safeComplaints = Array.isArray(complaints) ? complaints : [];
    const total = safeComplaints.length;
    const pending = safeComplaints.filter(c => c.status === 'Menunggu Verifikasi').length;
    const approved = safeComplaints.filter(c => c.status === 'Diterima SIM RS').length;
    const rejected = safeComplaints.filter(c => c.status === 'Ditolak SIM RS').length;

    return [
      { title: 'Total Aduan', count: total, color: 'bg-blue-500', icon: '📋' },
      { title: 'Menunggu Verifikasi', count: pending, color: 'bg-yellow-500', icon: '⏳' },
      { title: 'Disetujui', count: approved, color: 'bg-green-500', icon: '✅' },
      { title: 'Ditolak', count: rejected, color: 'bg-red-500', icon: '❌' }
    ];
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Verifikasi Aduan</h1>
          <p className="text-sm sm:text-base text-gray-600">Kelola dan verifikasi aduan yang masuk untuk diproses lebih lanjut</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {getStatsCards().map((card, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{card.count}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${card.color} text-white`}>
                  <span className="text-lg sm:text-xl">{card.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6 mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900">Filter & Pencarian</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as ComplaintStatus | '' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                  placeholder="Cari judul atau deskripsi..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label className="text-sm font-medium text-gray-700">Urutkan:</label>
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'priority')}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="createdAt">Tanggal</option>
                <option value="priority">Prioritas</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="desc">Terbaru</option>
                <option value="asc">Terlama</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complaints List */}
        <div className="space-y-6">
          {filteredAndSortedComplaints.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada aduan</h3>
              <p className="text-gray-500">
                {Array.isArray(complaints) && complaints.length === 0 ? 'Belum ada aduan yang masuk.' : 'Tidak ada aduan yang sesuai dengan filter.'}
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
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tolak Aduan</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alasan Penolakan
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Berikan alasan penolakan..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={submitReject}
                  disabled={rejectLoading || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {rejectLoading ? 'Memproses...' : 'Tolak'}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedComplaintForReject(null);
                    setRejectionReason('');
                  }}
                  disabled={rejectLoading}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>
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
      <div className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {complaint.priority === 'high' && (
                <FireIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
              )}
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {complaint.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(complaint.status)}
                {getPriorityBadge(complaint.priority)}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {complaint.description}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Kategori:</span> 
                <span className="ml-1">{typeof complaint.category === 'object' && (complaint.category as any)?.name ? (complaint.category as any).name : complaint.category}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Pelapor:</span> 
                <span className="ml-1">{complaint.createdBy?.ruangan || 'Tidak diketahui'}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Tanggal:</span> 
                <span className="ml-1">{new Date(complaint.createdAt).toLocaleDateString('id-ID')}</span>
              </div>
              {complaint.assignedTo && (
                <div>
                  <span className="font-medium text-gray-700">Teknisi:</span> 
                  <span className="ml-1">{complaint.assignedTo?.ruangan || 'Tidak diketahui'}</span>
                </div>
              )}
            </div>

            {complaint.attachment && (
              <div className="mt-4">
                <button
                  onClick={() => onImageClick(complaint.attachment!, complaint.title)}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                  </svg>
                  Lihat Lampiran
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 lg:ml-6">
            <div className="flex flex-col space-y-3 w-full lg:w-auto">
              <Link
                href={`/simrs/complaints/${complaint._id}`}
                className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Lihat Detail
              </Link>
              
              {complaint.status === 'Menunggu Verifikasi' && (
                <>
                  {!showActions ? (
                    <button
                      onClick={() => setShowActions(true)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verifikasi Aduan
                    </button>
                  ) : (
                    <div className="w-full lg:w-64">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800 font-medium mb-3">Pilih aksi verifikasi:</p>
                        <div className="space-y-2">
                          <button
                            onClick={handleApprove}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Setujui Aduan
                          </button>
                          <button
                            onClick={handleRejectClick}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Tolak Aduan
                          </button>
                          <button
                            onClick={() => setShowActions(false)}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Batal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(SimrsComplaints, ['simrs']);
