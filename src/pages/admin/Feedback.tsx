import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { MessageSquare, LogOut, Loader2, Zap, ArrowLeft, Trash2, Calendar, User, Mail } from 'lucide-react';

interface FeedbackItem {
  id: string;
  name: string | null;
  email: string | null;
  message: string;
  created_at: string;
}

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('feedback')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setFeedback(data || []);
      } catch (err: any) {
        console.error('Error fetching feedback:', err);
        setError(err.message || 'Failed to load feedback.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const deleteFeedback = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      setFeedback((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      console.error('Error deleting feedback:', err);
      alert('Failed to delete feedback: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Sidebar / Topbar */}
      <nav className="border-b border-white/5 bg-zinc-900/50 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link to="/admin/dashboard" className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-zinc-950 shadow-lg shadow-amber-500/20">
            <Zap size={20} className="fill-zinc-950" />
          </Link>
          <span className="text-xl font-black tracking-tighter uppercase">STEAimage <span className="text-amber-400">Feedback</span></span>
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
        <div className="mb-12 flex items-center justify-between">
          <div>
            <Link to="/admin/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-all mb-4">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-white md:text-5xl">User Feedback</h1>
            <p className="mt-4 text-lg font-medium text-zinc-400">
              Read and manage feedback from your users.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-sm font-bold text-amber-400 border border-amber-500/20">
              <MessageSquare size={16} />
              {feedback.length} Submissions
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-12 text-center text-red-400">
            <p className="text-xl font-bold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-full bg-red-500 px-8 py-3 font-bold text-white hover:bg-red-600 transition-all"
            >
              Retry
            </button>
          </div>
        ) : feedback.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-20 text-center text-zinc-500 backdrop-blur-md">
            <MessageSquare size={64} className="mx-auto mb-6 opacity-20" />
            <p className="text-xl font-bold">No feedback submissions yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {feedback.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-3xl border border-white/5 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-md transition-all hover:border-amber-500/30 hover:bg-zinc-900/60"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold uppercase tracking-widest text-zinc-500">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-amber-500" />
                        {item.name || 'Anonymous'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-amber-500" />
                        {item.email || 'No Email Provided'}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-amber-500" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-lg leading-relaxed text-zinc-200 bg-zinc-950/50 rounded-2xl p-6 border border-white/5">
                      {item.message}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteFeedback(item.id)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all self-end md:self-start"
                    title="Delete Feedback"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
