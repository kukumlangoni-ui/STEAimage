import { useState, useEffect, useRef } from 'react';

export type InstallState =
  | 'unsupported'   // browser doesn't support PWA install
  | 'ios'           // iOS Safari — needs manual share flow
  | 'ready'         // beforeinstallprompt fired — can show native prompt
  | 'installing'    // user tapped install, waiting for result
  | 'installed'     // already installed as PWA
  | 'dismissed';    // user dismissed previously (this session)

interface PWAHook {
  installState:  InstallState;
  canInstall:    boolean;
  isStandalone:  boolean;
  triggerInstall: () => Promise<void>;
  dismissPrompt: () => void;
  updateAvailable: boolean;
  applyUpdate:   () => void;
}

export function usePWA(): PWAHook {
  const [installState, setInstallState] = useState<InstallState>('unsupported');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const deferredPrompt = useRef<any>(null);
  const swReg = useRef<ServiceWorkerRegistration | null>(null);

  // ── Detect running in standalone mode ──────────────────────────────────
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;

  useEffect(() => {
    // Already installed as PWA
    if (isStandalone) {
      setInstallState('installed');
      return;
    }

    // iOS Safari — no beforeinstallprompt, needs manual flow
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent);
    if (isIOS && isSafari) {
      setInstallState('ios');
      return;
    }

    // Listen for the browser's install prompt
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setInstallState('ready');
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    // Listen for successful install
    const onAppInstalled = () => {
      deferredPrompt.current = null;
      setInstallState('installed');
    };
    window.addEventListener('appinstalled', onAppInstalled);

    // ── Register service worker ────────────────────────────────────────
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          swReg.current = reg;

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (!newWorker) return;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                setUpdateAvailable(true);
              }
            });
          });
        })
        .catch((err) => console.warn('[SW] Registration failed:', err));

      // Listen for controller change (after SKIP_WAITING)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []); // eslint-disable-line

  const triggerInstall = async () => {
    if (!deferredPrompt.current) return;
    setInstallState('installing');
    try {
      await deferredPrompt.current.prompt();
      const result = await deferredPrompt.current.userChoice;
      if (result.outcome === 'accepted') {
        setInstallState('installed');
      } else {
        setInstallState('dismissed');
      }
    } catch (e) {
      console.error('[PWA] Install prompt error:', e);
      setInstallState('unsupported');
    }
    deferredPrompt.current = null;
  };

  const dismissPrompt = () => setInstallState('dismissed');

  const applyUpdate = () => {
    const sw = swReg.current?.waiting;
    if (sw) {
      sw.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const canInstall = installState === 'ready' || installState === 'ios';

  return {
    installState,
    canInstall,
    isStandalone,
    triggerInstall,
    dismissPrompt,
    updateAvailable,
    applyUpdate,
  };
}
