'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { classroomService } from '@/services/classroomService';
import { useAuth } from '@/hooks/useAuth';
import { Classroom } from '@/types/user';
import { BookOpen, Users, ChevronRight } from 'lucide-react';

function ClassroomsTeacherContent() {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    classroomService.getClassroomsByTeacher(user.id).then((data) => {
      setClassrooms(data);
      setLoading(false);
    });
  }, [user]);

  return (
    <AppLayout title="Minhas Turmas">
      <div className="space-y-6">
        <p className="text-sm text-gray-500">{classrooms.length} turma(s) atribuída(s) a você</p>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : classrooms.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-14 w-14 text-gray-200 mb-4" />
              <p className="font-medium text-gray-500">Nenhuma turma atribuída</p>
              <p className="text-sm text-gray-400 mt-1">
                Entre em contato com o administrador da secretaria para vincular turmas ao seu perfil.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classrooms.map((classroom) => (
              <Link
                key={classroom.id}
                href={`/dashboard/teacher/classrooms/${classroom.id}`}
                className="group rounded-xl border bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors mt-1" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{classroom.name}</h3>
                <p className="text-xs text-gray-400">
                  Criada em {new Date(classroom.created_at).toLocaleDateString('pt-BR')}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-blue-600">
                  <Users className="h-3.5 w-3.5" />
                  Ver alunos
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default function TeacherClassroomsPage() {
  return (
    <ProtectedRoute requiredRole="professor">
      <ClassroomsTeacherContent />
    </ProtectedRoute>
  );
}
