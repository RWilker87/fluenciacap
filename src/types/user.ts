export type Role = 'admin' | 'teacher';

export interface AppUser {
  id: string;
  email: string;
}

export interface Profile {
  id: string;
  name: string | null;
  role: Role;
  school_id: string | null;
  created_at: string;
}

export interface School {
  id: string;
  name: string;
  created_at: string;
}

export interface Classroom {
  id: string;
  name: string;
  school_id: string;
  teacher_id: string;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  classroom_id: string;
  created_at: string;
}
