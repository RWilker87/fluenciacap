'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, role, loading } = useAuth(true);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return; // useAuth já cuida do redirect para /login
    if (role === 'admin') router.replace('/dashboard/admin');
    else if (role === 'gestor') router.replace('/dashboard/gestor');
    else if (role === 'coordenador') router.replace('/dashboard/coordenador');
    else if (role === 'professor' || role === 'teacher') router.replace('/dashboard/teacher');
  }, [role, loading, router, user]);

  // Perfil não encontrado no banco
  if (!loading && user && !role) {
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

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-800 border-t-transparent" />
        <p className="text-sm text-gray-500">Redirecionando...</p>
      </div>
    </div>
  );
}
