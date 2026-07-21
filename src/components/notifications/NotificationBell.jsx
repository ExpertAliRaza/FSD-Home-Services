import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { markAllNotificationsRead, markNotificationRead, subscribeToNotifications } from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';

export function NotificationBell({ notifications, onChange, resolveLink }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const unread = notifications.filter((item) => !item.is_read);

  useEffect(() => {
    if (!supabase) return undefined;
    let channel;
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      channel = subscribeToNotifications(data.user.id, (notification) => {
        onChange((current) => [notification, ...current].slice(0, 100));
      });
    });
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [onChange]);

  useEffect(() => {
    const close = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const read = async (notification) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
      onChange((current) => current.map((item) =>
        item.id === notification.id ? { ...item, is_read: true } : item
      ));
    }
    const link = resolveLink?.(notification);
    if (link) window.location.assign(link);
  };

  const readAll = async () => {
    await markAllNotificationsRead();
    onChange((current) => current.map((item) => ({ ...item, is_read: true })));
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open notifications"
        aria-expanded={open}
        className="focus-ring relative flex h-11 w-11 items-center justify-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50"
      >
        <Bell size={20} />
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1 text-center text-xs font-bold leading-5 text-white">
            {Math.min(unread.length, 99)}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 p-3">
            <strong>Notifications</strong>
            {unread.length > 0 && (
              <button type="button" onClick={readAll} className="inline-flex min-h-9 items-center gap-1 text-xs font-bold text-brand-700">
                <CheckCheck size={16} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.slice(0, 12).map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => read(notification)}
                className={`block w-full border-b border-slate-100 p-3 text-left hover:bg-slate-50 ${notification.is_read ? 'bg-white' : 'bg-brand-50'}`}
              >
                <span className="block text-sm font-bold text-slate-950">{notification.title}</span>
                <span className="mt-1 block text-sm text-slate-600">{notification.message}</span>
                <span className="mt-1 block text-xs text-slate-400">{new Date(notification.created_at).toLocaleString()}</span>
              </button>
            ))}
            {!notifications.length && <p className="p-5 text-sm text-slate-500">No notifications yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
