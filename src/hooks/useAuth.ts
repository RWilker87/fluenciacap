'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Profile, Role } from '@/types/user';
import { profileService } from '@/services/profileService';

interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  loading: boolean;
}

export function useAuth(requireAuth = false, requiredRole?: Role): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;

      if (mounted) {
        setUser(currentUser);
        if (currentUser) {
          const p = await profileService.getProfile(currentUser.id);
          if (mounted) setProfile(p);
        }
        setLoading(false);
      }
    };

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      if (mounted) {
        setUser(currentUser);
        if (currentUser) {
          const p = await profileService.getProfile(currentUser.id);
          if (mounted) setProfile(p);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      router.push('/login');
      return;
    }

    if (requiredRole && profile && profile.role !== requiredRole) {
      if (profile.role === 'admin') router.push('/dashboard/admin');
      else if (profile.role === 'gestor') router.push('/dashboard/gestor');
      else if (profile.role === 'coordenador') router.push('/dashboard/coordenador');
      else router.push('/dashboard/teacher');
    }
  }, [user, profile, loading, requireAuth, requiredRole, router]);

  return { user, profile, role: profile?.role ?? null, loading };
}
