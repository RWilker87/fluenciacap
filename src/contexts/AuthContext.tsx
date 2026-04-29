'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Profile, Role } from '@/types/user';
import { profileService } from '@/services/profileService';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  role: Role | null;
  /** true only during initial app bootstrap (first session check) */
  initializing: boolean;
  /** true when a background operation is running (profile refresh, etc.) */
  loading: boolean;
  /** error message if auth timed out or failed */
  error: string | null;
}

interface AuthContextValue extends AuthState {
  /** Force a profile refresh from the database */
  refreshProfile: () => Promise<void>;
  /** Sign out and clear state */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_TIMEOUT_MS = 10_000; // 10s safety timeout

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    role: null,
    initializing: true,
    loading: true,
    error: null,
  });

  // Refs to avoid stale closures and race conditions
  const mountedRef = useRef(true);
  const profileFetchIdRef = useRef(0); // Tracks latest profile fetch to discard stale results
  const initializedRef = useRef(false);

  // Fetch profile for a given user, with race-condition protection
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const fetchId = ++profileFetchIdRef.current;
    try {
      const profile = await profileService.getProfile(userId);
      // Only apply if this is still the latest fetch and component is mounted
      if (fetchId === profileFetchIdRef.current && mountedRef.current) {
        return profile;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      return null;
    }
  }, []);

  // Handle a session change (login, logout, token refresh)
  const handleSession = useCallback(async (session: Session | null) => {
    if (!mountedRef.current) return;

    const currentUser = session?.user ?? null;

    if (!currentUser) {
      setState(prev => ({
        ...prev,
        user: null,
        profile: null,
        role: null,
        initializing: false,
        loading: false,
        error: null,
      }));
      return;
    }

    // Set user immediately, mark loading
    setState(prev => ({
      ...prev,
      user: currentUser,
      loading: true,
      error: null,
    }));

    const profile = await fetchProfile(currentUser.id);

    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        user: currentUser,
        profile: profile,
        role: profile?.role ?? null,
        initializing: false,
        loading: false,
      }));
    }
  }, [fetchProfile]);

  // Refresh profile without changing user
  const refreshProfile = useCallback(async () => {
    setState(prev => {
      if (!prev.user) return prev;
      return { ...prev, loading: true };
    });

    const userId = state.user?.id;
    if (!userId) return;

    const profile = await fetchProfile(userId);
    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        profile,
        role: profile?.role ?? null,
        loading: false,
      }));
    }
  }, [state.user?.id, fetchProfile]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
    // State will be cleared by onAuthStateChange listener
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    initializedRef.current = false;

    // Safety timeout: if initializing takes too long, show error
    const timeoutId = setTimeout(() => {
      if (mountedRef.current && !initializedRef.current) {
        setState(prev => {
          if (!prev.initializing) return prev;
          return {
            ...prev,
            initializing: false,
            loading: false,
            error: 'O carregamento demorou mais do que o esperado. Tente recarregar a página.',
          };
        });
      }
    }, AUTH_TIMEOUT_MS);

    // Use onAuthStateChange as the SINGLE source of truth.
    // It fires INITIAL_SESSION immediately, so no need for a separate getSession call.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;

        // Mark as initialized on first event
        if (!initializedRef.current) {
          initializedRef.current = true;
        }

        // Ignore TOKEN_REFRESHED — user and profile haven't changed
        if (event === 'TOKEN_REFRESHED') {
          setState(prev => ({
            ...prev,
            initializing: false,
            loading: false,
          }));
          return;
        }

        await handleSession(session);
      }
    );

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [handleSession]);

  const value: AuthContextValue = {
    ...state,
    refreshProfile,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
}
