'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Role } from '@/types/user';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

const ROLE_DASHBOARD_MAP: Record<Role, string> = {
  admin: '/dashboard/admin',
  gestor: '/dashboard/gestor',
  coordenador: '/dashboard/coordenador',
  professor: '/dashboard/teacher',
};

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, role, initializing, loading, error } = useAuthContext();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Wait for initial auth to resolve
    if (initializing) return;

    // Not authenticated → go to login
    if (!user) {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        router.replace('/login');
      }
      return;
    }

    // Still loading profile
    if (loading) return;

    // User authenticated but wrong role → redirect to their correct dashboard
    if (requiredRole && profile && profile.role !== requiredRole) {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        const target = ROLE_DASHBOARD_MAP[profile.role] || '/dashboard/teacher';
        router.replace(target);
      }
      return;
    }
  }, [user, profile, role, initializing, loading, requiredRole, router]);

  // Reset redirect flag when route requirements change
  useEffect(() => {
    hasRedirected.current = false;
  }, [requiredRole]);

  const handleRetry = () => {
    window.location.reload();
  };

  // Initializing — show branded loading screen
  if (initializing) {
    return (
      <LoadingScreen
        message="Verificando acesso..."
        onRetry={handleRetry}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <LoadingScreen
        error={error}
        onRetry={handleRetry}
      />
    );
  }

  // Still loading profile
  if (loading) {
    return (
      <LoadingScreen
        message="Carregando seu perfil..."
        onRetry={handleRetry}
      />
    );
  }

  // Not authenticated (waiting for redirect)
  if (!user || !profile) return null;

  // Wrong role (waiting for redirect)
  if (requiredRole && profile.role !== requiredRole) return null;

  return <>{children}</>;
}
