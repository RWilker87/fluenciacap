import { supabase } from '@/lib/supabase';
import { School } from '@/types/user';

export const schoolService = {
  async getSchools(): Promise<School[]> {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name');
    if (error) { console.error(error.message); return []; }
    return data as School[];
  },

  async getSchool(id: string): Promise<School | null> {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) return null;
    return data as School;
  },

  async createSchool(name: string): Promise<School | null> {
    const { data, error } = await supabase
      .from('schools')
      .insert({ name })
      .select()
      .single();
    if (error) { console.error(error.message); return null; }
    return data as School;
  },

  async updateSchool(id: string, name: string): Promise<School | null> {
    const { data, error } = await supabase
      .from('schools')
      .update({ name })
      .eq('id', id)
      .select()
      .single();
    if (error) { console.error(error.message); return null; }
    return data as School;
  },

  async deleteSchool(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', id);
    if (error) { console.error(error.message); return false; }
    return true;
  },

  async getAllSchools(): Promise<School[]> {
    return this.getSchools();
  },
};
