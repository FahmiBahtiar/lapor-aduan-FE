import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { withAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Complaint } from '@/types';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const AdminStats = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchComplaints();
    fetchDashboardStats();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllComplaints();
      
      if (response.status === 'success') {
        const complaintsData = (response.data as any)?.complaints || [];
        setComplaints(complaintsData);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Gagal memuat data statistik');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await apiClient.getDashboardStats();
      if (response.status === 'success') {
        setDashboardStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const getFilteredComplaints = () => {
    const now = new Date();
    let filterDate = new Date(0); // Default to beginning of time

    switch (dateRange) {
      case 'today':
        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        filterDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return complaints;
    }

    return complaints.filter(complaint => 
      new Date(complaint.createdAt) >= filterDate
    );
  };

  const filteredComplaints = getFilteredComplaints();

  // Calculate statistics
  const stats = {
    total: filteredComplaints.length,
    byStatus: {
      'Menunggu Verifikasi': filteredComplaints.filter(c => c.status === 'Menunggu Verifikasi').length,
      'Diterima SIM RS': filteredComplaints.filter(c => c.status === 'Diterima SIM RS').length,
      'Ditolak SIM RS': filteredComplaints.filter(c => c.status === 'Ditolak SIM RS').length,
      'Diproses Teknisi': filteredComplaints.filter(c => c.status === 'Diproses Teknisi').length,
      'Selesai': filteredComplaints.filter(c => c.status === 'Selesai').length,
    },
    byPriority: {
      'high': filteredComplaints.filter(c => c.priority === 'high').length,
      'medium': filteredComplaints.filter(c => c.priority === 'medium').length,
      'low': filteredComplaints.filter(c => c.priority === 'low').length,
    },
    byCategory: {} as Record<string, number>,
    byRoom: {} as Record<string, number>,
    completionRate: 0,
    averageResolutionTime: 0
  };

  // Calculate category statistics
  // Use dashboard stats for category data if available (already has category names)
  if (dashboardStats?.charts?.complaintsByCategory) {
    dashboardStats.charts.complaintsByCategory.forEach((item: any) => {
      stats.byCategory[item._id] = item.count;
    });
  } else {
    // Fallback: Calculate from individual complaints
    filteredComplaints.forEach(complaint => {
      const categoryKey = typeof complaint.category === 'object' && (complaint.category as any)?.name 
        ? (complaint.category as any).name 
        : complaint.category;
      stats.byCategory[categoryKey] = (stats.byCategory[categoryKey] || 0) + 1;
    });
  }

  // Calculate room statistics
  filteredComplaints.forEach(complaint => {
    const room = complaint.createdBy?.ruangan || 'Tidak diketahui';
    stats.byRoom[room] = (stats.byRoom[room] || 0) + 1;
  });

  // Calculate completion rate
  stats.completionRate = stats.total > 0 ? (stats.byStatus['Selesai'] / stats.total) * 100 : 0;

  // Calculate average resolution time (simplified - just for completed complaints)
  const completedComplaints = filteredComplaints.filter(c => c.status === 'Selesai');
  if (completedComplaints.length > 0) {
    const totalTime = completedComplaints.reduce((acc, complaint) => {
      const created = new Date(complaint.createdAt);
      const updated = new Date(complaint.updatedAt || complaint.createdAt);
      return acc + (updated.getTime() - created.getTime());
    }, 0);
    stats.averageResolutionTime = totalTime / completedComplaints.length / (1000 * 60 * 60 * 24); // in days
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(6)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistik Sistem</h1>
          <p className="text-gray-600">Analisis dan laporan data sistem laporan aduan</p>
        </div>

        {/* Date Range Filter */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center space-x-4">
            <label htmlFor="dateRange" className="text-sm font-medium text-gray-700">
              Periode Data:
            </label>
            <select
              id="dateRange"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Data</option>
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
            </select>
            <span className="text-sm text-gray-500">
              Total: {filteredComplaints.length} aduan
            </span>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
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
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tingkat Selesai</p>
                <p className="text-2xl font-semibold text-green-600">{stats.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rata-rata Resolusi</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {stats.averageResolutionTime.toFixed(1)} hari
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prioritas Tinggi</p>
                <p className="text-2xl font-semibold text-red-600">{stats.byPriority.high}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Distribusi Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(stats.byStatus).map(([status, count]) => {
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  const statusColors = {
                    'Menunggu Verifikasi': 'bg-yellow-400',
                    'Ditolak SIM RS': 'bg-red-400',
                    'Diterima SIM RS': 'bg-blue-400',
                    'Diproses Teknisi': 'bg-purple-400',
                    'Selesai': 'bg-green-400'
                  };
                  
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{status}</span>
                        <span className="text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${statusColors[status as keyof typeof statusColors] || 'bg-gray-400'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Distribusi Prioritas</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {Object.entries(stats.byPriority).map(([priority, count]) => {
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  const priorityColors = {
                    'high': 'bg-red-400',
                    'medium': 'bg-yellow-400',
                    'low': 'bg-green-400'
                  };
                  const priorityLabels = {
                    'high': 'Tinggi',
                    'medium': 'Sedang',
                    'low': 'Rendah'
                  };
                  
                  return (
                    <div key={priority}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {priorityLabels[priority as keyof typeof priorityLabels]}
                        </span>
                        <span className="text-gray-500">{count} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${priorityColors[priority as keyof typeof priorityColors] || 'bg-gray-400'}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Category and Room Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Categories */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Kategori Teratas</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(stats.byCategory)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([category, count]) => {
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {category}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{count}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 bg-blue-400 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Top Rooms */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Ruangan Teratas</h2>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {Object.entries(stats.byRoom)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 10)
                  .map(([room, count]) => {
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={room} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 truncate">{room}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{count}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 bg-green-400 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3a2 2 0 00-2 2v2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Kembali ke Dashboard</p>
                <p className="text-xs text-gray-500">Lihat ringkasan sistem</p>
              </div>
            </Link>

            <Link
              href="/admin/complaints"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Semua Aduan</p>
                <p className="text-xs text-gray-500">Kelola laporan aduan</p>
              </div>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Manajemen User</p>
                <p className="text-xs text-gray-500">Kelola pengguna sistem</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(AdminStats, ['admin']);
