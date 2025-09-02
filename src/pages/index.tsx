import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';

const IndexPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect based on user role
        switch (user.role) {
          case 'admin':
            router.replace('/admin/dashboard');
            break;
          case 'simrs':
            router.replace('/simrs/complaints');
            break;
          case 'teknisi':
            router.replace('/teknisi/complaints');
            break;
          case 'ruangan':
            router.replace('/ruangan/complaints');
            break;
          default:
            router.replace('/login');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [user, loading, router]);

  // Show loading spinner
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <p className="text-gray-600">Memuat...</p>
      </div>
    </div>
  );
};

export default IndexPage;
