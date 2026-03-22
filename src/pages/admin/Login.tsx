import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { Zap, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user.email === 'swahilitecheliteacademy@gmail.com') {
          navigate('/admin/dashboard', { replace: true });
        }
      } catch (err) {
        console.error('[STEAimage] Admin session check error:', err);
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured || !supabase) {
      setError('Supabase is not configured. Add environment variables in Vercel settings.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      if (data.user?.email !== 'swahilitecheliteacademy@gmail.com') {
        await supabase.auth.signOut();
        throw new Error('Unauthorized access. Only admin is allowed.');
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('[STEAimage] Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/5 bg-zinc-900/50 p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-400 text-zinc-950 mb-6 shadow-xl shadow-amber-500/20">
            <Zap size={40} className="fill-zinc-950" />
          </div>
          <h2 className="text-3xl font-black text-white">Admin Login</h2>
          <p className="mt-2 text-zinc-400">STEAimage Management Portal</p>
          <div className="mt-4 inline-block rounded-full bg-red-500/10 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-500/20">
            Authorized Personnel Only
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-400">
            <AlertCircle size={18} />
            <p>Supabase not configured. Add env vars in Vercel to enable admin login.</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="email"
                required
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 pl-12 pr-4 py-3 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-8 py-4 font-bold text-zinc-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
