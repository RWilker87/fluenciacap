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
import { Users, Plus, X, School as SchoolIcon } from 'lucide-react';

const schema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  schoolId: z.string().min(1, 'Selecione uma escola'),
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

function TeachersContent() {
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolMap, setSchoolMap] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [filterSchool, setFilterSchool] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const load = async () => {
    const [t, s] = await Promise.all([
      userService.getAllTeachers(),
      schoolService.getAllSchools(),
    ]);
    setTeachers(t);
    setSchools(s);
    const map: Record<string, string> = {};
    s.forEach((sc) => { map[sc.id] = sc.name; });
    setSchoolMap(map);
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (data: FormValues) => {
    try {
      setFormError(null);
      await userService.createTeacher({ ...data });
      reset();
      setShowModal(false);
      await load();
    } catch (err: any) {
      setFormError(err.message);
    }
  };

  const filtered = filterSchool
    ? teachers.filter((t) => t.school_id === filterSchool)
    : teachers;

  return (
    <AppLayout title="Professores">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
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
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Professor
          </Button>
        </div>

        {/* Lista */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-14 w-14 text-gray-200 mb-4" />
                <p className="font-medium text-gray-500">Nenhum professor cadastrado</p>
                <p className="text-sm text-gray-400 mt-1">Clique em "Novo Professor" para adicionar</p>
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
                          <p className="text-xs text-gray-400 truncate">
                            {schoolMap[teacher.school_id] ?? 'Escola não encontrada'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <Modal title="Novo Professor" onClose={() => { setShowModal(false); reset(); }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="t-name">Nome Completo</Label>
              <Input id="t-name" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-email">E-mail</Label>
              <Input id="t-email" type="email" {...register('email')} />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-password">Senha Inicial</Label>
              <Input id="t-password" type="password" {...register('password')} />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-school">Escola</Label>
              <select
                id="t-school"
                {...register('schoolId')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma escola...</option>
                {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.schoolId && <p className="text-xs text-red-500">{errors.schoolId.message}</p>}
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowModal(false); reset(); }}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar Professor'}
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
