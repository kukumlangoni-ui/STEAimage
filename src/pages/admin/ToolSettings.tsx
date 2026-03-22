import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { 
  Settings, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminTools() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const { data: existingTools, error } = await supabase!
          .from('tool_settings')
          .select('*');
        
        if (error) throw error;
        
        // Define all tools if not in DB
        const allToolIds = [
          'image-to-url', 'image-to-pdf', 'compress', 'resize', 'crop', 
          'rotate', 'flip', 'convert-to-jpg', 'convert-from-jpg', 
          'social-media', 'thumbnail', 'watermark', 'remove-metadata', 'merge'
        ];

        const finalTools = allToolIds.map(id => {
          const existing = existingTools?.find((t: any) => t.id === id);
          return existing || { id, tool_name: id.replace(/-/g, ' ').toUpperCase(), is_active: true, is_featured: false };
        });

        setTools(finalTools);
      } catch (err) {
        console.error('Error fetching tools:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const handleToggle = async (id: string, field: 'is_active' | 'is_featured') => {
    setSaving(id);
    const tool = tools.find(t => t.id === id);
    const updatedTool = { ...tool, [field]: !tool[field], updated_at: new Date() };
    
    try {
      const { error } = await supabase!
        .from('tool_settings')
        .upsert(updatedTool);
      
      if (error) throw error;
      
      setTools(tools.map(t => t.id === id ? updatedTool : t));
    } catch (err) {
      console.error('Error updating tool setting:', err);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-amber-400" size={48} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/admin/dashboard" className="flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition mb-4">
            <ChevronLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-white">Tool Settings</h1>
          <p className="mt-2 text-zinc-400">Enable, disable, or feature platform tools.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <div key={tool.id} className="rounded-3xl border border-white/5 bg-zinc-900/50 p-6 backdrop-blur-xl transition hover:bg-zinc-800/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
                <Settings size={24} />
              </div>
              {saving === tool.id && <Loader2 className="animate-spin text-amber-400" size={20} />}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{tool.tool_name}</h3>
            <p className="text-xs text-zinc-500 mb-6 uppercase tracking-wider">ID: {tool.id}</p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggle(tool.id, 'is_active')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-bold transition ${
                  tool.is_active 
                    ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' 
                    : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                }`}
              >
                {tool.is_active ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                {tool.is_active ? 'Active' : 'Disabled'}
              </button>

              <button
                onClick={() => handleToggle(tool.id, 'is_featured')}
                className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${
                  tool.is_featured 
                    ? 'bg-amber-500 text-zinc-950' 
                    : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                }`}
                title="Feature Tool"
              >
                <Star size={20} className={tool.is_featured ? 'fill-zinc-950' : ''} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
