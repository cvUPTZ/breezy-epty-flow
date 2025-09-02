
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  switchUser: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      // Enhanced security: Use edge function for secure profile access
      const { data: functionData, error: functionError } = await supabase.functions.invoke('secure-get-user-profile', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (!functionError && functionData?.profile?.role) {
        setUserRole(functionData.profile.role);
        return;
      }

      // Fallback to direct database query if edge function fails
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        // Log security event for failed profile access
        try {
          await supabase.from('security_audit_log').insert({
            user_id: userId,
            action: 'profile_access_failed',
            resource_type: 'user_profile',
            resource_id: userId,
            details: { error: error.message, timestamp: new Date().toISOString() }
          });
        } catch (logError) {
          console.error('Failed to log security event:', logError);
        }
        
        setUserRole('user'); // Default to 'user' role if profile doesn't exist
      } else {
        setUserRole(data?.role || 'user');
      }
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      setUserRole('user');
    }
  }, [session]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Log failed sign-in attempt
        try {
          await supabase.from('security_audit_log').insert({
            user_id: null,
            action: 'sign_in_failed',
            resource_type: 'auth_session',
            resource_id: email,
            details: { 
              error: error.message, 
              timestamp: new Date().toISOString(),
              ip_address: 'client_side'
            }
          });
        } catch (logError) {
          console.error('Failed to log security event:', logError);
        }
        
        toast.error(error.message);
        throw error;
      }

      // Log successful sign-in
      if (data.user) {
        try {
          await supabase.from('security_audit_log').insert({
            user_id: data.user.id,
            action: 'sign_in_success',
            resource_type: 'auth_session',
            resource_id: data.user.id,
            details: { 
              timestamp: new Date().toISOString(),
              email: email
            }
          });
        } catch (logError) {
          console.error('Failed to log security event:', logError);
        }
      }

      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      if (data.user && !data.session) {
        toast.success('Please check your email to confirm your account');
      } else {
        toast.success('Account created successfully');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  }, []);

  const switchUser = useCallback(async (email: string, password: string) => {
    await signOut();
    await signIn(email, password);
  }, [signIn, signOut]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    userRole,
    signOut,
    signIn,
    signUp,
    switchUser,
  }), [user, session, loading, userRole, signOut, signIn, signUp, switchUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
