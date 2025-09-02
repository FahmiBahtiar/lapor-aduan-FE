import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';
import {
  ApiResponse,
  PaginatedResponse,
  User,
  Complaint,
  ComplaintFilters,
  UserFilters,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  ComplaintFormData,
  VerifyComplaintData,
  ProcessComplaintData,
  FinishComplaintData,
  DashboardStats
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // Gunakan environment variable untuk API URL
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 
                   (process.env.NODE_ENV === 'production' 
                     ? 'https://your-backend-domain.vercel.app/api'
                     : 'http://localhost:5000/api');

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000, // Increase timeout untuk production
      withCredentials: false, // Set ke false untuk cross-domain
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor untuk menambahkan token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor untuk handle error
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired atau invalid
          Cookies.remove('token');
          Cookies.remove('user');
          
          // Redirect ke login jika bukan di halaman login
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }

        // Show error message
        const message = error.response?.data?.message || 'Terjadi kesalahan pada server';
        toast.error(message);

        return Promise.reject(error);
      }
    );
  }

  // Generic request method
  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.client.request<T>(config);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    return this.request({
      method: 'POST',
      url: '/auth/login',
      data: credentials,
    });
  }

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return this.request({
      method: 'POST',
      url: '/auth/register',
      data,
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request({
      method: 'GET',
      url: '/auth/profile',
    });
  }

  async updateProfile(data: { name: string }): Promise<ApiResponse<{ user: User }>> {
    return this.request({
      method: 'PUT',
      url: '/auth/profile',
      data,
    });
  }

  // Complaint endpoints
  async createComplaint(data: ComplaintFormData): Promise<ApiResponse<{ complaint: Complaint }>> {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('priority', data.priority);
    
    if (data.attachment && data.attachment.length > 0) {
      formData.append('attachment', data.attachment[0]);
    }

    return this.request({
      method: 'POST',
      url: '/complaints',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getComplaints(filters?: ComplaintFilters): Promise<PaginatedResponse<Complaint>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    return this.request({
      method: 'GET',
      url: `/complaints${params.toString() ? `?${params.toString()}` : ''}`,
    });
  }

  async getComplaintById(id: string): Promise<ApiResponse<{ complaint: Complaint }>> {
    return this.request({
      method: 'GET',
      url: `/complaints/${id}`,
    });
  }

  async updateComplaint(id: string, data: ComplaintFormData): Promise<ApiResponse<{ complaint: Complaint }>> {
    const formData = new FormData();
    
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('priority', data.priority);
    
    if (data.attachment && data.attachment.length > 0) {
      formData.append('attachment', data.attachment[0]);
    }

    return this.request({
      method: 'PUT',
      url: `/complaints/${id}`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteComplaint(id: string): Promise<ApiResponse> {
    return this.request({
      method: 'DELETE',
      url: `/complaints/${id}`,
    });
  }

  async verifyComplaint(id: string, data: VerifyComplaintData): Promise<ApiResponse<{ complaint: Complaint }>> {
    return this.request({
      method: 'PUT',
      url: `/complaints/${id}/verify`,
      data,
    });
  }

  async processComplaint(id: string, data: ProcessComplaintData): Promise<ApiResponse<{ complaint: Complaint }>> {
    return this.request({
      method: 'PUT',
      url: `/complaints/${id}/process`,
      data,
    });
  }

  async finishComplaint(id: string, data: FinishComplaintData): Promise<ApiResponse<{ complaint: Complaint }>> {
    return this.request({
      method: 'PUT',
      url: `/complaints/${id}/finish`,
      data,
    });
  }

  async takeComplaint(id: string): Promise<ApiResponse<{ complaint: Complaint }>> {
    return this.request({
      method: 'PUT',
      url: `/complaints/${id}/take`,
    });
  }

  // Admin endpoints
  async getAllComplaints(filters?: ComplaintFilters): Promise<PaginatedResponse<Complaint>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    return this.request({
      method: 'GET',
      url: `/admin/complaints${params.toString() ? `?${params.toString()}` : ''}`,
    });
  }

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request({
      method: 'GET',
      url: '/admin/stats',
    });
  }

  async getAllUsers(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    return this.request({
      method: 'GET',
      url: `/admin/users${params.toString() ? `?${params.toString()}` : ''}`,
    });
  }

  async getTechnicians(): Promise<PaginatedResponse<User>> {
    return this.request({
      method: 'GET',
      url: '/users/technicians',
    });
  }

  async createUser(data: RegisterData): Promise<ApiResponse<{ user: User }>> {
    return this.request({
      method: 'POST',
      url: '/admin/users',
      data,
    });
  }

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return this.request({
      method: 'PUT',
      url: `/admin/users/${id}`,
      data,
    });
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request({
      method: 'DELETE',
      url: `/admin/users/${id}`,
    });
  }

  // Category endpoints
  async getCategories(includeInactive?: boolean): Promise<ApiResponse<{ categories: any[], total: number }>> {
    const params = includeInactive ? '?includeInactive=true' : '';
    return this.request({
      method: 'GET',
      url: `/categories${params}`,
    });
  }

  async createCategory(data: { name: string; description?: string }): Promise<ApiResponse<{ category: any }>> {
    return this.request({
      method: 'POST',
      url: '/categories',
      data,
    });
  }

  async updateCategory(id: string, data: { name?: string; description?: string; isActive?: boolean }): Promise<ApiResponse<{ category: any }>> {
    return this.request({
      method: 'PUT',
      url: `/categories/${id}`,
      data,
    });
  }

  async deleteCategory(id: string, force?: boolean): Promise<ApiResponse> {
    const params = force ? '?force=true' : '';
    return this.request({
      method: 'DELETE',
      url: `/categories/${id}${params}`,
    });
  }

  async restoreCategory(id: string): Promise<ApiResponse<{ category: any }>> {
    return this.request({
      method: 'POST',
      url: `/categories/${id}/restore`,
    });
  }

  async getCategoryStats(): Promise<ApiResponse<any>> {
    return this.request({
      method: 'GET',
      url: '/categories/stats',
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export methods dengan bind untuk mempertahankan context
export const login = apiClient.login.bind(apiClient);
export const register = apiClient.register.bind(apiClient);
export const getProfile = apiClient.getProfile.bind(apiClient);
export const updateProfile = apiClient.updateProfile.bind(apiClient);
export const createComplaint = apiClient.createComplaint.bind(apiClient);
export const getComplaints = apiClient.getComplaints.bind(apiClient);
export const getComplaintById = apiClient.getComplaintById.bind(apiClient);
export const updateComplaint = apiClient.updateComplaint.bind(apiClient);
export const deleteComplaint = apiClient.deleteComplaint.bind(apiClient);
export const verifyComplaint = apiClient.verifyComplaint.bind(apiClient);
export const processComplaint = apiClient.processComplaint.bind(apiClient);
export const finishComplaint = apiClient.finishComplaint.bind(apiClient);
export const getAllComplaints = apiClient.getAllComplaints.bind(apiClient);
export const getDashboardStats = apiClient.getDashboardStats.bind(apiClient);
export const getAllUsers = apiClient.getAllUsers.bind(apiClient);
export const getTechnicians = apiClient.getTechnicians.bind(apiClient);
export const createUser = apiClient.createUser.bind(apiClient);
export const updateUser = apiClient.updateUser.bind(apiClient);
export const deleteUser = apiClient.deleteUser.bind(apiClient);
export const getCategories = apiClient.getCategories.bind(apiClient);
export const createCategory = apiClient.createCategory.bind(apiClient);
export const updateCategory = apiClient.updateCategory.bind(apiClient);
export const deleteCategory = apiClient.deleteCategory.bind(apiClient);
export const restoreCategory = apiClient.restoreCategory.bind(apiClient);
export const getCategoryStats = apiClient.getCategoryStats.bind(apiClient);

export { apiClient };
