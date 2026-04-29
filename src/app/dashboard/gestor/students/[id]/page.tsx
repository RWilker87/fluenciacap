'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StudentDetailContent } from '@/components/dashboard/StudentDetailContent';

export default function GestorStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <ProtectedRoute requiredRole="gestor">
      <StudentDetailContent 
        studentId={id} 
        backHref="/dashboard/gestor/students" 
        backLabel="Voltar para Alunos" 
      />
    </ProtectedRoute>
  );
}
