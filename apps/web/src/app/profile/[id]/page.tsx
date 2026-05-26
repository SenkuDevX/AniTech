'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { apiClient } from '@/lib/api';

interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  joinDate: string;
  totalAnime: number;
  followers: number;
  following: number;
  achievements: number;
}

interface WatchlistItem {
  id: string;
  animeId: string;
  anime: { title: string; posterUrl?: string };
  status: string;
  progress: number;
  totalEpisodes: number;
}

interface Friend {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

interface FeedItem {
  id: string;
  username: string;
  type: string;
  animeTitle: string;
  episode?: string;
  timeAgo: string;
}

const defaultUser: UserProfile = {
  id: '1',
  username: 'Kaelen',
  displayName: 'Soul Reaver',
  bio: 'Exploring the void between worlds. Dark fantasy enthusiast and completionist.',
  joinDate: 'Joined March 2024',
  totalAnime: 142,
  followers: 1284,
  following: 389,
  achievements: 47,
};

const fallbackWatchlist: WatchlistItem[] = [
  { id: 'w1', animeId: 'a1', anime: { title: 'Neon Genesis Protocol' }, status: 'watching', progress: 8, totalEpisodes: 24 },
  { id: 'w2', animeId: 'a2', anime: { title: 'Wandering Spirit' }, status: 'watching', progress: 3, totalEpisodes: 12 },
  { id: 'w3', animeId: 'a3', anime: { title: 'Echoes of the Abyss' }, status: 'plan_to_watch', progress: 0, totalEpisodes: 26 },
  { id: 'w4', animeId: 'a4', anime: { title: 'Starlight Requiem' }, status: 'completed', progress: 24, totalEpisodes: 24 },
];

const fallbackFriends: Friend[] = [
  { id: 'f1', username: 'JinSakai', isOnline: true },
  { id: 'f2', username: 'Maya_T', isOnline: false },
  { id: 'f3', username: 'Elara', isOnline: true },
];

const fallbackFeed: FeedItem[] = [
  { id: 'fe1', username: 'JinSakai', type: 'watch', animeTitle: 'Jujutsu Kaisen Season 2', episode: 'Episode 17', timeAgo: '2h ago' },
  { id: 'fe2', username: 'Maya_T', type: 'watchlist_add', animeTitle: '86 EIGHTY-SIX', timeAgo: '5h ago' },
];

export default function ProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      apiClient.get<UserProfile>(`/users/${params.id}`).catch(() => defaultUser),
      apiClient.get<{ results: WatchlistItem[] }>(`/watchlist?userId=${params.id}`).catch(() => ({ results: [] })),
      apiClient.get<Friend[]>(`/users/${params.id}/friends`).catch(() => []),
      apiClient.get<{ results: FeedItem[] }>('/social/feed').catch(() => ({ results: [] })),
    ])
      .then(([user, wl, fr, fd]) => {
        setProfile(user);
        setWatchlist(wl.results?.length ? wl.results : fallbackWatchlist);
        setFriends(fr?.length ? fr : fallbackFriends);
        setFeed(fd.results?.length ? fd.results : fallbackFeed);
      })
      .catch(() => {
        setProfile(defaultUser);
        setWatchlist(fallbackWatchlist);
        setFriends(fallbackFriends);
        setFeed(fallbackFeed);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[260px] min-h-screen">
          <TopBar />
          <div className="pt-24 px-[40px] max-w-6xl mx-auto pb-16 space-y-8">
            <div className="flex gap-8 items-end">
              <div className="w-32 h-32 rounded-full bg-surface-variant animate-pulse shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-8 bg-surface-variant rounded w-1/4 animate-pulse" />
                <div className="h-4 bg-surface-variant rounded w-1/3 animate-pulse" />
                <div className="h-4 bg-surface-variant rounded w-1/2 animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-surface-container-high rounded-xl animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-64 bg-surface-container-high rounded-xl animate-pulse" />
              <div className="h-64 bg-surface-container-high rounded-xl animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[260px] pt-24 flex items-center justify-center">
          <div className="text-center">
            <p className="text-error font-body text-body-lg">{error || 'User not found'}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg font-body text-metadata">Retry</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[260px] min-h-screen pb-24">
        <TopBar />
        <div className="pt-24 px-[40px] max-w-6xl mx-auto">
          <section className="relative mb-12">
            <div className="absolute -top-24 -left-40 w-[500px] h-[500px] bg-accent-violet/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-accent-violet to-accent-cyan p-[3px] shrink-0">
                <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center text-5xl font-display font-bold text-on-surface overflow-hidden">
                  {profile.avatarUrl ? (
                    <img alt={profile.username} className="w-full h-full object-cover" src={profile.avatarUrl} />
                  ) : (
                    profile.username[0]?.toUpperCase()
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h1 className="font-display text-display-xl text-on-surface mb-1">{profile.displayName || profile.username}</h1>
                <p className="font-body text-body-lg text-on-surface-variant mb-2">@{profile.username}</p>
                {profile.bio && (
                  <p className="font-body text-body-md text-on-surface-variant max-w-2xl mb-4">{profile.bio}</p>
                )}
                <div className="flex items-center gap-4 font-body text-metadata text-on-surface-variant">
                  <span className="flex items-center gap-1">📅 {profile.joinDate}</span>
                </div>
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-body text-metadata font-bold rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all shrink-0">
                + Follow
              </button>
            </div>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: 'Total Anime', value: profile.totalAnime, icon: '◉' },
              { label: 'Followers', value: profile.followers, icon: '◆' },
              { label: 'Following', value: profile.following, icon: '◻' },
              { label: 'Achievements', value: profile.achievements, icon: '✦' },
            ].map((stat) => (
              <div key={stat.label} className="glass-panel rounded-xl p-5 text-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <span className="text-2xl text-accent-cyan mb-2 block">{stat.icon}</span>
                  <div className="font-display text-headline-lg text-on-surface">{stat.value}</div>
                  <div className="font-body text-metadata text-on-surface-variant mt-1">{stat.label}</div>
                </div>
              </div>
            ))}
          </section>

          <section className="mb-12">
            <h2 className="font-display text-headline-md text-on-surface mb-6 flex items-center gap-2">
              <span className="text-accent-cyan">⊞</span>
              Watchlist
            </h2>
            {watchlist.length === 0 ? (
              <div className="glass-panel rounded-xl p-8 text-center">
                <p className="text-on-surface-variant font-body text-body-md">No anime in watchlist yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {watchlist.slice(0, 8).map((item) => (
                  <Link
                    key={item.id}
                    href={`/anime/${item.animeId}`}
                    className="glass-panel rounded-xl overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
                  >
                    <div className="aspect-[2/3] bg-surface-variant relative">
                      <div className="w-full h-full bg-gradient-to-br from-surface-container-highest to-surface" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="text-3xl text-white opacity-0 group-hover:opacity-100 transition-opacity">▶</span>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          item.status === 'watching' ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30' :
                          item.status === 'completed' ? 'bg-accent-gold/20 text-accent-gold border-accent-gold/30' :
                          'bg-surface/50 text-on-surface-variant border-white/10'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h5 className="font-body text-metadata font-bold text-on-surface truncate">{item.anime.title}</h5>
                      <span className="font-mono text-label-sm text-on-surface-variant">{item.progress}/{item.totalEpisodes} eps</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <section>
              <h2 className="font-display text-headline-md text-on-surface mb-6 flex items-center gap-2">
                <span className="text-accent-violet">◆</span>
                Friends
              </h2>
              {friends.length === 0 ? (
                <div className="glass-panel rounded-xl p-8 text-center">
                  <p className="text-on-surface-variant font-body text-body-md">No friends yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <Link
                      key={friend.id}
                      href={`/profile/${friend.id}`}
                      className="glass-panel rounded-xl p-4 flex items-center gap-4 hover:bg-surface-bright/50 transition-colors group"
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-violet to-accent-cyan p-[2px]">
                          <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center text-sm font-bold text-on-surface">
                            {friend.avatarUrl ? (
                              <img alt={friend.username} className="w-full h-full object-cover rounded-full" src={friend.avatarUrl} />
                            ) : (
                              friend.username[0]?.toUpperCase()
                            )}
                          </div>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface ${friend.isOnline ? 'bg-tertiary' : 'bg-on-surface-variant'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-body text-metadata font-bold text-on-surface group-hover:text-accent-cyan transition-colors">{friend.displayName || friend.username}</h4>
                        <p className="font-mono text-label-sm text-on-surface-variant">@{friend.username}</p>
                      </div>
                      <span className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">💬</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-display text-headline-md text-on-surface mb-6 flex items-center gap-2">
                <span className="text-accent-cyan">◉</span>
                Activity
              </h2>
              {feed.length === 0 ? (
                <div className="glass-panel rounded-xl p-8 text-center">
                  <p className="text-on-surface-variant font-body text-body-md">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {feed.map((item) => (
                    <div key={item.id} className="glass-panel rounded-xl p-4 flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-sm shrink-0">
                        {item.username[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-metadata text-on-surface">
                          <span className="font-bold">@{item.username}</span>{' '}
                          {item.type === 'watch' ? 'watched' : item.type === 'watchlist_add' ? 'added to watchlist' : 'reviewed'}
                        </p>
                        <p className="font-body text-metadata text-accent-cyan truncate">{item.animeTitle}{item.episode ? ` — ${item.episode}` : ''}</p>
                      </div>
                      <span className="font-mono text-label-sm text-on-surface-variant shrink-0">{item.timeAgo}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
