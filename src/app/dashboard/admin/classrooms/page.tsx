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
import { classroomService } from '@/services/classroomService';
import { schoolService } from '@/services/schoolService';
import { userService } from '@/services/userService';
import { Classroom, School, Profile } from '@/types/user';
import { BookOpen, Plus, Trash2, X, School as SchoolIcon, Users } from 'lucide-react';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  schoolId: z.string().min(1, 'Selecione uma escola'),
  teacherId: z.string().min(1, 'Selecione um professor'),
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

function ClassroomsAdminContent() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [schoolMap, setSchoolMap] = useState<Record<string, string>>({});
  const [teacherMap, setTeacherMap] = useState<Record<string, string>>({});
  const [filterSchool, setFilterSchool] = useState('');
  const [filterTeacher, setFilterTeacher] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  // Professores filtrados pela escola selecionada no form
  const [formSchoolId, setFormSchoolId] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState<Profile[]>([]);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const watchSchoolId = watch('schoolId');

  const load = async () => {
    const [cls, sch, tch] = await Promise.all([
      classroomService.getAllClassrooms(),
      schoolService.getAllSchools(),
      userService.getUsersByRole('professor'),
    ]);
    setClassrooms(cls);
    setSchools(sch);
    setTeachers(tch);
    const sm: Record<string, string> = {};
    sch.forEach((s) => { sm[s.id] = s.name; });
    setSchoolMap(sm);
    const tm: Record<string, string> = {};
    tch.forEach((t) => { tm[t.id] = t.name ?? ''; });
    setTeacherMap(tm);
  };

  useEffect(() => { load(); }, []);

  // Filtra professores quando escola muda no formulário
  useEffect(() => {
    if (watchSchoolId) {
      setFilteredTeachers(teachers.filter((t) => t.school_id === watchSchoolId));
      setValue('teacherId', '');
    } else {
      setFilteredTeachers(teachers);
    }
  }, [watchSchoolId, teachers]);

  const onSubmit = async (data: FormValues) => {
    setFormError(null);
    const classroom = await classroomService.createClassroom(data.name, data.schoolId, data.teacherId);
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

  const filtered = classrooms
    .filter((c) => !filterSchool || c.school_id === filterSchool)
    .filter((c) => !filterTeacher || c.teacher_id === filterTeacher);

  return (
    <AppLayout title="Turmas">
      <div className="space-y-6">
        {/* Header + filtros */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={filterSchool}
              onChange={(e) => { setFilterSchool(e.target.value); setFilterTeacher(''); }}
              className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
            >
              <option value="">Todas as escolas</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={filterTeacher}
              onChange={(e) => setFilterTeacher(e.target.value)}
              className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
            >
              <option value="">Todos os professores</option>
              {(filterSchool ? teachers.filter((t) => t.school_id === filterSchool) : teachers).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">{filtered.length} turma(s)</span>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova Turma
          </Button>
        </div>

        {/* Lista */}
        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <BookOpen className="h-14 w-14 text-gray-200 mb-4" />
                <p className="font-medium text-gray-500">Nenhuma turma encontrada</p>
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((classroom) => (
                  <div key={classroom.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100">
                        <BookOpen className="h-4 w-4 text-primary-800" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{classroom.name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <SchoolIcon className="h-3 w-3" />
                            {schoolMap[classroom.school_id] ?? '—'}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Users className="h-3 w-3" />
                            {teacherMap[classroom.teacher_id] ?? '—'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(classroom.id)}
                      disabled={deletingId === classroom.id}
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
        <Modal title="Nova Turma" onClose={() => { setShowModal(false); reset(); }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cr-name">Nome da Turma</Label>
              <Input id="cr-name" placeholder="Ex: 3º Ano A" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cr-school">Escola</Label>
              <select
                id="cr-school"
                {...register('schoolId')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
              >
                <option value="">Selecione uma escola...</option>
                {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              {errors.schoolId && <p className="text-xs text-red-500">{errors.schoolId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cr-teacher">Professor Responsável</Label>
              <select
                id="cr-teacher"
                {...register('teacherId')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700"
              >
                <option value="">Selecione um professor...</option>
                {filteredTeachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errors.teacherId && <p className="text-xs text-red-500">{errors.teacherId.message}</p>}
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

export default function AdminClassroomsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <ClassroomsAdminContent />
    </ProtectedRoute>
  );
}
