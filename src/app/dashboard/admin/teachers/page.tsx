'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent } from '@/components/ui/Card';
import { schoolService } from '@/services/schoolService';
import { userService } from '@/services/userService';
import { School, Profile } from '@/types/user';
import { Users, Plus, X, School as SchoolIcon, Pencil, Trash2 } from 'lucide-react';

const createSchema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  schoolId: z.string().min(1, 'Selecione uma escola'),
});
const editSchema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  schoolId: z.string().min(1, 'Selecione uma escola'),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

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

function TeachersContent() {
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolMap, setSchoolMap] = useState<Record<string, string>>({});
  const [filterSchool, setFilterSchool] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Profile | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  const load = async () => {
    const [t, s] = await Promise.all([userService.getAllTeachers(), schoolService.getAllSchools()]);
    setTeachers(t);
    setSchools(s);
    const map: Record<string, string> = {};
    s.forEach((sc) => { map[sc.id] = sc.name; });
    setSchoolMap(map);
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (data: CreateForm) => {
    try {
      setFormError(null);
      await userService.createTeacher(data);
      createForm.reset();
      setShowCreateModal(false);
      await load();
    } catch (err: any) { setFormError(err.message); }
  };

  const openEdit = (teacher: Profile) => {
    setEditingTeacher(teacher);
    editForm.reset({ name: teacher.name ?? '', schoolId: teacher.school_id ?? '' });
  };

  const onEdit = async (data: EditForm) => {
    if (!editingTeacher) return;
    try {
      setFormError(null);
      await userService.updateTeacher(editingTeacher.id, { name: data.name, schoolId: data.schoolId });
      setEditingTeacher(null);
      await load();
    } catch (err: any) { setFormError(err.message); }
  };

  const handleDelete = async (teacher: Profile) => {
    if (!confirm(`Excluir o professor "${teacher.name}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(teacher.id);
    try {
      await userService.deleteTeacher(teacher.id);
      await load();
    } catch (err: any) { alert(err.message); }
    setDeletingId(null);
  };

  const filtered = filterSchool ? teachers.filter((t) => t.school_id === filterSchool) : teachers;

  return (
    <AppLayout title="Professores">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-3">
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas as escolas</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <span className="text-sm text-gray-500">{filtered.length} professor(es)</span>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Professor
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-14 w-14 text-gray-200 mb-4" />
                <p className="font-medium text-gray-500">Nenhum professor encontrado</p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((teacher) => (
                  <div key={teacher.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold text-sm flex-shrink-0">
                      {(teacher.name ?? 'P').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{teacher.name}</p>
                      {teacher.school_id && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <SchoolIcon className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-400 truncate">{schoolMap[teacher.school_id] ?? '—'}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEdit(teacher)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher)}
                        disabled={deletingId === teacher.id}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Criar */}
      {showCreateModal && (
        <Modal title="Novo Professor" onClose={() => { setShowCreateModal(false); createForm.reset(); setFormError(null); }}>
          <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="t-name">Nome Completo</Label>
              <Input id="t-name" {...createForm.register('name')} />
              {createForm.formState.errors.name && <p className="text-xs text-red-500">{createForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-email">E-mail</Label>
              <Input id="t-email" type="email" {...createForm.register('email')} />
              {createForm.formState.errors.email && <p className="text-xs text-red-500">{createForm.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-password">Senha Inicial</Label>
              <Input id="t-password" type="password" {...createForm.register('password')} />
              {createForm.formState.errors.password && <p className="text-xs text-red-500">{createForm.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-school">Escola</Label>
              <select id="t-school" {...createForm.register('schoolId')} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione...</option>
                {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {createForm.formState.errors.schoolId && <p className="text-xs text-red-500">{createForm.formState.errors.schoolId.message}</p>}
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); createForm.reset(); setFormError(null); }}>Cancelar</Button>
              <Button type="submit" disabled={createForm.formState.isSubmitting}>
                {createForm.formState.isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Editar */}
      {editingTeacher && (
        <Modal title="Editar Professor" onClose={() => { setEditingTeacher(null); setFormError(null); }}>
          <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="e-name">Nome Completo</Label>
              <Input id="e-name" {...editForm.register('name')} />
              {editForm.formState.errors.name && <p className="text-xs text-red-500">{editForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-school">Escola</Label>
              <select id="e-school" {...editForm.register('schoolId')} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione...</option>
                {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {editForm.formState.errors.schoolId && <p className="text-xs text-red-500">{editForm.formState.errors.schoolId.message}</p>}
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => { setEditingTeacher(null); setFormError(null); }}>Cancelar</Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting}>
                {editForm.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

export default function TeachersPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <TeachersContent />
    </ProtectedRoute>
  );
}
