import { supabase } from '@/lib/supabase';
import { Student } from '@/types/user';

export const studentService = {
  async getStudentsByClassroom(classroomId: string): Promise<Student[]> {
    const { data, error } = await supabase.from('students').select('*').eq('classroom_id', classroomId).order('name');
    if (error) { console.error(error.message); return []; }
    return data as Student[];
  },

  async createStudent(name: string, classroomId: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .insert({ name, classroom_id: classroomId })
      .select()
      .single();
    if (error) { console.error(error.message); return null; }
    return data as Student;
  },

  async updateStudent(id: string, updates: { name?: string; classroom_id?: string }): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error(error.message); return null; }
    return data as Student;
  },

  async deleteStudent(id: string): Promise<boolean> {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) { console.error(error.message); return false; }
    return true;
  },
};
