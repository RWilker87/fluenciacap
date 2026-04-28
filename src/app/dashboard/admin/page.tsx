'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { schoolService } from '@/services/schoolService';
import { userService } from '@/services/userService';
import { School as SchoolIcon, Users, Plus } from 'lucide-react';
import Link from 'next/link';

function AdminDashboardContent() {
  const { profile } = useAuth();
  const [schoolCount, setSchoolCount] = useState(0);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    schoolService.getAllSchools().then((s) => setSchoolCount(s.length));
    userService.getAllUsers().then((u) => setUserCount(u.filter(x => x.role !== 'admin').length));
  }, []);

  return (
    <AppLayout title="Visão Geral">
      {/* Boas-vindas */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-primary-800 to-primary-900 p-6 text-white">
        <p className="text-sm font-medium opacity-80">Bem-vindo(a),</p>
        <h2 className="text-2xl font-bold">{profile?.name ?? 'Administrador'}</h2>
        <p className="mt-1 text-sm opacity-80">Secretaria de Educação — Painel Administrativo</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-500">
              <SchoolIcon className="h-4 w-4" /> Escolas Cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{schoolCount}</p>
            <Link href="/dashboard/admin/schools" className="text-xs text-primary-800 hover:underline mt-2 inline-block">
              Gerenciar escolas →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-500">
              <Users className="h-4 w-4" /> Usuários Cadastrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{userCount}</p>
            <Link href="/dashboard/admin/users" className="text-xs text-primary-800 hover:underline mt-2 inline-block">
              Gerenciar usuários →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Ações rápidas */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/admin/schools">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Nova Escola
            </Button>
          </Link>
          <Link href="/dashboard/admin/users">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Novo Usuário
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}
