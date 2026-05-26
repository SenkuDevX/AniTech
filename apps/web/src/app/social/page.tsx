'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';

interface WatchParty {
  id: string;
  title: string;
  episode: string;
  host: string;
  participantCount: number;
  thumbnailUrl?: string;
}

interface FeedItem {
  id: string;
  username: string;
  type: 'watch' | 'watchlist_add' | 'review';
  animeTitle: string;
  animePoster?: string;
  episode?: string;
  rating?: number;
  likes: number;
  comments: number;
  timeAgo: string;
}

interface OnlineFriend {
  id: string;
  username: string;
  status: string;
  isOnline: boolean;
}

const defaultParties: WatchParty[] = [
  { id: '1', title: 'Neon Genesis: End', episode: 'Ep 24 - Hosted by @Kaito', host: 'Kaito', participantCount: 12 },
  { id: '2', title: 'Frieren Journey', episode: 'Ep 10 - Hosted by @Elara', host: 'Elara', participantCount: 4 },
];

const defaultFeed: FeedItem[] = [
  { id: '1', username: 'JinSakai', type: 'watch', animeTitle: 'Jujutsu Kaisen Season 2', episode: 'Episode 17: Thunderclap', rating: 10, likes: 24, comments: 3, timeAgo: '2h ago' },
  { id: '2', username: 'Maya_T', type: 'watchlist_add', animeTitle: '86 EIGHTY-SIX', likes: 12, comments: 1, timeAgo: '5h ago' },
];

const defaultFriends: OnlineFriend[] = [
  { id: '1', username: 'JinSakai', status: 'Watching JJK S2', isOnline: true },
  { id: '2', username: 'Elara', status: 'Idle for 20m', isOnline: false },
];

export default function SocialPage() {
  const [parties, setParties] = useState<WatchParty[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [friends, setFriends] = useState<OnlineFriend[]>([]);
  const [feedTab, setFeedTab] = useState<'friend' | 'global'>('friend');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get<{ results: WatchParty[] }>('/social/parties').catch(() => ({ results: [] })),
      apiClient.get<{ results: FeedItem[] }>('/social/feed').catch(() => ({ results: [] })),
      apiClient.get<OnlineFriend[]>('/social/friends').catch(() => []),
    ])
      .then(([p, f, fr]) => {
        setParties(p.results?.length ? p.results : defaultParties);
        setFeed(f.results?.length ? f.results : defaultFeed);
        setFriends(fr?.length ? fr : defaultFriends);
      })
      .catch(() => {
        setParties(defaultParties);
        setFeed(defaultFeed);
        setFriends(defaultFriends);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col md:ml-[260px] h-full overflow-hidden relative w-full pt-20 md:pt-0 pb-20 md:pb-0">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-violet via-surface to-background" />
        <div className="flex-1 overflow-y-auto px-4 md:px-[40px] py-8 z-10 w-full flex flex-col xl:flex-row gap-6">
          <div className="flex-1 flex flex-col min-w-0">
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-headline-lg font-bold text-on-surface flex items-center gap-3">
                  <span className="text-accent-blue">◉</span>
                  Live Watch Parties
                </h2>
                <button className="font-body text-metadata text-accent-violet hover:text-white transition-colors flex items-center gap-1">
                  View All →
                </button>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-48 bg-surface-container-high rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : parties.length === 0 ? (
                <div className="glass-panel rounded-xl p-8 text-center">
                  <p className="text-on-surface-variant font-body text-body-md">No live watch parties right now</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {parties.map((party) => (
                    <div key={party.id} className="glass-card rounded-xl overflow-hidden relative group h-48 flex flex-col justify-end p-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-surface-container-highest via-surface to-deep-indigo/40 z-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent z-10" />
                      <div className="relative z-20 w-full">
                        <div className="flex justify-between items-start mb-2">
                          <span className="bg-error/20 text-error border border-error/30 font-mono text-label-sm px-2 py-1 rounded-md flex items-center gap-1 backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" /> LIVE
                          </span>
                          <div className="flex">
                            {Array.from({ length: Math.min(party.participantCount, 3) }).map((_, i) => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center text-[10px] -ml-2 first:ml-0" />
                            ))}
                            {party.participantCount > 3 && (
                              <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-variant flex items-center justify-center font-mono text-[10px] text-on-surface-variant -ml-2">
                                +{party.participantCount - 3}
                              </div>
                            )}
                          </div>
                        </div>
                        <h3 className="font-display text-headline-md text-white font-bold leading-tight truncate">{party.title}</h3>
                        <p className="font-body text-metadata text-on-surface-variant mb-4 truncate">{party.episode}</p>
                        <button className="w-full bg-gradient-to-r from-accent-blue to-tertiary text-surface font-body text-metadata font-bold py-2 rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          Join Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="flex-1 pb-10">
              <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                <button
                  onClick={() => setFeedTab('friend')}
                  className={`font-body text-metadata pb-4 -mb-[17px] transition-colors ${
                    feedTab === 'friend' ? 'text-white font-bold border-b-2 border-accent-violet' : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  Friend Activity
                </button>
                <button
                  onClick={() => setFeedTab('global')}
                  className={`font-body text-metadata pb-4 -mb-[17px] transition-colors ${
                    feedTab === 'global' ? 'text-white font-bold border-b-2 border-accent-violet' : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  Global Trending
                </button>
              </div>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-32 bg-surface-container-high rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : feed.length === 0 ? (
                <div className="glass-panel rounded-xl p-8 text-center">
                  <p className="text-on-surface-variant font-body text-body-md">No activity yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feed.map((item) => (
                    <div key={item.id} className="glass-panel rounded-xl p-5 flex gap-5">
                      <div className="flex-shrink-0 relative">
                        <div className="w-12 h-12 rounded-full border-2 border-surface-variant bg-surface-variant flex items-center justify-center text-sm">
                          {item.username[0]}
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-tertiary rounded-full border-2 border-surface" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <h4 className="font-body text-metadata text-white">
                            <span className="font-bold">@{item.username}</span>{' '}
                            {item.type === 'watch' ? 'completed an episode' : item.type === 'watchlist_add' ? 'added to watchlist' : 'reviewed'}
                          </h4>
                          <span className="font-mono text-label-sm text-on-surface-variant">{item.timeAgo}</span>
                        </div>
                        <div className="glass-card rounded-lg p-3 mt-3 flex gap-4 items-center">
                          <div className="w-16 h-24 bg-surface-variant rounded-md shadow-md shrink-0 flex items-center justify-center text-xs text-on-surface-variant">Poster</div>
                          <div className="flex-1">
                            <h5 className="font-display text-body-lg font-bold text-on-surface">{item.animeTitle}</h5>
                            {item.episode && <p className="font-body text-metadata text-on-surface-variant">{item.episode}</p>}
                            {item.rating && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-accent-gold text-sm">★</span>
                                <span className="font-mono text-label-sm text-white">Rated {item.rating}/10</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                          <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-accent-violet transition-colors">
                            <span>♡</span>
                            <span className="font-mono text-label-sm">{item.likes}</span>
                          </button>
                          <button className="flex items-center gap-1.5 text-on-surface-variant hover:text-accent-blue transition-colors">
                            <span>💬</span>
                            <span className="font-mono text-label-sm">{item.comments}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="hidden xl:flex w-80 flex-col gap-6 shrink-0">
            <div className="glass-panel rounded-2xl p-5 border border-white/5">
              <h3 className="font-display text-body-lg font-bold text-on-surface mb-4">Online Friends</h3>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-surface-variant" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-surface-variant rounded w-1/2" />
                        <div className="h-2 bg-surface-variant rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : friends.length === 0 ? (
                <p className="text-on-surface-variant text-sm text-center py-4">No friends online</p>
              ) : (
                <div className="space-y-3">
                  {friends.map((friend) => (
                    <div key={friend.id} className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors -mx-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center text-xs">
                            {friend.username[0]}
                          </div>
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface ${friend.isOnline ? 'bg-tertiary' : 'bg-accent-gold'}`} />
                        </div>
                        <div>
                          <p className="font-body text-metadata text-white">{friend.username}</p>
                          <p className="font-mono text-label-sm text-on-surface-variant truncate w-32">{friend.status}</p>
                        </div>
                      </div>
                      <span className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity">💬</span>
                    </div>
                  ))}
                </div>
              )}
              <button className="w-full mt-4 py-2 font-mono text-label-sm text-accent-violet border border-accent-violet/30 rounded-lg hover:bg-accent-violet/10 transition-colors">
                View All Friends
              </button>
            </div>
          </aside>
        </div>
      </main>

      <nav className="fixed bottom-0 w-full rounded-t-xl md:hidden bg-surface-container-highest/90 backdrop-blur-lg border-t border-white/10 z-50 flex justify-around items-center px-4 pb-4 pt-2">
        <Link href="/" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1">
          <span className="mb-1">🏠</span>
          <span className="font-mono text-label-sm">Home</span>
        </Link>
        <Link href="/search" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1">
          <span className="mb-1">⌕</span>
          <span className="font-mono text-label-sm">Search</span>
        </Link>
        <Link href="/social" className="flex flex-col items-center justify-center bg-accent-blue/20 text-accent-blue px-4 py-1 scale-110">
          <span className="mb-1">◆</span>
          <span className="font-mono text-label-sm font-bold">Community</span>
        </Link>
        <Link href="/settings" className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1">
          <span className="mb-1">👤</span>
          <span className="font-mono text-label-sm">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
