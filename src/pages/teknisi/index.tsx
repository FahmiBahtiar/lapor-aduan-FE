// Redirect to teknisi dashboard
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const TeknisiIndex = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/teknisi/dashboard');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
    </div>
  );
};

export default TeknisiIndex;
