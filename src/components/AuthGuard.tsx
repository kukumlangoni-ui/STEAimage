import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      navigate('/admin/login', { replace: true });
      setLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          navigate('/admin/login', { replace: true });
          return;
        }

        if (session.user.email !== 'swahilitecheliteacademy@gmail.com') {
          await supabase.auth.signOut();
          navigate('/admin/login', { replace: true });
          return;
        }

        setAuthenticated(true);
      } catch (error) {
        console.error('[STEAimage] Auth check error:', error);
        navigate('/admin/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setAuthenticated(false);
        navigate('/admin/login', { replace: true });
      } else if (session.user.email === 'swahilitecheliteacademy@gmail.com') {
        setAuthenticated(true);
      } else {
        supabase.auth.signOut();
        navigate('/admin/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    );
  }

  return authenticated ? <>{children}</> : null;
}
