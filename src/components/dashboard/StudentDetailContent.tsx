'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { studentService } from '@/services/studentService';
import { classroomService } from '@/services/classroomService';
import { evaluationService } from '@/services/evaluationService';
import { profileService } from '@/services/profileService';
import { Student, Classroom, Profile } from '@/types/user';
import { Evaluation } from '@/types/evaluation';
import { useAuthContext } from '@/contexts/AuthContext';
import { ChevronLeft, Plus, X, Activity, BookOpen, Clock, AlertCircle } from 'lucide-react';

const evaluationSchema = z.object({
  words_read: z.number().min(1, 'Deve ser maior que 0'),
  errors: z.number().min(0, 'Não pode ser negativo'),
  observations: z.string().optional(),
}).refine(data => data.errors <= data.words_read, {
  message: 'Os erros não podem ser maiores que o total de palavras lidas',
  path: ['errors'],
});

type EvaluationFormValues = z.infer<typeof evaluationSchema>;

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-5 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

interface StudentDetailContentProps {
  studentId: string;
  backHref: string;
  backLabel: string;
}

export function StudentDetailContent({ studentId, backHref, backLabel }: StudentDetailContentProps) {
  const { user, role } = useAuthContext();
  const [student, setStudent] = useState<Student | null>(null);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [evaluators, setEvaluators] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EvaluationFormValues>({ 
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      words_read: 0,
      errors: 0,
      observations: ''
    }
  });

  const watchWords = form.watch('words_read') || 0;
  const watchErrors = form.watch('errors') || 0;
  
  const calculatedPPM = Math.max(0, watchWords - watchErrors);
  const calculatedAccuracy = watchWords > 0 ? ((calculatedPPM / watchWords) * 100).toFixed(1) : '0.0';

  const loadData = async () => {
    try {
      const st = await studentService.getStudent(studentId);
      if (!st) return;
      setStudent(st);

      const [cls, evals] = await Promise.all([
        classroomService.getClassroom(st.classroom_id),
        evaluationService.getEvaluationsByStudent(studentId)
      ]);
      setClassroom(cls);
      setEvaluations(evals);

      // Carregar nomes dos avaliadores
      const evaluatorIds = Array.from(new Set(evals.map(e => e.evaluator_id)));
      const evaluatorsMap: Record<string, string> = {};
      await Promise.all(evaluatorIds.map(async (id) => {
        const prof = await profileService.getProfile(id);
        if (prof) evaluatorsMap[id] = prof.name || 'Desconhecido';
      }));
      setEvaluators(evaluatorsMap);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentId]);

  const onSubmit = async (data: EvaluationFormValues) => {
    if (!user || !student) return;
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const ppm = data.words_read - data.errors;
      const accuracy = (ppm / data.words_read) * 100;

      await evaluationService.createEvaluation({
        student_id: student.id,
        evaluator_id: user.id,
        words_read: data.words_read,
        errors: data.errors,
        words_per_minute: ppm,
        accuracy: accuracy,
        observations: data.observations,
      });
      
      setShowModal(false);
      form.reset();
      await loadData();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao salvar avaliação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta avaliação? Essa ação não pode ser desfeita.')) return;
    try {
      await evaluationService.deleteEvaluation(id);
      await loadData();
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  // Verifica se o usuário atual é o professor responsável pela turma
  const isResponsibleTeacher = role === 'professor' && classroom?.teacher_id === user?.id;

  if (loading) {
    return (
      <AppLayout title="Detalhes do Aluno">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-800 border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (!student) {
    return (
      <AppLayout title="Detalhes do Aluno">
        <div className="text-center py-12 text-gray-500">Aluno não encontrado.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={student.name}>
      <div className="space-y-6">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        {/* Header do Aluno */}
        <div className="rounded-xl bg-white border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> Turma: {classroom?.name ?? '...'}</span>
              <span className="text-gray-300">|</span>
              <span>Cadastrado em: {new Date(student.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          {isResponsibleTeacher && (
            <Button onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Nova Avaliação
            </Button>
          )}
        </div>

        {/* Avaliações */}
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mt-8">
          <Activity className="h-5 w-5 text-primary-700" /> 
          Histórico de Avaliações
        </h3>

        {evaluations.length === 0 ? (
          <Card className="border-dashed shadow-none bg-gray-50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="h-12 w-12 text-gray-300 mb-3" />
              <p className="font-medium text-gray-500">Nenhuma avaliação registrada</p>
              {isResponsibleTeacher && (
                <p className="text-sm text-gray-400 mt-1">Clique em "Nova Avaliação" para começar.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {evaluations.map((ev) => (
              <Card key={ev.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="bg-gray-50 px-5 py-3 border-b flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">
                    {new Date(ev.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  {isResponsibleTeacher && (
                    <button 
                      onClick={() => handleDelete(ev.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Excluir
                    </button>
                  )}
                </div>
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-primary-50 rounded-lg p-3 border border-primary-100">
                      <p className="text-xs text-primary-800 font-medium uppercase tracking-wider mb-1">PPM (Palavras/min)</p>
                      <p className="text-2xl font-bold text-primary-900">{ev.words_per_minute}</p>
                    </div>
                    <div className="bg-gold-50 rounded-lg p-3 border border-gold-100">
                      <p className="text-xs text-gold-800 font-medium uppercase tracking-wider mb-1">Precisão</p>
                      <p className="text-2xl font-bold text-gold-900">{Number(ev.accuracy).toFixed(1)}%</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600 mb-3 px-1 border-b pb-3">
                    <span><strong>Lidas:</strong> {ev.words_read}</span>
                    <span><strong>Erros:</strong> <span className="text-red-600">{ev.errors}</span></span>
                  </div>
                  
                  {ev.observations && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md mb-3 border border-gray-100">
                      <strong>Observações:</strong><br/>
                      {ev.observations}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 text-right mt-2">
                    Avaliador: {evaluators[ev.evaluator_id] || 'Carregando...'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </div>

      {showModal && (
        <Modal title="Nova Avaliação de Fluência" onClose={() => setShowModal(false)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4 border border-blue-100 flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>O aluno deve ler o texto em voz alta por exatamente 1 minuto. Contabilize o total de palavras lidas e subtraia as lidas incorretamente (erros).</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Total Palavras Lidas</Label>
                <Input 
                  type="number" 
                  min="1"
                  {...form.register('words_read', { valueAsNumber: true })} 
                />
                {form.formState.errors.words_read && <p className="text-xs text-red-500">{form.formState.errors.words_read.message}</p>}
              </div>
              
              <div className="space-y-1.5">
                <Label>Qtd. de Erros</Label>
                <Input 
                  type="number" 
                  min="0"
                  {...form.register('errors', { valueAsNumber: true })} 
                />
                {form.formState.errors.errors && <p className="text-xs text-red-500">{form.formState.errors.errors.message}</p>}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 flex justify-around text-center">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">PPM Calculado</p>
                <p className="text-xl font-bold text-gray-900">{calculatedPPM}</p>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Precisão</p>
                <p className="text-xl font-bold text-gray-900">{calculatedAccuracy}%</p>
              </div>
            </div>

            <div className="space-y-1.5 mt-4">
              <Label>Observações Opcionais</Label>
              <textarea 
                className="w-full rounded-md border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700 min-h-[80px]"
                placeholder="Ex: Teve dificuldade com palavras polissílabas..."
                {...form.register('observations')}
              />
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}
            
            <div className="flex gap-3 justify-end pt-2 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Salvando...' : 'Salvar Avaliação'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}
