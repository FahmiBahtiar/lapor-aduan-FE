import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { withAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { User } from '@/types';
import { toast } from 'react-hot-toast';
import {
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface TechnicianStats {
  totalAssigned: number;
  completed: number;
  inProgress: number;
  completionRate: number;
}

interface TechnicianWithStats extends User {
  stats: TechnicianStats;
}

const SIMRSTechnicians = () => {
  const [technicians, setTechnicians] = useState<TechnicianWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByRoom, setFilterByRoom] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'completionRate' | 'totalAssigned'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTechnicians();
      
      if (response.status === 'success') {
        const usersData = (response.data as any)?.users || [];
        
        // Fetch stats for each technician
        const techniciansWithStats = await Promise.all(
          usersData.map(async (tech: User) => {
            try {
              // Get technician's complaints to calculate stats
              const statsResponse = await apiClient.getComplaints();
              if (statsResponse.status === 'success') {
                const allComplaints = (statsResponse.data as any)?.complaints || [];
                
                // Filter complaints assigned to this technician
                const techComplaints = allComplaints.filter(
                  (complaint: any) => complaint.assignedTo?._id === tech._id
                );
                
                const completed = techComplaints.filter(
                  (complaint: any) => complaint.status === 'Selesai'
                ).length;
                
                const inProgress = techComplaints.filter(
                  (complaint: any) => complaint.status === 'Diproses Teknisi'
                ).length;
                
                const totalAssigned = techComplaints.length;
                const completionRate = totalAssigned > 0 ? (completed / totalAssigned) * 100 : 0;
                
                return {
                  ...tech,
                  stats: {
                    totalAssigned,
                    completed,
                    inProgress,
                    completionRate
                  }
                };
              }
              
              return {
                ...tech,
                stats: {
                  totalAssigned: 0,
                  completed: 0,
                  inProgress: 0,
                  completionRate: 0
                }
              };
            } catch (error) {
              console.error(`Error fetching stats for ${tech.username}:`, error);
              return {
                ...tech,
                stats: {
                  totalAssigned: 0,
                  completed: 0,
                  inProgress: 0,
                  completionRate: 0
                }
              };
            }
          })
        );
        
        setTechnicians(techniciansWithStats);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
      toast.error('Gagal memuat data teknisi');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedTechnicians = technicians
    .filter(tech => {
      const matchesSearch = tech.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tech.ruangan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRoom = !filterByRoom || tech.ruangan.toLowerCase().includes(filterByRoom.toLowerCase());
      return matchesSearch && matchesRoom;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.username.toLowerCase();
          bValue = b.username.toLowerCase();
          break;
        case 'completionRate':
          aValue = a.stats.completionRate;
          bValue = b.stats.completionRate;
          break;
        case 'totalAssigned':
          aValue = a.stats.totalAssigned;
          bValue = b.stats.totalAssigned;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getPerformanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-50';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (inProgress: number) => {
    if (inProgress === 0) return 'text-green-600 bg-green-50';
    if (inProgress <= 2) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusText = (inProgress: number) => {
    if (inProgress === 0) return 'Tersedia';
    if (inProgress <= 2) return 'Sibuk';
    return 'Sangat Sibuk';
  };

  const totalTechnicians = technicians.length;
  const availableTechnicians = technicians.filter(t => t.stats.inProgress === 0).length;
  const busyTechnicians = technicians.filter(t => t.stats.inProgress > 0).length;
  const avgCompletionRate = technicians.length > 0 
    ? technicians.reduce((sum, t) => sum + t.stats.completionRate, 0) / technicians.length 
    : 0;

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manajemen Teknisi</h1>
          <p className="text-gray-600">Kelola dan pantau performa teknisi dalam sistem</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Teknisi</p>
                <p className="text-2xl font-bold text-gray-900">{totalTechnicians}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Tersedia</p>
                <p className="text-2xl font-bold text-gray-900">{availableTechnicians}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sibuk</p>
                <p className="text-2xl font-bold text-gray-900">{busyTechnicians}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rata-rata Penyelesaian</p>
                <p className="text-2xl font-bold text-gray-900">{avgCompletionRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter & Pencarian</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau ruangan teknisi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Room Filter */}
              <div className="relative">
                <FunnelIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter berdasarkan ruangan..."
                  value={filterByRoom}
                  onChange={(e) => setFilterByRoom(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name-asc">Nama (A-Z)</option>
                <option value="name-desc">Nama (Z-A)</option>
                <option value="completionRate-desc">Tingkat Penyelesaian (Tinggi-Rendah)</option>
                <option value="completionRate-asc">Tingkat Penyelesaian (Rendah-Tinggi)</option>
                <option value="totalAssigned-desc">Total Tugas (Banyak-Sedikit)</option>
                <option value="totalAssigned-asc">Total Tugas (Sedikit-Banyak)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Technicians Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTechnicians.map((technician) => (
            <div key={technician._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{technician.username}</h3>
                  <p className="text-sm text-gray-500">{technician.ruangan}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(technician.stats.inProgress)}`}>
                  {getStatusText(technician.stats.inProgress)}
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                {/* Completion Rate */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Tingkat Penyelesaian</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${getPerformanceColor(technician.stats.completionRate)}`}>
                      {technician.stats.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        technician.stats.completionRate >= 80 ? 'bg-green-600' :
                        technician.stats.completionRate >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(technician.stats.completionRate, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Task Statistics */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{technician.stats.totalAssigned}</p>
                    <p className="text-xs text-gray-500">Total Tugas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{technician.stats.completed}</p>
                    <p className="text-xs text-gray-500">Selesai</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{technician.stats.inProgress}</p>
                    <p className="text-xs text-gray-500">Sedang Proses</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && filteredAndSortedTechnicians.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada teknisi</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterByRoom 
                ? 'Tidak ada teknisi yang sesuai dengan filter yang dipilih.'
                : 'Belum ada teknisi yang terdaftar dalam sistem.'
              }
            </p>
            {(searchTerm || filterByRoom) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterByRoom('');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Hapus Filter
              </button>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={fetchTechnicians}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh Data
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(SIMRSTechnicians, ['simrs']);
