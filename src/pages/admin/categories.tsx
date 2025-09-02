import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import CategoryManagement from '@/components/admin/CategoryManagement';

export default function Categories() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      window.location.href = '/unauthorized';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Manajemen Kategori
          </h1>
          <p className="text-gray-600">
            Kelola kategori aduan yang tersedia dalam sistem
          </p>
        </div>

        <CategoryManagement isAdmin={true} />
      </div>
    </Layout>
  );
}
