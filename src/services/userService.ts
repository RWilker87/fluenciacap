import { Profile } from '@/types/user';

export interface CreateTeacherPayload {
  email: string;
  password: string;
  name: string;
  schoolId: string;
}

export const userService = {
  async createTeacher(payload: CreateTeacherPayload): Promise<Profile> {
    const response = await fetch('/api/admin/create-teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao criar professor.');
    return result.profile as Profile;
  },

  async getTeachersBySchool(schoolId: string): Promise<Profile[]> {
    const response = await fetch(`/api/admin/teachers?schoolId=${schoolId}`);
    const result = await response.json();
    if (!response.ok) return [];
    return result.teachers as Profile[];
  },

  async getAllTeachers(): Promise<Profile[]> {
    const response = await fetch('/api/admin/teachers');
    const result = await response.json();
    if (!response.ok) return [];
    return result.teachers as Profile[];
  },
};
