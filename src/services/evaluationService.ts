import { supabase } from '@/lib/supabase';
import { Evaluation, CreateEvaluationPayload } from '@/types/evaluation';

export const evaluationService = {
  async getEvaluationsByStudent(studentId: string): Promise<Evaluation[]> {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar avaliações:', error.message);
      return [];
    }
    return data as Evaluation[];
  },

  async createEvaluation(payload: CreateEvaluationPayload): Promise<Evaluation | null> {
    const { data, error } = await supabase
      .from('evaluations')
      .insert({
        student_id: payload.student_id,
        evaluator_id: payload.evaluator_id,
        words_read: payload.words_read,
        errors: payload.errors,
        words_per_minute: payload.words_per_minute,
        accuracy: payload.accuracy,
        observations: payload.observations || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar avaliação:', error.message);
      throw new Error(error.message);
    }
    return data as Evaluation;
  },

  async deleteEvaluation(id: string): Promise<void> {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir avaliação:', error.message);
      throw new Error(error.message);
    }
  }
};
