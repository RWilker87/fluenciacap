'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { schoolService } from '@/services/schoolService';
import { classroomService } from '@/services/classroomService';
import { studentService } from '@/services/studentService';
import { School, Classroom, Student } from '@/types/user';
import { BookOpen, GraduationCap } from 'lucide-react';

function GestorDashboardContent() {
  const { profile } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [studentsCount, setStudentsCount] = useState(0);

  useEffect(() => {
    if (profile?.school_id) {
      schoolService.getSchool(profile.school_id).then(setSchool);
      classroomService.getClassroomsBySchool(profile.school_id).then(async (cls) => {
        setClassrooms(cls);
        let total = 0;
        for (const c of cls) {
          const sts = await studentService.getStudentsByClassroom(c.id);
          total += sts.length;
        }
        setStudentsCount(total);
      });
    }
  }, [profile]);

  return (
    <AppLayout title="Visão Geral">
      <div className="mb-6 rounded-xl bg-gradient-to-r from-secondary-600 to-secondary-800 p-6 text-white">
        <p className="text-sm font-medium opacity-80">Bem-vindo(a) Gestor(a),</p>
        <h2 className="text-2xl font-bold">{profile?.name ?? '...'}</h2>
        {school && <p className="mt-1 text-sm opacity-80">📍 {school.name}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-500">
              <BookOpen className="h-4 w-4" /> Turmas da Escola
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{classrooms.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-500">
              <GraduationCap className="h-4 w-4" /> Total de Alunos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{studentsCount}</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function GestorDashboardPage() {
  return (
    <ProtectedRoute requiredRole="gestor">
      <GestorDashboardContent />
    </ProtectedRoute>
  );
}
