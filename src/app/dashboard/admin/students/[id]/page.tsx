'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StudentDetailContent } from '@/components/dashboard/StudentDetailContent';

export default function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return (
    <ProtectedRoute requiredRole="admin">
      <StudentDetailContent 
        studentId={id} 
        backHref="/dashboard/admin/students" 
        backLabel="Voltar para Alunos" 
      />
    </ProtectedRoute>
  );
}
