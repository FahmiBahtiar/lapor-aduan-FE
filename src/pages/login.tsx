import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth, useRedirectIfAuthenticated } from '@/hooks/useAuth';
import { LoginCredentials } from '@/types';

interface LoginFormData {
  username: string;
  password: string;
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useAuth();
  const { loading: redirectLoading } = useRedirectIfAuthenticated();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (error: any) {
      // Handle specific errors
      if (error?.message?.includes('username')) {
        setError('username', { message: error.message });
      } else if (error?.message?.includes('password')) {
        setError('password', { message: error.message });
      } else {
        setError('root', { 
          message: error?.message || 'Login gagal. Silakan coba lagi.' 
        });
      }
    }
  };

  // Show loading while checking authentication
  if (redirectLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-600">
            <svg 
              className="h-8 w-8 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Masuk ke Akun Anda
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistem Laporan Aduan
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                {...register('username', {
                  required: 'Username wajib diisi',
                  minLength: {
                    value: 3,
                    message: 'Username minimal 3 karakter'
                  }
                })}
                type="text"
                autoComplete="username"
                className={`form-input ${errors.username ? 'border-red-500' : ''}`}
                placeholder="Masukkan username"
              />
              {errors.username && (
                <p className="form-error">{errors.username.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password wajib diisi',
                    minLength: {
                      value: 6,
                      message: 'Password minimal 6 karakter'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`form-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Masukkan password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Root Error */}
          {errors.root && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full btn-primary py-3 text-base"
            >
              {isSubmitting || loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner mr-2"></div>
                  Masuk...
                </div>
              ) : (
                'Masuk'
              )}
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Daftar di sini
              </Link>
            </p>
          </div>
        </form>

        {/* Demo Accounts */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Demo Accounts:</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Admin:</strong> admin / password123</div>
            <div><strong>SIMRS:</strong> simrs_operator / password123</div>
            <div><strong>Teknisi:</strong> teknisi1 / password123</div>
            <div><strong>Ruangan ICU:</strong> ruang_icu / password123</div>
            <div><strong>Ruangan IGD:</strong> ruang_igd / password123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
