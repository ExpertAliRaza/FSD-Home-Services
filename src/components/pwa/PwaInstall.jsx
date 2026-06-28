import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download } from 'lucide-react';

const PwaInstallContext = createContext(null);

function isStandaloneDisplay() {
  return Boolean(
    window.matchMedia?.('(display-mode: standalone)').matches
    || window.navigator.standalone
  );
}

function isIosDevice() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent)
    || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
}

export function PwaInstallProvider({ children }) {
  const [promptEvent, setPromptEvent] = useState(null);
  const [installed, setInstalled] = useState(() => isStandaloneDisplay());
  const [recentlyInstalled, setRecentlyInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setIos(isIosDevice());

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      if (!isStandaloneDisplay()) {
        setPromptEvent(event);
      }
    };

    const handleInstalled = () => {
      setPromptEvent(null);
      setInstalled(true);
      setRecentlyInstalled(true);
    };

    const displayModeQuery = window.matchMedia?.('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      if (isStandaloneDisplay()) {
        setInstalled(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    displayModeQuery?.addEventListener?.('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      displayModeQuery?.removeEventListener?.('change', handleDisplayModeChange);
    };
  }, []);

  useEffect(() => {
    if (!recentlyInstalled) return undefined;
    const timer = setTimeout(() => setRecentlyInstalled(false), 4000);
    return () => clearTimeout(timer);
  }, [recentlyInstalled]);

  const installApp = useCallback(async () => {
    if (!promptEvent) return;

    const installPrompt = promptEvent;
    setPromptEvent(null);

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice?.outcome === 'accepted') {
        setInstalled(true);
        setRecentlyInstalled(true);
      }
    } catch {
      setPromptEvent(installPrompt);
    }
  }, [promptEvent]);

  const value = useMemo(() => ({
    canInstall: Boolean(promptEvent) && !installed,
    installApp,
    installed,
    ios,
    recentlyInstalled
  }), [installApp, installed, ios, promptEvent, recentlyInstalled]);

  return (
    <PwaInstallContext.Provider value={value}>
      {children}
    </PwaInstallContext.Provider>
  );
}

export function InstallAppButton({
  className = '',
  compact = false,
  showIosNote = false,
  variant = 'light'
}) {
  const install = useContext(PwaInstallContext);

  if (!install) return null;

  if (install.recentlyInstalled) {
    return (
      <div className={`${statusClasses(variant)} ${className}`} role="status">
        <CheckCircle2 size={compact ? 16 : 18} aria-hidden="true" />
        App installed
      </div>
    );
  }

  if (install.installed) return null;

  if (install.canInstall) {
    return (
      <button
        type="button"
        onClick={install.installApp}
        className={`${buttonClasses(variant)} ${compact ? 'px-3 py-2 text-sm' : 'min-h-12 px-5 py-3'} ${className}`}
      >
        <Download size={compact ? 16 : 18} aria-hidden="true" />
        Install App
      </button>
    );
  }

  if (showIosNote && install.ios) {
    return (
      <p className={`${noteClasses(variant)} ${className}`}>
        On iPhone, tap Share {'->'} Add to Home Screen.
      </p>
    );
  }

  return null;
}

function buttonClasses(variant) {
  const shared = 'focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-bold transition';

  if (variant === 'dark') {
    return `${shared} border border-slate-700 bg-slate-900 text-white hover:border-brand-500 hover:bg-slate-800`;
  }

  return `${shared} border border-brand-700 bg-white text-brand-700 hover:bg-brand-50`;
}

function statusClasses(variant) {
  const color = variant === 'dark'
    ? 'border-brand-500/40 bg-slate-900 text-brand-100'
    : 'border-brand-200 bg-brand-50 text-brand-700';

  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold ${color}`;
}

function noteClasses(variant) {
  return variant === 'dark'
    ? 'rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm leading-5 text-slate-300'
    : 'rounded-lg border border-brand-100 bg-brand-50 px-3 py-2 text-sm leading-5 text-brand-900';
}
