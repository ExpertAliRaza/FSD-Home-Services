import { useEffect, useId, useRef, useState } from 'react';

const scriptUrl = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export function TurnstileWidget({ onToken, resetKey }) {
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const skipTurnstile = import.meta.env.VITE_SKIP_TURNSTILE === 'true';

  const reactId = useId();
  const containerId = `turnstile-${reactId.replace(/:/g, '')}`;
  const widgetId = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (skipTurnstile) {
      onToken('00000000-0000-0000-0000-000000000001');
    }
  }, [skipTurnstile, onToken]);

  useEffect(() => {
    if (skipTurnstile || !siteKey) return undefined;

    let cancelled = false;
    const renderWidget = () => {
      if (cancelled || !window.turnstile || widgetId.current !== null) return;
      widgetId.current = window.turnstile.render(`#${containerId}`, {
        sitekey: siteKey,
        callback: (token) => {
          setError('');
          onToken(token);
        },
        'expired-callback': () => onToken(''),
        'error-callback': () => {
          onToken('');
          setError('Verification could not load. Please try again.');
        }
      });
    };

    const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
    if (existingScript) {
      if (window.turnstile) renderWidget();
      else existingScript.addEventListener('load', renderWidget, { once: true });
    } else {
      const script = document.createElement('script');
      script.src = scriptUrl;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', renderWidget, { once: true });
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      if (widgetId.current !== null && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [containerId, onToken, siteKey, skipTurnstile]);

  useEffect(() => {
    if (widgetId.current !== null && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      onToken('');
    }
  }, [onToken, resetKey]);

  if (skipTurnstile) {
    return (
      <p className="rounded-lg bg-brand-50 p-3 text-sm font-semibold text-brand-800">
        Development mode: Turnstile skipped
      </p>
    );
  }

  if (!siteKey) {
    return (
      <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">
        Human verification is not configured. Please contact support.
      </p>
    );
  }

  return (
    <div>
      <div id={containerId} className="min-h-[65px]" />
      {error && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
    </div>
  );
}