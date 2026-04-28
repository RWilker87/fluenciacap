import { supabase } from '@/lib/supabase';
import { Classroom } from '@/types/user';

export const classroomService = {
  async getClassroomsByTeacher(teacherId: string): Promise<Classroom[]> {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('name');
    if (error) { console.error(error.message); return []; }
    return data as Classroom[];
  },

  async getClassroomsBySchool(schoolId: string): Promise<Classroom[]> {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('school_id', schoolId)
      .order('name');
    if (error) { console.error(error.message); return []; }
    return data as Classroom[];
  },

  async getClassroom(id: string): Promise<Classroom | null> {
    const { data, error } = await supabase
      .from('classrooms')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) return null;
    return data as Classroom;
  },

  async createClassroom(
    name: string,
    schoolId: string,
    teacherId: string
  ): Promise<Classroom | null> {
    const { data, error } = await supabase
      .from('classrooms')
      .insert({ name, school_id: schoolId, teacher_id: teacherId })
      .select()
      .single();
    if (error) { console.error(error.message); return null; }
    return data as Classroom;
  },

  async deleteClassroom(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('classrooms')
      .delete()
      .eq('id', id);
    if (error) { console.error(error.message); return false; }
    return true;
  },
};
