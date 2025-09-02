import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { withAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Complaint, User, DashboardStats } from '@/types';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDashboardStats();
      
      if (response.status === 'success' && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard Admin">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard Admin">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Administrator
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Kelola sistem laporan aduan dan pantau kinerja keseluruhan.
            </p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Aduan</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.overview.totalComplaints || 0}
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
                  <svg className="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Menunggu Verifikasi</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.overview.complaintsByStatus['Menunggu Verifikasi'] || 0}
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
                  <svg className="h-6 w-6 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Diproses</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.overview.complaintsByStatus['Diproses Teknisi'] || 0}
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
                  <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Selesai</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.overview.complaintsByStatus['Selesai'] || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Aksi Cepat
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button
                onClick={() => window.location.href = '/admin/complaints'}
                className="bg-primary-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-primary-700 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Kelola Semua Aduan
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/users'}
                className="bg-purple-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-purple-700 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Manajemen User
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/stats'}
                className="bg-green-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-green-700 flex items-center justify-center"
              >
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Lihat Statistik
              </button>
            </div>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Status Aduan
              </h3>
              <div className="space-y-3">
                {stats?.overview.complaintsByStatus && Object.entries(stats.overview.complaintsByStatus).map(([status, count]) => {
                  const total = stats.overview.totalComplaints;
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
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

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Prioritas Aduan
              </h3>
              <div className="space-y-3">
                {stats?.overview.complaintsByPriority && Object.entries(stats.overview.complaintsByPriority).map(([priority, count]) => {
                  const total = stats.overview.totalComplaints;
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  
                  const priorityColors = {
                    'low': 'bg-gray-400',
                    'medium': 'bg-yellow-400',
                    'high': 'bg-red-400'
                  };

                  const priorityLabels = {
                    'low': 'Rendah',
                    'medium': 'Sedang',
                    'high': 'Tinggi'
                  };
                  
                  return (
                    <div key={priority}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {priorityLabels[priority as keyof typeof priorityLabels] || priority}
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

        {/* System Info */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Informasi Sistem
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {stats?.overview.totalComplaints || 0}
                </div>
                <div className="text-sm text-gray-500">Total Aduan</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.overview.complaintsByStatus['Selesai'] || 0}
                </div>
                <div className="text-sm text-gray-500">Aduan Selesai</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.technicians?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Teknisi Aktif</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(AdminDashboard, ['admin']);
