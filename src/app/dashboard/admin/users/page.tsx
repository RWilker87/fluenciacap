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
import { userService, CreateUserPayload } from '@/services/userService';
import { schoolService } from '@/services/schoolService';
import { classroomService } from '@/services/classroomService';
import { Profile, School, Classroom, Role } from '@/types/user';
import { Users, Plus, X, Pencil, Trash2, School as SchoolIcon } from 'lucide-react';

const schema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
  role: z.enum(['gestor', 'coordenador', 'professor']),
  schoolId: z.string().optional(),
  classroomIds: z.array(z.string()).optional(),
}).refine((data) => {
  if (data.role !== 'admin' && !data.schoolId) return false;
  return true;
}, {
  message: 'Escola é obrigatória',
  path: ['schoolId']
});

type FormValues = z.infer<typeof schema>;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function UsersAdminContent() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schoolMap, setSchoolMap] = useState<Record<string, string>>({});
  
  const [filterSchool, setFilterSchool] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const watchRole = form.watch('role');
  const watchSchoolId = form.watch('schoolId');

  const loadData = async () => {
    const [u, s, c] = await Promise.all([
      userService.getAllUsers(),
      schoolService.getAllSchools(),
      classroomService.getAllClassrooms()
    ]);
    // Filtramos admin
    setUsers(u.filter(user => user.role !== 'admin'));
    setSchools(s);
    setClassrooms(c);
    
    const sm: Record<string, string> = {};
    s.forEach((school) => { sm[school.id] = school.name; });
    setSchoolMap(sm);
  };

  useEffect(() => { loadData(); }, []);

  const openCreate = () => {
    setEditingUser(null);
    form.reset({ role: 'professor', classroomIds: [] });
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (user: Profile) => {
    setEditingUser(user);
    form.reset({
      name: user.name ?? '',
      cpf: user.cpf ?? '',
      role: user.role as any,
      schoolId: user.school_id ?? '',
      classroomIds: [] // Precisaria carregar as turmas do coordenador, mas omitido para simplificar
    });
    setFormError(null);
    setShowModal(true);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const email = `${data.cpf?.replace(/\D/g, '')}@lexfluencia.com`;
      
      if (editingUser) {
        await userService.updateUser(editingUser.id, {
          name: data.name,
          cpf: data.cpf,
          role: data.role,
          schoolId: data.schoolId,
          classroomIds: data.classroomIds,
        });
      } else {
        await userService.createUser({
          email,
          password: data.password || 'senha123',
          name: data.name,
          cpf: data.cpf,
          role: data.role,
          schoolId: data.schoolId,
          classroomIds: data.classroomIds,
        });
      }
      
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: Profile) => {
    if (!confirm(`Excluir ${user.name}?`)) return;
    try {
      await userService.deleteUser(user.id);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = users
    .filter(u => !filterSchool || u.school_id === filterSchool)
    .filter(u => !filterRole || u.role === filterRole);

  const schoolClassrooms = watchSchoolId 
    ? classrooms.filter(c => c.school_id === watchSchoolId)
    : [];

  return (
    <AppLayout title="Usuários">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <select value={filterSchool} onChange={(e) => setFilterSchool(e.target.value)} className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todas as escolas</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Todos os tipos</option>
              <option value="gestor">Gestor</option>
              <option value="coordenador">Coordenador</option>
              <option value="professor">Professor</option>
            </select>
            <span className="text-sm text-gray-500">{filtered.length} usuário(s)</span>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> Novo Usuário</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-14 w-14 text-gray-200 mb-4" />
                <p className="font-medium text-gray-500">Nenhum usuário encontrado</p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((user) => (
                  <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                        {(user.name ?? 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          {user.name}
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-600 capitalize">{user.role}</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <SchoolIcon className="h-3 w-3" /> {user.school_id ? schoolMap[user.school_id] : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(user)} className="p-2 text-gray-400 hover:text-blue-600 rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(user)} className="p-2 text-gray-400 hover:text-red-600 rounded">
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

      {showModal && (
        <Modal title={editingUser ? "Editar Usuário" : "Novo Usuário"} onClose={() => setShowModal(false)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome Completo</Label>
              <Input {...form.register('name')} />
            </div>
            <div className="space-y-1.5">
              <Label>CPF (apenas números)</Label>
              <Input {...form.register('cpf')} placeholder="00000000000" maxLength={11} />
            </div>
            {!editingUser && (
              <div className="space-y-1.5">
                <Label>Senha Inicial</Label>
                <Input type="password" {...form.register('password')} placeholder="Mínimo 6 caracteres" />
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label>Tipo de Perfil</Label>
              <select {...form.register('role')} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="professor">Professor</option>
                <option value="coordenador">Coordenador</option>
                <option value="gestor">Gestor</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Escola</Label>
              <select {...form.register('schoolId')} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selecione...</option>
                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {form.formState.errors.schoolId && <p className="text-xs text-red-500">{form.formState.errors.schoolId.message}</p>}
            </div>

            {watchRole === 'coordenador' && watchSchoolId && (
              <div className="space-y-1.5">
                <Label>Turmas Atribuídas</Label>
                <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                  {schoolClassrooms.length === 0 && <p className="text-sm text-gray-400 p-2">Nenhuma turma nesta escola.</p>}
                  {schoolClassrooms.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-sm p-1 hover:bg-gray-50 rounded">
                      <input type="checkbox" value={c.id} {...form.register('classroomIds')} className="rounded border-gray-300" />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

export default function UsersAdminPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <UsersAdminContent />
    </ProtectedRoute>
  );
}
