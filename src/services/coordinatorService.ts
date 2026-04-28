import { supabase } from '@/lib/supabase';
import { Classroom, CoordinatorClassroom } from '@/types/user';

export const coordinatorService = {
  async getLinkedClassrooms(coordinatorId: string): Promise<Classroom[]> {
    // Busca a tabela pivô e faz join com as turmas
    const { data, error } = await supabase
      .from('coordinator_classrooms')
      .select('classrooms(*)')
      .eq('coordinator_id', coordinatorId);

    if (error) {
      console.error('Erro ao buscar turmas do coordenador:', error.message);
      return [];
    }

    // data é array de objetos { classrooms: Classroom }
    return data.map((item: any) => item.classrooms as Classroom);
  },

  async getLinkedClassroomIds(coordinatorId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('coordinator_classrooms')
      .select('classroom_id')
      .eq('coordinator_id', coordinatorId);
      
    if (error) return [];
    return data.map((item) => item.classroom_id);
  }
};
