'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StudentDetailContent } from '@/components/dashboard/StudentDetailContent';

export default function TeacherStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // O link de voltar ideal seria para a turma específica, mas como não temos o ID da turma
  // na URL atual (só o ID do aluno), voltamos para a listagem geral de turmas.
  // Uma melhoria futura seria passar via query param ?classroomId=...
  
  return (
    <ProtectedRoute requiredRole="professor">
      <StudentDetailContent 
        studentId={id} 
        backHref="/dashboard/teacher/classrooms" 
        backLabel="Voltar para Turmas" 
      />
    </ProtectedRoute>
  );
}
