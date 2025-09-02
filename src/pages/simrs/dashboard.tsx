import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth, withAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Complaint } from '@/types';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const SimrsDashboard = () => {
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingVerification: 0,
    approved: 0,
    rejected: 0,
    inProgress: 0,
    completed: 0,
    todayComplaints: 0,
    priorityStats: {
      high: 0,
      medium: 0,
      low: 0
    },
    categoryStats: {} as Record<string, number>
  });
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [urgentComplaints, setUrgentComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all complaints for SIMRS
      const response = await apiClient.getComplaints();
      
      if (response.status === 'success') {
        const complaintsData = (response.data as any)?.complaints || [];
        
        // Calculate today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calculate comprehensive stats
        const priorityStats = {
          high: complaintsData.filter((c: Complaint) => c.priority === 'high').length,
          medium: complaintsData.filter((c: Complaint) => c.priority === 'medium').length,
          low: complaintsData.filter((c: Complaint) => c.priority === 'low').length,
        };

        // Category statistics
        const categoryStats: Record<string, number> = {};
        complaintsData.forEach((c: Complaint) => {
          categoryStats[c.category] = (categoryStats[c.category] || 0) + 1;
        });

        const stats = {
          totalComplaints: complaintsData.length,
          pendingVerification: complaintsData.filter((c: Complaint) => c.status === 'Menunggu Verifikasi').length,
          approved: complaintsData.filter((c: Complaint) => c.status === 'Diterima SIM RS').length,
          rejected: complaintsData.filter((c: Complaint) => c.status === 'Ditolak SIM RS').length,
          inProgress: complaintsData.filter((c: Complaint) => c.status === 'Diproses Teknisi').length,
          completed: complaintsData.filter((c: Complaint) => c.status === 'Selesai').length,
          todayComplaints: complaintsData.filter((c: Complaint) => {
            const complaintDate = new Date(c.createdAt);
            complaintDate.setHours(0, 0, 0, 0);
            return complaintDate.getTime() === today.getTime();
          }).length,
          priorityStats,
          categoryStats
        };
        
        setStats(stats);
        
        // Get recent complaints (last 5, sorted by date)
        const sortedComplaints = complaintsData
          .sort((a: Complaint, b: Complaint) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentComplaints(sortedComplaints.slice(0, 5));

        // Get urgent complaints (high priority and pending verification)
        const urgent = complaintsData
          .filter((c: Complaint) => c.priority === 'high' && c.status === 'Menunggu Verifikasi')
          .slice(0, 3);
        setUrgentComplaints(urgent);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Menunggu Verifikasi':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Diterima SIM RS':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Ditolak SIM RS':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Diproses Teknisi':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Selesai':
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard SIM RS</h1>
          <p className="text-gray-600">Selamat datang, {user?.username}! Kelola dan verifikasi laporan aduan.</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Complaints */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Aduan</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalComplaints}</p>
              </div>
            </div>
          </div>

          {/* Pending Verification */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Menunggu Verifikasi</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.pendingVerification}</p>
              </div>
            </div>
          </div>

          {/* Today's Complaints */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aduan Hari Ini</p>
                <p className="text-2xl font-semibold text-green-600">{stats.todayComplaints}</p>
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tingkat Penyelesaian</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {stats.totalComplaints > 0 ? Math.round((stats.completed / stats.totalComplaints) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Urgent Complaints */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Aduan Mendesak
              </h2>
              <p className="text-sm text-gray-600">Prioritas tinggi menunggu verifikasi</p>
            </div>
            <div className="p-6">
              {urgentComplaints.length > 0 ? (
                <div className="space-y-3">
                  {urgentComplaints.map((complaint) => (
                    <div key={complaint._id} className="border border-red-200 rounded-lg p-3 bg-red-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 text-sm">{complaint.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority === 'high' ? 'Tinggi' : complaint.priority === 'medium' ? 'Sedang' : 'Rendah'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{complaint.category}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{formatDate(complaint.createdAt)}</span>
                        <Link
                          href="/simrs/complaints"
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Verifikasi →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-gray-500 mt-2">Tidak ada aduan mendesak</p>
                </div>
              )}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Distribusi Prioritas
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Tinggi</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.priorityStats.high}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Sedang</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.priorityStats.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">Rendah</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{stats.priorityStats.low}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ringkasan Status
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Diterima SIM RS</span>
                  <span className="text-sm font-semibold text-green-600">{stats.approved}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Diproses Teknisi</span>
                  <span className="text-sm font-semibold text-blue-600">{stats.inProgress}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Ditolak SIM RS</span>
                  <span className="text-sm font-semibold text-red-600">{stats.rejected}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Selesai</span>
                  <span className="text-sm font-semibold text-gray-600">{stats.completed}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Complaints */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Aduan Terbaru</h2>
              <Link href="/simrs/complaints" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                Lihat semua →
              </Link>
            </div>
          </div>
          
          {recentComplaints.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              Tidak ada aduan terbaru
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentComplaints.map((complaint) => (
                <div key={complaint._id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {complaint.title}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(complaint.priority)}`}>
                          {complaint.priority === 'high' ? 'Tinggi' : complaint.priority === 'medium' ? 'Sedang' : 'Rendah'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-3 text-sm text-gray-500">
                        <span>Kategori: {complaint.category}</span>
                        <span>•</span>
                        <span>Pelapor: {complaint.createdBy?.ruangan || 'Tidak diketahui'}</span>
                        <span>•</span>
                        <span>{formatDate(complaint.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <Link
                        href="/simrs/complaints"
                        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                      >
                        Detail
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Aksi Cepat</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/simrs/complaints"
                className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Verifikasi Aduan</p>
                  <p className="text-xs text-gray-500">Tinjau dan verifikasi aduan baru</p>
                </div>
              </Link>

              <Link
                href="/simrs/complaints"
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Monitor Progress</p>
                  <p className="text-xs text-gray-500">Pantau aduan yang sedang diproses</p>
                </div>
              </Link>

              <Link
                href="/simrs/complaints"
                className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Laporan</p>
                  <p className="text-xs text-gray-500">Lihat laporan dan statistik lengkap</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(SimrsDashboard, ['simrs']);
