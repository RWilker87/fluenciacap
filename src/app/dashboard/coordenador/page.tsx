'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { coordinatorService } from '@/services/coordinatorService';
import { Classroom } from '@/types/user';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';

function CoordenadorDashboardContent() {
  const { user, profile } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    if (user?.id) {
      coordinatorService.getLinkedClassrooms(user.id).then(setClassrooms);
    }
  }, [user]);

  return (
    <AppLayout title="Início">
      <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <p className="text-sm font-medium opacity-80">Bem-vindo(a) Coordenador(a),</p>
        <h2 className="text-2xl font-bold">{profile?.name ?? '...'}</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-500">
              <BookOpen className="h-4 w-4" /> Turmas Atribuídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{classrooms.length}</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function CoordenadorDashboardPage() {
  return (
    <ProtectedRoute requiredRole="coordenador">
      <CoordenadorDashboardContent />
    </ProtectedRoute>
  );
}
