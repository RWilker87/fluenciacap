'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { schoolService } from '@/services/schoolService';
import { classroomService } from '@/services/classroomService';
import { School, Classroom } from '@/types/user';
import { BookOpen, GraduationCap, Plus, ChevronRight } from 'lucide-react';

function TeacherDashboardContent() {
  const { user, profile } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    if (profile?.school_id) {
      schoolService.getSchool(profile.school_id).then(setSchool);
    }
    if (user?.id) {
      classroomService.getClassroomsByTeacher(user.id).then(setClassrooms);
    }
  }, [profile, user]);

  return (
    <AppLayout title="Início">
      {/* Boas-vindas */}
      <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <p className="text-sm font-medium opacity-80">Bem-vindo(a),</p>
        <h2 className="text-2xl font-bold">{profile?.name ?? '...'}</h2>
        {school && <p className="mt-1 text-sm opacity-80">📍 {school.name}</p>}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-500">
              <BookOpen className="h-4 w-4" /> Minhas Turmas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{classrooms.length}</p>
            <Link href="/dashboard/teacher/classrooms" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
              Gerenciar turmas →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-500">
              <GraduationCap className="h-4 w-4" /> Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">—</p>
            <p className="text-xs text-gray-400 mt-2">Contagem disponível na próxima etapa</p>
          </CardContent>
        </Card>
      </div>

      {/* Turmas recentes */}
      {classrooms.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Turmas Recentes</h3>
            <Link href="/dashboard/teacher/classrooms" className="text-xs text-blue-600 hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-2">
            {classrooms.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/teacher/classrooms/${c.id}`}
                className="flex items-center justify-between rounded-lg border bg-white px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900 text-sm">{c.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {classrooms.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Você ainda não tem turmas</p>
          <Link href="/dashboard/teacher/classrooms">
            <Button className="mt-4" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Criar primeira turma
            </Button>
          </Link>
        </div>
      )}
    </AppLayout>
  );
}

export default function TeacherDashboardPage() {
  return (
    <ProtectedRoute requiredRole="professor">
      <TeacherDashboardContent />
    </ProtectedRoute>
  );
}
