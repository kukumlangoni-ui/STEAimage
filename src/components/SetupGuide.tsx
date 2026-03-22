import React from 'react';
import { Settings, ExternalLink, ShieldAlert, Zap } from 'lucide-react';

export default function SetupGuide() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-12">
      <div className="w-full max-w-2xl space-y-8 rounded-3xl border border-white/5 bg-zinc-900/50 p-8 md:p-12 backdrop-blur-xl shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-400 text-zinc-950 mb-8 shadow-xl shadow-amber-500/20">
            <Zap size={40} className="fill-zinc-950" />
          </div>
          <h1 className="text-4xl font-black text-white md:text-5xl">Setup Required</h1>
          <p className="mt-4 text-lg text-zinc-400">
            To use STEAimage, you need to connect your Supabase project.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-6">
            <div className="flex items-center gap-3 text-amber-400 mb-4">
              <ShieldAlert size={24} />
              <h2 className="text-xl font-bold">Missing Environment Variables</h2>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              The following variables are missing from your environment:
            </p>
            <ul className="mt-4 space-y-2 font-mono text-sm">
              <li className="flex items-center gap-2 text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                VITE_SUPABASE_URL
              </li>
              <li className="flex items-center gap-2 text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                VITE_SUPABASE_ANON_KEY
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings size={20} className="text-zinc-400" />
              How to fix this:
            </h3>
            <ol className="space-y-4 text-zinc-400 list-decimal list-inside">
              <li>
                Open your Supabase Dashboard and go to <span className="text-white font-medium">Project Settings &gt; API</span>.
              </li>
              <li>
                Copy the <span className="text-white font-medium">Project URL</span> and <span className="text-white font-medium">anon public key</span>.
              </li>
              <li>
                In this editor, open the <span className="text-amber-400 font-bold">Settings</span> menu (gear icon).
              </li>
              <li>
                Add the variables with the names listed above.
              </li>
              <li>
                The app will automatically refresh once the variables are set.
              </li>
            </ol>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-white/5 px-6 py-4 font-bold text-white hover:bg-white/10 transition-all border border-white/10"
          >
            Open Supabase Dashboard
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}
