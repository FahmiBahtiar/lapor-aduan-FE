import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import {
  Complaint,
  ComplaintFilters,
  ComplaintFormData,
  VerifyComplaintData,
  ProcessComplaintData,
  FinishComplaintData,
  ApiResponse,
  PaginatedResponse
} from '@/types';
import { apiClient } from '@/lib/api';

// Hook untuk mengambil daftar complaints
export function useComplaints(filters?: ComplaintFilters) {
  return useQuery({
    queryKey: ['complaints', filters],
    queryFn: () => apiClient.getComplaints(filters),
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds
  });
}

// Hook untuk mengambil single complaint
export function useComplaint(id: string) {
  return useQuery({
    queryKey: ['complaint', id],
    queryFn: () => apiClient.getComplaintById(id),
    enabled: !!id,
  });
}

// Hook untuk membuat complaint baru
export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ComplaintFormData) => apiClient.createComplaint(data),
    onSuccess: (response) => {
      toast.success(response.message || 'Aduan berhasil dibuat!');
      queryClient.invalidateQueries(['complaints']);
    },
    onError: (error: any) => {
      const message = error?.message || 'Gagal membuat aduan';
      toast.error(message);
    }
  });
}

// Hook untuk verifikasi complaint (SIMRS)
export function useVerifyComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VerifyComplaintData }) => 
      apiClient.verifyComplaint(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Aduan berhasil diverifikasi!');
      queryClient.invalidateQueries(['complaints']);
      queryClient.invalidateQueries(['complaint']);
    },
    onError: (error: any) => {
      const message = error?.message || 'Gagal memverifikasi aduan';
      toast.error(message);
    }
  });
}

// Hook untuk memproses complaint (Teknisi)
export function useProcessComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProcessComplaintData }) => 
      apiClient.processComplaint(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Aduan berhasil diproses!');
      queryClient.invalidateQueries(['complaints']);
      queryClient.invalidateQueries(['complaint']);
    },
    onError: (error: any) => {
      const message = error?.message || 'Gagal memproses aduan';
      toast.error(message);
    }
  });
}

// Hook untuk menyelesaikan complaint (Teknisi)
export function useFinishComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FinishComplaintData }) => 
      apiClient.finishComplaint(id, data),
    onSuccess: (response) => {
      toast.success(response.message || 'Aduan berhasil diselesaikan!');
      queryClient.invalidateQueries(['complaints']);
      queryClient.invalidateQueries(['complaint']);
    },
    onError: (error: any) => {
      const message = error?.message || 'Gagal menyelesaikan aduan';
      toast.error(message);
    }
  });
}

// Custom hook untuk filter dan pagination
export function useComplaintFilters(initialFilters?: ComplaintFilters) {
  const [filters, setFilters] = useState<ComplaintFilters>(
    initialFilters || {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
  );

  // Update filter
  const updateFilter = (key: keyof ComplaintFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset ke page 1 jika bukan update page
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // Update multiple filters
  const updateFilters = (newFilters: Partial<ComplaintFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset ke page 1
    }));
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    updateFilters,
    setFilters
  };
}

// Hook untuk statistik complaint
export function useComplaintStats() {
  return useQuery({
    queryKey: ['complaint-stats'],
    queryFn: () => apiClient.getDashboardStats(),
    staleTime: 300000, // 5 minutes
  });
}

// Hook untuk real-time updates (bisa dikembangkan dengan WebSocket)
export function useComplaintUpdates(complaintId?: string) {
  const queryClient = useQueryClient();

  const refreshComplaint = () => {
    if (complaintId) {
      queryClient.invalidateQueries(['complaint', complaintId]);
    }
    queryClient.invalidateQueries(['complaints']);
  };

  // Polling untuk update (bisa diganti dengan WebSocket)
  useEffect(() => {
    if (complaintId) {
      const interval = setInterval(() => {
        queryClient.invalidateQueries(['complaint', complaintId]);
      }, 30000); // Refresh setiap 30 detik

      return () => clearInterval(interval);
    }
  }, [complaintId, queryClient]);

  return { refreshComplaint };
}

// Helper functions untuk status dan priority
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Menunggu Verifikasi':
      return 'badge-pending';
    case 'Diterima SIM RS':
      return 'badge-approved';
    case 'Ditolak SIM RS':
      return 'badge-rejected';
    case 'Diproses Teknisi':
      return 'badge-processing';
    case 'Selesai':
      return 'badge-completed';
    default:
      return 'badge-pending';
  }
};

export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'priority-low';
    case 'medium':
      return 'priority-medium';
    case 'high':
      return 'priority-high';
    default:
      return 'priority-medium';
  }
};

export const getStatusText = (status: string): string => {
  return status;
};

export const getPriorityText = (priority: string): string => {
  switch (priority) {
    case 'low':
      return 'Rendah';
    case 'medium':
      return 'Sedang';
    case 'high':
      return 'Tinggi';
    default:
      return priority;
  }
};

// Hook untuk file upload progress
export function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const resetUpload = () => {
    setUploadProgress(0);
    setIsUploading(false);
  };

  return {
    uploadProgress,
    isUploading,
    setUploadProgress,
    setIsUploading,
    resetUpload
  };
}
