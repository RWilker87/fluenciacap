'use client';

import { useState, useEffect } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { Classroom } from '@/types/user';
import { BookOpen, Plus, Trash2, X, ChevronRight, Users } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Nome da turma é obrigatório'),
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

function ClassroomsContent() {
  const { user, profile } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const load = async () => {
    if (!user) return;
    const data = await classroomService.getClassroomsByTeacher(user.id);
    setClassrooms(data);
  };

  useEffect(() => { load(); }, [user]);

  const onSubmit = async (data: FormValues) => {
    if (!user || !profile?.school_id) {
      setFormError('Perfil sem escola vinculada. Contate o administrador.');
      return;
    }
    setFormError(null);
    const classroom = await classroomService.createClassroom(
      data.name,
      profile.school_id,
      user.id
    );
    if (!classroom) { setFormError('Erro ao criar turma.'); return; }
    reset();
    setShowModal(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta turma? Todos os alunos serão removidos.')) return;
    setDeletingId(id);
    await classroomService.deleteClassroom(id);
    setDeletingId(null);
    await load();
  };

  return (
    <AppLayout title="Minhas Turmas">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">{classrooms.length} turma(s)</p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova Turma
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-14 w-14 text-gray-200 mb-4" />
                <p className="font-medium text-gray-500">Nenhuma turma cadastrada</p>
                <p className="text-sm text-gray-400 mt-1">Clique em "Nova Turma" para criar</p>
              </CardContent>
            </Card>
          ) : (
            classrooms.map((classroom) => (
              <div key={classroom.id} className="group relative rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <button
                    onClick={() => handleDelete(classroom.id)}
                    disabled={deletingId === classroom.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{classroom.name}</h3>
                <p className="text-xs text-gray-400 mb-4">
                  Criada em {new Date(classroom.created_at).toLocaleDateString('pt-BR')}
                </p>
                <Link
                  href={`/dashboard/teacher/classrooms/${classroom.id}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <Users className="h-4 w-4" />
                  Ver alunos
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <Modal title="Nova Turma" onClose={() => { setShowModal(false); reset(); }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cr-name">Nome da Turma</Label>
              <Input id="cr-name" placeholder="Ex: 3º Ano A" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowModal(false); reset(); }}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Criando...' : 'Criar Turma'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

export default function ClassroomsPage() {
  return (
    <ProtectedRoute requiredRole="teacher">
      <ClassroomsContent />
    </ProtectedRoute>
  );
}
