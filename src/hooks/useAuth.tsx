import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import { User, LoginCredentials, RegisterData } from '@/types';
import { apiClient } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
  hasRole: (roles: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check if user has specific role(s)
  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  // Load user from cookie on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = Cookies.get('token');
        const savedUser = Cookies.get('user');

        if (token && savedUser) {
          // Parse saved user
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);

          // Verify token with server
          try {
            const response = await apiClient.getProfile();
            if (response.status === 'success') {
              setUser(response.data!.user);
              // Update cookie with fresh user data
              Cookies.set('user', JSON.stringify(response.data!.user), { expires: 7 });
            }
          } catch (error) {
            // Token invalid, clear cookies
            Cookies.remove('token');
            Cookies.remove('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Clear invalid data
        Cookies.remove('token');
        Cookies.remove('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const response = await apiClient.login(credentials);
      
      if (response.status === 'success' && response.data) {
        const { user: userData, token } = response.data;
        
        // Save to cookies
        Cookies.set('token', token, { expires: 7 });
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });
        
        // Update state
        setUser(userData);
        
        toast.success('Login berhasil!');
        
        // Redirect based on role
        const redirectPath = getRedirectPath(userData.role);
        router.push(redirectPath);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await apiClient.register(data);
      
      if (response.status === 'success' && response.data) {
        const { user: userData, token } = response.data;
        
        // Save to cookies
        Cookies.set('token', token, { expires: 7 });
        Cookies.set('user', JSON.stringify(userData), { expires: 7 });
        
        // Update state
        setUser(userData);
        
        toast.success('Registrasi berhasil!');
        
        // Redirect based on role
        const redirectPath = getRedirectPath(userData.role);
        router.push(redirectPath);
      }
    } catch (error: any) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear cookies
    Cookies.remove('token');
    Cookies.remove('user');
    
    // Clear state
    setUser(null);
    
    toast.success('Logout berhasil!');
    
    // Redirect to login
    router.push('/login');
  };

  // Update user function
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
  };

  // Get redirect path based on role
  const getRedirectPath = (role: string): string => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'simrs':
        return '/simrs/dashboard';
      case 'teknisi':
        return '/teknisi/complaints';
      case 'ruangan':
        return '/ruangan/complaints';
      default:
        return '/dashboard';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: string[]
) {
  const AuthenticatedComponent = (props: P) => {
    const { user, loading, hasRole } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          // Not logged in, redirect to login
          router.replace('/login');
          return;
        }

        if (allowedRoles && !hasRole(allowedRoles)) {
          // User doesn't have required role
          toast.error('Anda tidak memiliki akses ke halaman ini');
          router.replace('/unauthorized');
          return;
        }
      }
    }, [user, loading, hasRole, router]);

    // Show loading spinner while checking auth
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner"></div>
        </div>
      );
    }

    // Don't render if not authenticated or no permission
    if (!user || (allowedRoles && !hasRole(allowedRoles))) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
}

// Hook for redirect if already authenticated
export function useRedirectIfAuthenticated() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const redirectPath = getRedirectPathByRole(user.role);
      router.replace(redirectPath);
    }
  }, [user, loading, router]);

  return { loading };
}

// Helper function to get redirect path by role
function getRedirectPathByRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'simrs':
      return '/simrs/dashboard';
    case 'teknisi':
      return '/teknisi/complaints';
    case 'ruangan':
      return '/ruangan/complaints';
    default:
      return '/dashboard';
  }
}
