import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth, withAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Complaint } from '@/types';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

const TeknisiTasks = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('assigned');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    // Set filter dari query parameter jika ada
    if (router.query.filter && typeof router.query.filter === 'string') {
      setFilter(router.query.filter);
    }
  }, [router.query.filter]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComplaints();
      
      if (response.status === 'success') {
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

  const handleTakeComplaint = async (complaintId: string) => {
    try {
      const response = await apiClient.takeComplaint(complaintId);
      
      if (response.status === 'success') {
        toast.success('Berhasil mengambil aduan!');
        fetchComplaints();
      }
    } catch (error: any) {
      console.error('Error taking complaint:', error);
      toast.error(error?.message || 'Gagal mengambil aduan');
    }
  };

  const handleProcessComplaint = async (complaintId: string, processNotes: string) => {
    try {
      const response = await apiClient.processComplaint(complaintId, { processNotes });
      
      if (response.status === 'success') {
        toast.success('Aduan mulai diproses!');
        fetchComplaints();
      }
    } catch (error: any) {
      console.error('Error processing complaint:', error);
      toast.error(error?.message || 'Gagal memproses aduan');
    }
  };

  const handleFinishComplaint = async (complaintId: string, completionNotes: string) => {
    try {
      const response = await apiClient.finishComplaint(complaintId, { completionNotes });
      
      if (response.status === 'success') {
        toast.success('Aduan selesai dikerjakan!');
        fetchComplaints();
      }
    } catch (error: any) {
      console.error('Error finishing complaint:', error);
      toast.error(error?.message || 'Gagal menyelesaikan aduan');
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'available') return complaint.status === 'Diterima SIM RS' && !complaint.assignedTo;
    if (filter === 'assigned') return complaint.assignedTo?._id === user?._id && complaint.status === 'Diterima SIM RS';
    if (filter === 'processing') return complaint.assignedTo?._id === user?._id && complaint.status === 'Diproses Teknisi';
    if (filter === 'completed') return complaint.assignedTo?._id === user?._id && complaint.status === 'Selesai';
    return true;
  });

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, filter: newFilter }
    }, undefined, { shallow: true });
  };

  if (loading) {
    return (
      <Layout title="Kelola Tugas">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Kelola Tugas">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Kelola Tugas</h1>
          <p className="mt-2 text-sm text-gray-700">
            Kelola aduan yang tersedia dan telah Anda ambil
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tersedia</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {complaints.filter(c => c.status === 'Diterima SIM RS' && !c.assignedTo).length}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Tugas Saya</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {complaints.filter(c => c.assignedTo?._id === user?._id && c.status === 'Diterima SIM RS').length}
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
                    <dt className="text-sm font-medium text-gray-500 truncate">Sedang Diproses</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {complaints.filter(c => c.assignedTo?._id === user?._id && c.status === 'Diproses Teknisi').length}
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
                      {complaints.filter(c => c.assignedTo?._id === user?._id && c.status === 'Selesai').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleFilterChange('available')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'available' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tersedia ({complaints.filter(c => c.status === 'Diterima SIM RS' && !c.assignedTo).length})
            </button>
            <button
              onClick={() => handleFilterChange('assigned')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'assigned' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tugas Saya ({complaints.filter(c => c.assignedTo?._id === user?._id && c.status === 'Diterima SIM RS').length})
            </button>
            <button
              onClick={() => handleFilterChange('processing')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'processing' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Sedang Diproses ({complaints.filter(c => c.assignedTo?._id === user?._id && c.status === 'Diproses Teknisi').length})
            </button>
            <button
              onClick={() => handleFilterChange('completed')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                filter === 'completed' 
                  ? 'border-primary-500 text-primary-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Selesai ({complaints.filter(c => c.assignedTo?._id === user?._id && c.status === 'Selesai').length})
            </button>
          </nav>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada aduan</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tidak ada aduan yang sesuai dengan filter yang dipilih.
              </p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <TaskComplaintCard 
                key={complaint._id} 
                complaint={complaint} 
                onTake={handleTakeComplaint}
                onProcess={handleProcessComplaint}
                onFinish={handleFinishComplaint}
                currentUserId={user?._id}
                currentFilter={filter}
              />
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

// Task Complaint Card Component
interface TaskComplaintCardProps {
  complaint: Complaint;
  onTake: (id: string) => void;
  onProcess: (id: string, processNotes: string) => void;
  onFinish: (id: string, completionNotes: string) => void;
  currentUserId?: string;
  currentFilter: string;
}

const TaskComplaintCard = ({ complaint, onTake, onProcess, onFinish, currentUserId, currentFilter }: TaskComplaintCardProps) => {
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [showFinishForm, setShowFinishForm] = useState(false);
  const [processNotes, setProcessNotes] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

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

  const handleStartProcess = () => {
    if (!processNotes.trim()) {
      toast.error('Catatan proses wajib diisi');
      return;
    }
    onProcess(complaint._id, processNotes);
    setShowProcessForm(false);
    setProcessNotes('');
  };

  const handleCompleteTask = () => {
    if (!completionNotes.trim()) {
      toast.error('Catatan penyelesaian wajib diisi');
      return;
    }
    onFinish(complaint._id, completionNotes);
    setShowFinishForm(false);
    setCompletionNotes('');
  };

  return (
    <div className={`bg-white shadow rounded-lg ${
      currentFilter === 'available' && complaint.priority === 'high' ? 'border-l-4 border-red-500' : ''
    }`}>
      <div className="px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                {complaint.title}
              </h3>
              {getStatusBadge(complaint.status)}
              {getPriorityBadge(complaint.priority)}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {complaint.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="font-medium text-gray-700">Kategori:</span> {typeof complaint.category === 'object' && (complaint.category as any)?.name ? (complaint.category as any).name : complaint.category}
              </div>
              <div>
                <span className="font-medium text-gray-700">Pelapor:</span> {complaint.createdBy?.ruangan || 'Tidak diketahui'}
              </div>
              <div>
                <span className="font-medium text-gray-700">Tanggal:</span> {new Date(complaint.createdAt).toLocaleDateString('id-ID')}
              </div>
              <div>
                <span className="font-medium text-gray-700">Prioritas:</span> {complaint.priority}
              </div>
              {complaint.assignedTo && (
                <div className="col-span-2">
                  <span className="font-medium text-gray-700">Ditangani oleh:</span> {complaint.assignedTo.ruangan} ({complaint.assignedTo.username})
                </div>
              )}
            </div>

            {complaint.processNotes && (
              <div className="mt-3 p-3 bg-purple-50 rounded-md">
                <p className="text-sm text-purple-700">
                  <span className="font-medium">Catatan proses:</span> {complaint.processNotes}
                </p>
              </div>
            )}

            {complaint.completionNotes && (
              <div className="mt-3 p-3 bg-green-50 rounded-md">
                <p className="text-sm text-green-700">
                  <span className="font-medium">Catatan penyelesaian:</span> {complaint.completionNotes}
                </p>
              </div>
            )}
          </div>

          <div className="ml-4 flex flex-col space-y-2">
            {/* Available complaints - show take button */}
            {complaint.status === 'Diterima SIM RS' && !complaint.assignedTo && (
              <button
                onClick={() => onTake(complaint._id)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Ambil Aduan
              </button>
            )}
            
            {/* Assigned to current user - show process button */}
            {complaint.status === 'Diterima SIM RS' && complaint.assignedTo?._id === currentUserId && (
              <button
                onClick={() => setShowProcessForm(!showProcessForm)}
                className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
              >
                Mulai Proses
              </button>
            )}
            
            {/* Currently processing by current user - show finish button */}
            {complaint.status === 'Diproses Teknisi' && complaint.assignedTo?._id === currentUserId && (
              <button
                onClick={() => setShowFinishForm(!showFinishForm)}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
              >
                Selesaikan
              </button>
            )}
          </div>
        </div>

        {/* Process Form */}
        {showProcessForm && complaint.status === 'Diterima SIM RS' && complaint.assignedTo?._id === currentUserId && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium text-purple-700 mb-3">Mulai Mengerjakan Aduan</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Catatan Proses *
                </label>
                <textarea
                  value={processNotes}
                  onChange={(e) => setProcessNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                  placeholder="Jelaskan apa yang akan Anda lakukan untuk menyelesaikan masalah ini..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleStartProcess}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
                >
                  Mulai Proses
                </button>
                <button
                  onClick={() => setShowProcessForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Finish Form */}
        {showFinishForm && complaint.status === 'Diproses Teknisi' && complaint.assignedTo?._id === currentUserId && (
          <div className="mt-4 border-t pt-4">
            <h4 className="font-medium text-green-700 mb-3">Selesaikan Aduan</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Catatan Penyelesaian *
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="Jelaskan apa yang telah Anda lakukan dan hasil perbaikannya..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCompleteTask}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Selesaikan Aduan
                </button>
                <button
                  onClick={() => setShowFinishForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAuth(TeknisiTasks, ['teknisi']);
