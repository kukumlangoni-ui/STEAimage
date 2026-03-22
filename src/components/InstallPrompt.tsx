import React, { useState } from 'react';
import { Download, X, Smartphone, Share, Chrome } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

// ── Inline iOS instructions modal ──────────────────────────────────────────
function IOSInstructions({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center p-4 sm:items-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400">
              <span className="text-lg font-black text-zinc-950">⚡</span>
            </div>
            <div>
              <p className="font-black text-white">Add to Home Screen</p>
              <p className="text-xs text-zinc-400">STEAimage</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {[
            { step: 1, icon: '□↑', text: 'Tap the Share button at the bottom of Safari' },
            { step: 2, icon: '⊞', text: 'Scroll down and tap "Add to Home Screen"' },
            { step: 3, icon: '✓', text: 'Tap "Add" — STEAimage appears on your home screen!' },
          ].map(({ step, icon, text }) => (
            <div key={step} className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-black text-sm">
                {step}
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-amber-500 py-3 font-bold text-zinc-950 hover:bg-amber-400 transition"
        >
          Got it!
        </button>
      </div>
    </div>
  );
}

// ── Update banner ───────────────────────────────────────────────────────────
export function UpdateBanner() {
  const { updateAvailable, applyUpdate } = usePWA();
  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[9998] w-full max-w-sm -translate-x-1/2 px-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-zinc-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <p className="text-sm font-bold text-white">New version available</p>
        <button
          onClick={applyUpdate}
          className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-zinc-950 hover:bg-amber-400 transition"
        >
          Update Now
        </button>
      </div>
    </div>
  );
}

// ── Install button (used in Navbar & wherever needed) ──────────────────────
interface InstallButtonProps {
  variant?: 'pill' | 'full' | 'icon';
  className?: string;
}

export function InstallButton({ variant = 'pill', className = '' }: InstallButtonProps) {
  const { installState, canInstall, triggerInstall } = usePWA();
  const [showIOS, setShowIOS] = useState(false);

  if (installState === 'installed') return null;
  if (!canInstall) return null;

  const handleClick = () => {
    if (installState === 'ios') {
      setShowIOS(true);
    } else {
      triggerInstall();
    }
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleClick}
          title="Install STEAimage App"
          className={`flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition ${className}`}
        >
          <Download size={16} />
        </button>
        {showIOS && <IOSInstructions onClose={() => setShowIOS(false)} />}
      </>
    );
  }

  if (variant === 'full') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-4 font-bold text-zinc-950 shadow-lg hover:bg-amber-400 transition ${className}`}
        >
          <Download size={18} />
          {installState === 'ios' ? 'Add to Home Screen' : 'Install App'}
        </button>
        {showIOS && <IOSInstructions onClose={() => setShowIOS(false)} />}
      </>
    );
  }

  // Default: pill
  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition ${className}`}
      >
        <Download size={12} />
        {installState === 'ios' ? 'Add to Home Screen' : 'Install'}
      </button>
      {showIOS && <IOSInstructions onClose={() => setShowIOS(false)} />}
    </>
  );
}

// ── Banner-style install prompt (shown on homepage) ─────────────────────────
export function InstallBanner() {
  const { installState, canInstall, triggerInstall, dismissPrompt } = usePWA();
  const [showIOS, setShowIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || installState === 'installed' || !canInstall) return null;

  const handleInstall = () => {
    if (installState === 'ios') setShowIOS(true);
    else triggerInstall();
  };

  const handleDismiss = () => {
    setDismissed(true);
    dismissPrompt();
  };

  return (
    <>
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 shadow-lg shadow-amber-500/20">
              <span className="text-base font-black text-zinc-950">⚡</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white leading-none">Install STEAimage</p>
              <p className="mt-0.5 text-xs text-zinc-400 truncate">Works offline · Faster · No browser bar</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={handleInstall}
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-black text-zinc-950 hover:bg-amber-400 transition"
            >
              {installState === 'ios' ? 'How to Install' : 'Install'}
            </button>
            <button
              onClick={handleDismiss}
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
      {showIOS && <IOSInstructions onClose={() => setShowIOS(false)} />}
    </>
  );
}

export default InstallButton;
