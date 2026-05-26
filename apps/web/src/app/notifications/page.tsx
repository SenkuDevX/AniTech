'use client';
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { apiClient } from '@/lib/api';

type NotificationType =
  | 'episode_aired'
  | 'friend_request'
  | 'achievement'
  | 'recommendation'
  | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  data?: Record<string, unknown>;
}

const typeStyles: Record<
  NotificationType,
  { icon: string; label: string; border: string; bg: string; text: string; badge: string }
> = {
  episode_aired: {
    icon: '▶',
    label: 'New Episode',
    border: 'border-l-accent-cyan',
    bg: 'bg-accent-cyan/10',
    text: 'text-accent-cyan',
    badge: 'text-accent-cyan bg-accent-cyan/10',
  },
  friend_request: {
    icon: '◆',
    label: 'Friend Request',
    border: 'border-l-accent-violet',
    bg: 'bg-accent-violet/10',
    text: 'text-accent-violet',
    badge: 'text-accent-violet bg-accent-violet/10',
  },
  achievement: {
    icon: '★',
    label: 'Achievement',
    border: 'border-l-accent-gold',
    bg: 'bg-accent-gold/10',
    text: 'text-accent-gold',
    badge: 'text-accent-gold bg-accent-gold/10',
  },
  recommendation: {
    icon: '►',
    label: 'Recommendation',
    border: 'border-l-accent-blue',
    bg: 'bg-accent-blue/10',
    text: 'text-accent-blue',
    badge: 'text-accent-blue bg-accent-blue/10',
  },
  system: {
    icon: '⚙',
    label: 'System',
    border: 'border-l-on-surface-variant',
    bg: 'bg-on-surface-variant/10',
    text: 'text-on-surface-variant',
    badge: 'text-on-surface-variant bg-on-surface-variant/10',
  },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [notifs, countRes] = await Promise.all([
        apiClient.get<{ results?: Notification[] }>('/notifications').catch(() => ({ results: [] })),
        apiClient.get<{ count: number }>('/notifications/unread-count').catch(() => ({ count: 0 })),
      ]);
      setNotifications(notifs.results || []);
      setUnreadCount(countRes.count ?? 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await apiClient.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // silently fail
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await apiClient.post(`/notifications/${id}/read`);
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: false } : n))
      );
      setUnreadCount((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen h-screen overflow-hidden flex selection:bg-accent-violet selection:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-deep-indigo rounded-full blur-[150px] opacity-30 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent-cyan rounded-full blur-[150px] opacity-20 mix-blend-screen" />
      </div>
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[260px] h-full relative z-10 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-16">
          <header className="h-24 shrink-0 flex items-center justify-between px-[40px] border-b border-white/5 bg-background/50 backdrop-blur-md">
            <h2 className="font-display text-display-xl text-on-surface flex items-center gap-4">
              <span className="text-[40px] text-accent-cyan">🔔</span>
              Notifications
              {unreadCount > 0 && (
                <span className="font-mono text-label-sm text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/30 px-3 py-1 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h2>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-surface-variant/30 backdrop-blur-md border border-white/10 font-body text-metadata text-on-surface hover:bg-surface-variant/50 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {markingAll ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>✓</span>
                )}
                Mark All Read
              </button>
            )}
          </header>

          <div className="p-[40px]">
            {loading ? (
              <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="glass-panel rounded-xl p-5 flex gap-4 animate-pulse"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-variant shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-surface-variant rounded w-3/4" />
                      <div className="h-3 bg-surface-variant rounded w-1/2" />
                      <div className="h-3 bg-surface-variant rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="max-w-lg mx-auto text-center py-20">
                <div className="text-6xl mb-6 opacity-30">🔔</div>
                <h3 className="font-display text-headline-md text-on-surface mb-3">
                  No notifications yet
                </h3>
                <p className="font-body text-metadata text-on-surface-variant">
                  When you get new episode alerts, friend requests, and achievements,
                  they will appear here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-w-3xl mx-auto">
                {notifications.map((notif) => {
                  const s = typeStyles[notif.type] || typeStyles.system;
                  return (
                    <button
                      key={notif.id}
                      onClick={() => !notif.read && handleMarkRead(notif.id)}
                      disabled={notif.read}
                      className={`glass-panel rounded-xl p-5 flex gap-4 text-left transition-all duration-300 group ${
                        notif.read
                          ? 'opacity-60 hover:opacity-80 cursor-default'
                          : `${s.border} bg-surface-container/40 hover:bg-surface-container/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] cursor-pointer`
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full ${s.bg} border border-white/10 flex items-center justify-center shrink-0 ${s.text}`}
                      >
                        <span className="text-sm">{s.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <h4
                            className={`font-body text-metadata ${
                              notif.read
                                ? 'text-on-surface-variant'
                                : 'text-on-surface font-bold'
                            }`}
                          >
                            {notif.title}
                          </h4>
                          <span className="font-mono text-label-sm text-on-surface-variant shrink-0 whitespace-nowrap">
                            {timeAgo(notif.createdAt)}
                          </span>
                        </div>
                        {notif.body && (
                          <p className="font-body text-metadata text-on-surface-variant mt-1 line-clamp-2">
                            {notif.body}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`font-mono text-label-sm ${s.badge} px-2 py-0.5 rounded-full`}>
                            {s.label}
                          </span>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
