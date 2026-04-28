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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { schoolService } from '@/services/schoolService';
import { School } from '@/types/user';
import { School as SchoolIcon, Plus, Trash2, X } from 'lucide-react';

const schema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
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

function SchoolsContent() {
  const [schools, setSchools] = useState<School[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const load = async () => setSchools(await schoolService.getAllSchools());

  useEffect(() => { load(); }, []);

  const onSubmit = async (data: FormValues) => {
    setFormError(null);
    const school = await schoolService.createSchool(data.name);
    if (!school) { setFormError('Erro ao criar escola.'); return; }
    reset();
    setShowModal(false);
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta escola? Todas as turmas e alunos serão removidos.')) return;
    setDeletingId(id);
    await schoolService.deleteSchool(id);
    setDeletingId(null);
    await load();
  };

  return (
    <AppLayout title="Escolas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{schools.length} escola(s) cadastrada(s)</p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nova Escola
          </Button>
        </div>

        {/* Lista */}
        <Card>
          <CardContent className="p-0">
            {schools.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <SchoolIcon className="h-14 w-14 text-gray-200 mb-4" />
                <p className="font-medium text-gray-500">Nenhuma escola cadastrada</p>
                <p className="text-sm text-gray-400 mt-1">Clique em "Nova Escola" para começar</p>
              </div>
            ) : (
              <div className="divide-y">
                {schools.map((school) => (
                  <div key={school.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                        <SchoolIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{school.name}</p>
                        <p className="text-xs text-gray-400">
                          Criada em {new Date(school.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(school.id)}
                      disabled={deletingId === school.id}
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
        <Modal title="Nova Escola" onClose={() => { setShowModal(false); reset(); }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="school-name">Nome da Escola</Label>
              <Input id="school-name" placeholder="Ex: EMEF João Pessoa" {...register('name')} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => { setShowModal(false); reset(); }}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Cadastrar'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

export default function SchoolsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <SchoolsContent />
    </ProtectedRoute>
  );
}
