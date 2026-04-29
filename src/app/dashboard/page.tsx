'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Role } from '@/types/user';
import Link from 'next/link';

const ROLE_DASHBOARD_MAP: Record<Role, string> = {
  admin: '/dashboard/admin',
  gestor: '/dashboard/gestor',
  coordenador: '/dashboard/coordenador',
  professor: '/dashboard/teacher',
};

export default function DashboardPage() {
  const { user, profile, role, initializing, loading, error } = useAuthContext();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (initializing || loading) return;

    // Not authenticated → login
    if (!user) {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.replace('/login');
      }
      return;
    }

    // Has role → redirect to correct dashboard
    if (role && !hasRedirected.current) {
      hasRedirected.current = true;
      const target = ROLE_DASHBOARD_MAP[role] || '/dashboard/teacher';
      router.replace(target);
    }
  }, [user, role, initializing, loading, router]);

  const handleRetry = () => {
    window.location.reload();
  };

  // Error from auth timeout
  if (error) {
    return (
      <LoadingScreen
        error={error}
        onRetry={handleRetry}
      />
    );
  }

  // Still loading
  if (initializing || loading) {
    return (
      <LoadingScreen
        message="Redirecionando..."
        onRetry={handleRetry}
      />
    );
  }

  // Perfil não encontrado no banco
  if (user && !role) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-center p-4">
        <div className="max-w-sm space-y-4">
          <div className="text-5xl">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900">Perfil não encontrado</h1>
          <p className="text-gray-500 text-sm">
            Seu usuário está autenticado, mas não possui um perfil cadastrado na base de dados.
            Peça ao administrador para criar seu perfil ou execute o INSERT manual no Supabase.
          </p>
          <p className="text-xs text-gray-400 font-mono bg-gray-100 rounded p-2">
            ID: {user.id}
          </p>
          <Link href="/login" className="inline-block text-sm text-primary-800 hover:underline">
            Sair e tentar novamente
          </Link>
        </div>
      </div>
    );
  }

  // Waiting for redirect
  return (
    <LoadingScreen
      message="Redirecionando..."
      onRetry={handleRetry}
    />
  );
}
