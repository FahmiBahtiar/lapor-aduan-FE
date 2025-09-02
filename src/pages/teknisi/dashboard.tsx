import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth, withAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Complaint } from '@/types';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import ImageViewer from '@/components/ImageViewer';

const TeknisiDashboard = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    available: 0,
    myTasks: 0,
    processing: 0,
    completed: 0
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComplaints();
      
      if (response.status === 'success') {
        const complaintsData = (response.data as any)?.complaints || [];
        setComplaints(complaintsData);
        
        // Calculate stats
        const available = complaintsData.filter((c: Complaint) => 
          c.status === 'Diterima SIM RS' && !c.assignedTo
        ).length;
        
        const myTasks = complaintsData.filter((c: Complaint) => 
          c.assignedTo?._id === user?._id && c.status === 'Diterima SIM RS'
        ).length;
        
        const processing = complaintsData.filter((c: Complaint) => 
          c.assignedTo?._id === user?._id && c.status === 'Diproses Teknisi'
        ).length;
        
        const completed = complaintsData.filter((c: Complaint) => 
          c.assignedTo?._id === user?._id && c.status === 'Selesai'
        ).length;

        setStats({ available, myTasks, processing, completed });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard Teknisi">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  // Get recent complaints assigned to current user
  const recentComplaints = complaints
    .filter(c => c.assignedTo?._id === user?._id)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Get urgent available complaints
  const urgentAvailable = complaints
    .filter(c => c.status === 'Diterima SIM RS' && !c.assignedTo && c.priority === 'high')
    .slice(0, 3);

  return (
    <Layout title="Dashboard Teknisi">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Selamat datang, {user?.username}!
          </h1>
          <p className="mt-2 text-gray-600">
            Ruangan: {user?.ruangan} | Role: {user?.role}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tersedia</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.available}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/teknisi/complaints?filter=available" className="text-blue-600 hover:text-blue-500 text-sm font-medium">
                  Lihat aduan tersedia →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tugas Saya</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.myTasks}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/teknisi/complaints?filter=assigned" className="text-yellow-600 hover:text-yellow-500 text-sm font-medium">
                  Lihat tugas saya →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Sedang Diproses</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.processing}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/teknisi/complaints?filter=processing" className="text-purple-600 hover:text-purple-500 text-sm font-medium">
                  Lihat yang diproses →
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Selesai</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.completed}</dd>
                  </dl>
                </div>
              </div>
              <div className="mt-3">
                <Link href="/teknisi/complaints?filter=completed" className="text-green-600 hover:text-green-500 text-sm font-medium">
                  Lihat yang selesai →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/teknisi/complaints?filter=available"
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-blue-900">Ambil Aduan Baru</p>
                  <p className="text-sm text-blue-700">Lihat dan ambil aduan yang tersedia</p>
                </div>
              </div>
            </Link>

            <Link
              href="/teknisi/complaints?filter=assigned"
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 rounded-full p-2">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-yellow-900">Mulai Mengerjakan</p>
                  <p className="text-sm text-yellow-700">Proses tugas yang sudah diambil</p>
                </div>
              </div>
            </Link>

            <Link
              href="/teknisi/complaints?filter=processing"
              className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-purple-900">Selesaikan Tugas</p>
                  <p className="text-sm text-purple-700">Tandai tugas sebagai selesai</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Urgent Available Complaints */}
          {urgentAvailable.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Aduan Prioritas Tinggi</h2>
                <p className="text-sm text-gray-500">Aduan yang memerlukan perhatian segera</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {urgentAvailable.map((complaint) => (
                    <div key={complaint._id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{complaint.createdBy?.ruangan}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(complaint.createdAt).toLocaleDateString('id-ID')}
                          </p>
                          {complaint.attachment && (
                            <div className="mt-2">
                              <ImageViewer
                                imageUrl={complaint.attachment}
                                alt={`Gambar aduan: ${complaint.title}`}
                                className="w-24 h-18"
                              />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Prioritas Tinggi
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link
                    href="/teknisi/complaints?filter=available"
                    className="text-red-600 hover:text-red-500 text-sm font-medium"
                  >
                    Lihat semua aduan tersedia →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Recent My Tasks */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Tugas Terbaru Saya</h2>
              <p className="text-sm text-gray-500">Aduan yang baru-baru ini Anda tangani</p>
            </div>
            <div className="p-6">
              {recentComplaints.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada tugas</h3>
                  <p className="mt-1 text-sm text-gray-500">Ambil aduan dari daftar yang tersedia</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentComplaints.map((complaint) => (
                    <div key={complaint._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{complaint.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{complaint.createdBy?.ruangan}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(complaint.updatedAt).toLocaleDateString('id-ID')}
                          </p>
                          {complaint.attachment && (
                            <div className="mt-2">
                              <ImageViewer
                                imageUrl={complaint.attachment}
                                alt={`Gambar aduan: ${complaint.title}`}
                                className="w-24 h-18"
                              />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            complaint.status === 'Diterima SIM RS' ? 'bg-blue-100 text-blue-800' :
                            complaint.status === 'Diproses Teknisi' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {complaint.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link
                  href="/teknisi/complaints"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Lihat semua tugas →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(TeknisiDashboard, ['teknisi']);
