import { ReactNode, ComponentType } from 'react';

// User types
export type UserRole = 'ruangan' | 'simrs' | 'teknisi' | 'admin';

export interface User {
  _id: string;
  username: string;
  ruangan: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Complaint types
export type ComplaintStatus = 
  | 'Menunggu Verifikasi'
  | 'Ditolak SIM RS'
  | 'Diterima SIM RS'
  | 'Diproses Teknisi'
  | 'Selesai';

export type ComplaintPriority = 'low' | 'medium' | 'high';

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: ComplaintPriority;
  attachment?: string;
  status: ComplaintStatus;
  createdBy: User;
  verifiedBy?: User;
  assignedTo?: User;
  notes?: string;
  rejectionReason?: string;
  processNotes?: string;
  completionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  status: 'success';
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  ruangan: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Form types
export interface ComplaintFormData {
  title: string;
  description: string;
  category: string;
  priority: ComplaintPriority;
  attachment?: FileList;
}

export interface VerifyComplaintData {
  action?: 'approve' | 'reject';
  status?: string;
  notes?: string;
  rejectionReason?: string;
  assignedTo?: string;
}

export interface ProcessComplaintData {
  processNotes?: string;
}

export interface FinishComplaintData {
  completionNotes: string;
}

// Dashboard types
export interface DashboardStats {
  overview: {
    totalComplaints: number;
    complaintsByStatus: Record<ComplaintStatus, number>;
    complaintsByPriority: Record<ComplaintPriority, number>;
  };
  charts: {
    monthlyStats: Array<{
      _id: { year: number; month: number };
      count: number;
      completed: number;
    }>;
    complaintsByCategory: Array<{
      _id: string;
      count: number;
    }>;
  };
  technicians: Array<{
    _id: string;
    username: string;
    ruangan: string;
    totalAssigned: number;
    completed: number;
    completionRate: number;
  }>;
  recentActivities: Complaint[];
  performance: {
    responseTime: {
      avgResponseTime: number;
      minResponseTime: number;
      maxResponseTime: number;
    };
  };
}

// Query types
export interface ComplaintFilters {
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  category?: string;
  createdBy?: string;
  assignedTo?: string;
  verifiedBy?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  role?: UserRole;
  page?: number;
  limit?: number;
  search?: string;
}

// Error types
export interface ApiError {
  status: 'error';
  message: string;
  errors?: string[];
}

// File upload types
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  current?: boolean;
  roles?: UserRole[];
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  className?: string;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Toast types
export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

// Chart types
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// Next.js types
export interface GetServerSidePropsContext {
  req: any;
  res: any;
  query: any;
}

export interface PageProps {
  user?: User;
  [key: string]: any;
}
