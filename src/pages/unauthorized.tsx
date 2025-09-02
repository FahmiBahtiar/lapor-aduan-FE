import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

export default function Unauthorized() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleGoBack = () => {
    if (user) {
      // Redirect to appropriate dashboard based on role
      switch (user.role) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'simrs':
          router.push('/simrs/dashboard');
          break;
        case 'teknisi':
          router.push('/teknisi/complaints');
          break;
        case 'ruangan':
          router.push('/ruangan/complaints');
          break;
        default:
          router.push('/');
      }
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Role Anda: <span className="font-semibold text-blue-600">{user.role}</span>
            </p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoBack}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            {user ? 'Kembali ke Dashboard' : 'Kembali ke Login'}
          </button>
          
          {user && (
            <button
              onClick={logout}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
