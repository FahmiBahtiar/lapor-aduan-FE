import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

export default function ClearAuth() {
  const router = useRouter();

  useEffect(() => {
    // Clear all auth-related cookies
    Cookies.remove('token');
    Cookies.remove('user');
    
    // Clear localStorage if any
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    
    // Redirect to login after clearing
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900">Clearing authentication data...</h2>
        <p className="text-gray-600">You will be redirected to login page.</p>
      </div>
    </div>
  );
}
