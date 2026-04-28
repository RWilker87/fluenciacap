'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent } from '@/components/ui/Card';
import { classroomService } from '@/services/classroomService';
import { studentService } from '@/services/studentService';
import { Classroom, Student } from '@/types/user';
import { GraduationCap, Plus, Trash2, X, ChevronLeft } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Nome do aluno é obrigatório'),
});
type FormValues = z.infer<typeof schema>;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ClassroomDetailContent({ classroomId }: { classroomId: string }) {
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const loadStudents = async () => {
    const data = await studentService.getStudentsByClassroom(classroomId);
    setStudents(data);
  };

  useEffect(() => {
    classroomService.getClassroom(classroomId).then(setClassroom);
    loadStudents();
  }, [classroomId]);

  const onSubmit = async (data: FormValues) => {
    setFormError(null);
    const student = await studentService.createStudent(data.name, classroomId);
    if (!student) { setFormError('Erro ao adicionar aluno.'); return; }
    reset();
    setShowModal(false);
    await loadStudents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este aluno?')) return;
    setDeletingId(id);
    await studentService.deleteStudent(id);
    setDeletingId(null);
    await loadStudents();
  };

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

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{classroom?.name}</h2>
            <p className="text-sm text-gray-500">{students.length} aluno(s) cadastrado(s)</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Adicionar Aluno
          </Button>
        </div>

        {/* Lista de alunos */}
        <Card>
          <CardContent className="p-0">
            {students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <GraduationCap className="h-14 w-14 text-gray-200 mb-4" />
                <p className="font-medium text-gray-500">Nenhum aluno cadastrado</p>
                <p className="text-sm text-gray-400 mt-1">Clique em "Adicionar Aluno" para começar</p>
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
                    <button
                      onClick={() => handleDelete(student.id)}
                      disabled={deletingId === student.id}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <Modal title="Adicionar Aluno" onClose={() => { setShowModal(false); reset(); }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="student-name">Nome do Aluno</Label>
              <Input id="student-name" placeholder="Nome completo" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowModal(false); reset(); }}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adicionando...' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

export default function ClassroomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <ProtectedRoute requiredRole="teacher">
      <ClassroomDetailContent classroomId={id} />
    </ProtectedRoute>
  );
}
