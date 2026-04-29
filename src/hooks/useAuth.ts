'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import { Profile, Role } from '@/types/user';
import { User } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

/**
 * Thin wrapper over AuthContext for backward compatibility.
 * All auth logic lives in AuthProvider — this hook just exposes it.
 */
export function useAuth(): UseAuthReturn {
  const ctx = useAuthContext();

  return {
    user: ctx.user,
    profile: ctx.profile,
    role: ctx.role,
    loading: ctx.loading || ctx.initializing,
    initializing: ctx.initializing,
    error: ctx.error,
    refreshProfile: ctx.refreshProfile,
    signOut: ctx.signOut,
  };
}
