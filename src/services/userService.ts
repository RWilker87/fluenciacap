import { Profile, Role } from '@/types/user';

export interface CreateUserPayload {
  email: string;
  password?: string;
  name: string;
  cpf?: string;
  role: Role;
  schoolId?: string;
  classroomIds?: string[];
}

export interface UpdateUserPayload {
  name?: string;
  cpf?: string;
  schoolId?: string;
  email?: string;
  role?: Role;
  classroomIds?: string[];
}

export const userService = {
  async createUser(payload: CreateUserPayload): Promise<Profile> {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao criar usuário.');
    return result.profile as Profile;
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<Profile> {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao atualizar usuário.');
    return result.profile as Profile;
  },

  async deleteUser(id: string): Promise<void> {
    const response = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Erro ao excluir usuário.');
  },

  async getUsersByRole(role: Role): Promise<Profile[]> {
    const response = await fetch(`/api/admin/users?role=${role}`);
    const result = await response.json();
    if (!response.ok) return [];
    return result.users as Profile[];
  },

  async getUsersBySchool(schoolId: string): Promise<Profile[]> {
    const response = await fetch(`/api/admin/users?schoolId=${schoolId}`);
    const result = await response.json();
    if (!response.ok) return [];
    return result.users as Profile[];
  },

  async getAllUsers(): Promise<Profile[]> {
    const response = await fetch('/api/admin/users');
    const result = await response.json();
    if (!response.ok) return [];
    return result.users as Profile[];
  },
};
