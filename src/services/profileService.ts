import { supabase } from '@/lib/supabase';
import { Profile, Role } from '@/types/user';

export const profileService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar perfil:', error.message);
      return null;
    }
    return data as Profile;
  },

  async createProfile(
    userId: string,
    name: string,
    role: Role = 'teacher',
    schoolId?: string
  ): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        name,
        role,
        school_id: schoolId ?? null,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar perfil:', error.message);
      return null;
    }
    return data as Profile;
  },

  async getUserRole(): Promise<Role | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const profile = await profileService.getProfile(user.id);
    return profile?.role ?? null;
  },
};
