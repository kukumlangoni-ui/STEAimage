import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { LayoutDashboard, MessageSquare, LogOut, Loader2, Zap, ArrowRight } from 'lucide-react';

export default function AdminDashboard() {
  const [feedbackCount, setFeedbackCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count, error } = await supabase
          .from('feedback')
          .select('*', { count: 'exact', head: true });

        if (error) throw error;
        setFeedbackCount(count);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Sidebar / Topbar */}
      <nav className="border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20">
            <Zap size={20} className="fill-zinc-950" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">STEAimage <span className="text-amber-400">Admin</span></span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full bg-red-500/10 px-4 py-2 text-sm font-bold text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </nav>

      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white md:text-5xl">Welcome, Admin</h1>
          <p className="mt-4 text-lg font-medium text-zinc-400">
            Manage feedback and monitor system performance.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Feedback Card */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md transition-all hover:border-amber-500/30 hover:bg-zinc-900/60">
            <div className="flex items-start justify-between mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all duration-300">
                <MessageSquare size={28} />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">Total Feedback</p>
                <h3 className="text-4xl font-black text-white mt-1">
                  {loading ? <Loader2 className="animate-spin inline-block h-8 w-8" /> : feedbackCount ?? 0}
                </h3>
              </div>
            </div>
            <Link
              to="/admin/feedback"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-white hover:bg-amber-500 hover:text-zinc-950 transition-all"
            >
              View All Feedback
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Placeholder for other stats */}
          <div className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md transition-all hover:border-amber-500/30 hover:bg-zinc-900/60 opacity-50">
            <div className="flex items-start justify-between mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-500">
                <LayoutDashboard size={28} />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">System Status</p>
                <h3 className="text-4xl font-black text-white mt-1">Active</h3>
              </div>
            </div>
            <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-zinc-500 cursor-not-allowed">
              Coming Soon
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
