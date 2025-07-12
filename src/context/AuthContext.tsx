
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching user role for:', userId);
      const { data, error } = await supabase.rpc('get_user_role_from_auth', { user_id_param: userId });
      if (error) {
        console.error('Error fetching user role:', error);
        return 'user'; // Default fallback role
      }
      console.log('User role fetched:', data);
      return data || 'user';
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return 'user'; // Default fallback role
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('User found, fetching role...');
            const role = await fetchUserRole(session.user.id);
            if (isMounted) {
              setUserRole(role);
            }
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Set a maximum timeout for initial loading
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth loading timeout reached');
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (isMounted) {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            const role = await fetchUserRole(session.user.id);
            if (isMounted) {
              setUserRole(role);
            }
          } else {
            setUserRole(null);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
