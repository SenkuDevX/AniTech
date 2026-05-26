'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Activity {
  id: string;
  username: string;
  action: string;
  animeTitle: string;
  timeAgo: string;
  hasLiveParty?: boolean;
}

const mockActivities: Activity[] = [
  { id: '1', username: 'Alex', action: 'is watching', animeTitle: 'Neon Genesis Protocol E12', timeAgo: '2m ago' },
  { id: '2', username: 'Sarah', action: 'started a Watch Party', animeTitle: '', timeAgo: '15m ago', hasLiveParty: true },
  { id: '3', username: 'Mike', action: 'completed', animeTitle: 'Full Metal Alchemist', timeAgo: '1h ago' },
];

export default function RightPanel() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<{ results: Activity[] }>('/social/activity')
      .then((res) => setActivities(res.results || []))
      .catch(() => setActivities(mockActivities))
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className="hidden lg:flex flex-col h-full fixed right-0 top-0 w-[300px] bg-surface-container/40 backdrop-blur-2xl border-l border-white/5 z-30 p-4 pt-20">
      <h3 className="font-body text-metadata text-on-surface-variant font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
        <span className="text-sm">◆</span>
        Friend Activity
      </h3>
      <div className="flex flex-col gap-4 overflow-y-auto scrollbar-hide pb-20">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-surface-variant shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-surface-variant rounded w-3/4" />
                <div className="h-3 bg-surface-variant rounded w-1/2" />
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          <p className="text-on-surface-variant text-sm text-center py-8">No recent activity</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex gap-3 items-start group">
              <div className={`w-10 h-10 rounded-full overflow-hidden border shrink-0 ${activity.hasLiveParty ? 'border-accent-violet' : 'border-white/10'}`}>
                <div className="w-full h-full bg-surface-variant flex items-center justify-center text-xs text-on-surface-variant">
                  {activity.username[0]}
                </div>
              </div>
              <div className="flex-1">
                <p className="font-body text-metadata text-on-surface leading-tight">
                  <span className={`font-bold ${activity.hasLiveParty ? 'text-accent-violet' : 'text-accent-blue'}`}>
                    {activity.username}
                  </span>{' '}
                  {activity.action}
                </p>
                {activity.animeTitle && (
                  <p className="font-mono text-label-sm text-on-surface-variant mt-1 line-clamp-1 group-hover:text-accent-cyan transition-colors cursor-pointer">
                    {activity.animeTitle}
                  </p>
                )}
                {activity.hasLiveParty && (
                  <button className="mt-2 bg-accent-violet/20 hover:bg-accent-violet/40 text-accent-violet border border-accent-violet/30 font-mono text-label-sm py-1 px-3 rounded-full transition-colors flex items-center gap-1">
                    Join Party
                  </button>
                )}
                <p className="font-mono text-label-sm text-outline mt-1">{activity.timeAgo}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
