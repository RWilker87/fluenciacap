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
import { studentService } from '@/services/studentService';
import { classroomService } from '@/services/classroomService';
import { schoolService } from '@/services/schoolService';
import { Student, Classroom, School } from '@/types/user';
import { GraduationCap, Plus, Trash2, X, BookOpen, Pencil } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  classroomId: z.string().min(1, 'Selecione uma turma'),
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

function StudentsAdminContent() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classroomMap, setClassroomMap] = useState<Record<string, string>>({});
  const [filterSchool, setFilterSchool] = useState('');
  const [filterClassroom, setFilterClassroom] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createForm = useForm<FormValues>({ resolver: zodResolver(schema) });
  const editForm = useForm<FormValues>({ resolver: zodResolver(schema) });

  const loadBase = async () => {
    const [sch, cls] = await Promise.all([schoolService.getAllSchools(), classroomService.getAllClassrooms()]);
    setSchools(sch);
    setClassrooms(cls);
    const cm: Record<string, string> = {};
    cls.forEach((c) => { cm[c.id] = c.name; });
    setClassroomMap(cm);
  };

  const loadStudents = async (classroomId?: string) => {
    if (classroomId) {
      setStudents(await studentService.getStudentsByClassroom(classroomId));
    } else {
      const cls = await classroomService.getAllClassrooms();
      const all = await Promise.all(cls.map((c) => studentService.getStudentsByClassroom(c.id)));
      setStudents(all.flat());
    }
  };

  useEffect(() => { loadBase(); loadStudents(); }, []);
  useEffect(() => { loadStudents(filterClassroom || undefined); }, [filterClassroom]);

  const filteredClassrooms = filterSchool ? classrooms.filter((c) => c.school_id === filterSchool) : classrooms;

  const displayedStudents = students.filter((s) => {
    if (filterClassroom) return s.classroom_id === filterClassroom;
    if (filterSchool) return filteredClassrooms.map((c) => c.id).includes(s.classroom_id);
    return true;
  });

  const onCreate = async (data: FormValues) => {
    setFormError(null);
    const student = await studentService.createStudent(data.name, data.classroomId);
    if (!student) { setFormError('Erro ao adicionar aluno.'); return; }
    createForm.reset();
    setShowCreateModal(false);
    loadStudents(filterClassroom || undefined);
  };

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    editForm.reset({ name: student.name, classroomId: student.classroom_id });
  };

  const onEdit = async (data: FormValues) => {
    if (!editingStudent) return;
    setFormError(null);
    const updated = await studentService.updateStudent(editingStudent.id, { name: data.name, classroom_id: data.classroomId });
    if (!updated) { setFormError('Erro ao atualizar aluno.'); return; }
    setEditingStudent(null);
    loadStudents(filterClassroom || undefined);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir o aluno "${name}"?`)) return;
    setDeletingId(id);
    await studentService.deleteStudent(id);
    setDeletingId(null);
    loadStudents(filterClassroom || undefined);
  };

  const StudentFormFields = ({ form }: { form: ReturnType<typeof useForm<FormValues>> }) => (
    <>
      <div className="space-y-1.5">
        <Label>Nome do Aluno</Label>
        <Input placeholder="Nome completo" {...form.register('name')} />
        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label>Turma</Label>
        <select {...form.register('classroomId')} className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700">
          <option value="">Selecione uma turma...</option>
          {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {form.formState.errors.classroomId && <p className="text-xs text-red-500">{form.formState.errors.classroomId.message}</p>}
      </div>
    </>
  );

  return (
    <AppLayout title="Alunos">
      <div className="space-y-6">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2 items-center">
            <select value={filterSchool} onChange={(e) => { setFilterSchool(e.target.value); setFilterClassroom(''); }} className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700">
              <option value="">Todas as escolas</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={filterClassroom} onChange={(e) => setFilterClassroom(e.target.value)} className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700">
              <option value="">Todas as turmas</option>
              {filteredClassrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <span className="text-sm text-gray-500">{displayedStudents.length} aluno(s)</span>
          </div>
          <Button onClick={() => setShowCreateModal(true)}><Plus className="h-4 w-4 mr-2" /> Novo Aluno</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {displayedStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <GraduationCap className="h-14 w-14 text-gray-200 mb-4" />
                <p className="font-medium text-gray-500">Nenhum aluno encontrado</p>
              </div>
            ) : (
              <div className="divide-y">
                {displayedStudents.map((student, i) => (
                  <div key={student.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500 flex-shrink-0">{i + 1}</span>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <BookOpen className="h-3 w-3 text-gray-400" />
                          <p className="text-xs text-gray-400">{classroomMap[student.classroom_id] ?? '—'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(student)} className="p-2 rounded-lg text-gray-400 hover:text-primary-800 hover:bg-primary-50 transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(student.id, student.name)} disabled={deletingId === student.id} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
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

      {showCreateModal && (
        <Modal title="Novo Aluno" onClose={() => { setShowCreateModal(false); createForm.reset(); setFormError(null); }}>
          <form onSubmit={createForm.handleSubmit(onCreate)} className="space-y-4">
            <StudentFormFields form={createForm} />
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); createForm.reset(); }}>Cancelar</Button>
              <Button type="submit" disabled={createForm.formState.isSubmitting}>{createForm.formState.isSubmitting ? 'Adicionando...' : 'Adicionar'}</Button>
            </div>
          </form>
        </Modal>
      )}

      {editingStudent && (
        <Modal title="Editar Aluno" onClose={() => { setEditingStudent(null); setFormError(null); }}>
          <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
            <StudentFormFields form={editForm} />
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => { setEditingStudent(null); }}>Cancelar</Button>
              <Button type="submit" disabled={editForm.formState.isSubmitting}>{editForm.formState.isSubmitting ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

export default function AdminStudentsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <StudentsAdminContent />
    </ProtectedRoute>
  );
}
