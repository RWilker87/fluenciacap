'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { classroomService } from '@/services/classroomService';
import { studentService } from '@/services/studentService';
import { Classroom, Student } from '@/types/user';
import { GraduationCap, ChevronLeft, PlayCircle } from 'lucide-react';

function ClassroomDetailTeacherContent({ classroomId }: { classroomId: string }) {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      classroomService.getClassroom(classroomId),
      studentService.getStudentsByClassroom(classroomId),
    ]).then(([cls, sts]) => {
      setClassroom(cls);
      setStudents(sts);
      setLoading(false);
    });
  }, [classroomId]);

  return (
    <AppLayout title={classroom?.name ?? 'Turma'}>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Link
          href="/dashboard/teacher/classrooms"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para Turmas
        </Link>

        {/* Info da turma */}
        <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <p className="text-sm opacity-80 mb-1">Turma</p>
          <h2 className="text-2xl font-bold">{classroom?.name ?? '...'}</h2>
          <p className="mt-1 text-sm opacity-80">{students.length} aluno(s) matriculado(s)</p>
        </div>

        {/* Lista de alunos — somente leitura */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <GraduationCap className="h-14 w-14 text-gray-200 mb-4" />
                <p className="font-medium text-gray-500">Nenhum aluno nesta turma</p>
                <p className="text-sm text-gray-400 mt-1">Solicite ao administrador para cadastrar alunos.</p>
              </div>
            ) : (
              <div className="divide-y">
                {students.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                        {index + 1}
                      </span>
                      <p className="font-medium text-gray-900">{student.name}</p>
                    </div>
                    {/* Botão futuro: Iniciar Avaliação */}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="text-xs gap-1.5 opacity-60 cursor-not-allowed"
                    >
                      <PlayCircle className="h-3.5 w-3.5" />
                      Iniciar Avaliação
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Aviso informativo */}
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          💡 O botão <strong>"Iniciar Avaliação"</strong> será habilitado na próxima etapa do sistema, quando o módulo de avaliação de fluência leitora for implementado.
        </div>
      </div>
    </AppLayout>
  );
}

export default function TeacherClassroomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <ProtectedRoute requiredRole="teacher">
      <ClassroomDetailTeacherContent classroomId={id} />
    </ProtectedRoute>
  );
}
