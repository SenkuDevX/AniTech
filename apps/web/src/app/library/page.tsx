'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { apiClient } from '@/lib/api';
import type { WatchlistItem } from '@/types/design';

interface LibraryStats {
  watching: number;
  completed: number;
  planToWatch: number;
  onHold: number;
  dropped: number;
  totalEpisodes: number;
  totalDaysWatched: number;
  totalAnime: number;
}

const statusTabs = ['All', 'Watching', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch'] as const;
type StatusTab = typeof statusTabs[number];

const statusMap: Record<string, string> = {
  'Watching': 'watching',
  'Completed': 'completed',
  'On Hold': 'on_hold',
  'Dropped': 'dropped',
  'Plan to Watch': 'plan_to_watch',
};

export default function LibraryPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [activeTab, setActiveTab] = useState<StatusTab>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    Promise.all([
      apiClient.get<{ results: WatchlistItem[]; total: number; page: number; perPage: number }>('/watchlist'),
      apiClient.get<LibraryStats>('/watchlist/stats').catch(() => null),
    ])
      .then(([watchlistRes, statsRes]) => {
        setItems(watchlistRes.results || []);
        setStats(statsRes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'All'
    ? items
    : items.filter((item) => item.status === statusMap[activeTab]);

  const activeSessions = items.filter((i) => i.status === 'watching');

  const statCards = stats
    ? [
        { label: 'Total Anime', value: stats.totalAnime, icon: '◻', color: 'text-accent-cyan' },
        { label: 'Episodes Watched', value: stats.totalEpisodes, icon: '▶', color: 'text-accent-violet' },
        { label: 'Days Watched', value: stats.totalDaysWatched.toFixed(1), icon: '◉', color: 'text-accent-gold' },
        { label: 'Completed', value: stats.completed, icon: '✓', color: 'text-accent-magenta' },
      ]
    : [];

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[260px] pt-16 min-h-screen">
        <TopBar />
        <div className="px-[40px] py-8 max-w-[1800px] mx-auto">
          <div className="mb-10 space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-display text-display-xl text-on-surface mb-2">Library</h2>
                <p className="font-body text-body-md text-on-surface-variant">Your complete anime collection at a glance.</p>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-high/50 p-1.5 rounded-xl border border-white/5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-surface-variant text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'} transition-colors`}
                >
                  <span>⊞</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-surface-variant text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'} transition-colors`}
                >
                  <span>☰</span>
                </button>
              </div>
            </div>

            {!loading && !error && statCards.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                  <div key={stat.label} className="glass-panel rounded-xl p-5 flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className={`w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-xl ${stat.color} shrink-0 relative z-10`}>
                      <span>{stat.icon}</span>
                    </div>
                    <div className="relative z-10">
                      <p className="font-display text-headline-lg text-on-surface leading-none mb-1">{stat.value}</p>
                      <p className="font-body text-metadata text-on-surface-variant">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-4 items-center justify-between bg-surface-container/60 p-2 pl-4 rounded-2xl border border-white/5 glass-panel">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {statusTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-2 rounded-xl whitespace-nowrap font-body text-metadata transition-colors ${
                      activeTab === tab
                        ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/30'
                        : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-[200px] bg-surface-container-high rounded-2xl animate-pulse" />
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-surface-container-high rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-error font-body text-body-lg">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg font-body text-metadata">Retry</button>
              </div>
            </div>
          ) : (
            <>
              {activeSessions.length > 0 && (
                <section className="mb-12">
                  <h3 className="font-display text-headline-md text-on-surface mb-6 flex items-center gap-2">
                    <span className="text-accent-cyan">▶</span>
                    Active Sessions
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeSessions.slice(0, 2).map((item) => (
                      <Link
                        key={item.id}
                        href={`/anime/${item.animeId}`}
                        className="relative overflow-hidden rounded-2xl glass-panel group cursor-pointer border-l-4 border-l-accent-cyan"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/80 to-transparent z-10" />
                        <div className="relative z-20 p-6 flex flex-col h-full justify-between min-h-[200px]">
                          <div className="flex justify-between items-start">
                            <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan rounded-full font-mono text-label-sm border border-accent-cyan/30 flex items-center gap-1">
                              <span>◉</span> Active
                            </span>
                            <span className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent-cyan hover:text-black flex items-center justify-center transition-all backdrop-blur-md">▶</span>
                          </div>
                          <div>
                            <h4 className="font-display text-headline-lg text-white mb-2 leading-tight">{item.anime.title}</h4>
                            <div className="flex items-center gap-4 text-on-surface-variant font-body text-metadata mb-4">
                              <span className="flex items-center gap-1">
                                <span className="text-accent-gold text-sm">★</span> {item.rating || '—'}
                              </span>
                              <span>{item.anime.genres?.slice(0, 2).join(' / ') || 'Anime'}</span>
                              <span>Ep {item.progress} of {item.totalEpisodes}</span>
                            </div>
                            <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                              <div
                                className="h-full bg-accent-cyan relative"
                                style={{ width: `${(item.progress / item.totalEpisodes) * 100}%` }}
                              >
                                <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/50 blur-sm" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h3 className="font-display text-headline-md text-on-surface mb-6">All Series</h3>
                {filtered.length === 0 ? (
                  <div className="glass-panel rounded-xl p-12 text-center">
                    <p className="text-on-surface-variant font-body text-body-lg mb-4">No anime in this category yet</p>
                    <Link href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-lg font-body text-metadata">
                      Discover Anime
                    </Link>
                  </div>
                ) : (
                  <div className={viewMode === 'grid'
                    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'
                    : 'flex flex-col gap-4'
                  }>
                    {filtered.map((item) => (
                      <Link
                        key={item.id}
                        href={`/anime/${item.animeId}`}
                        className={`group relative rounded-xl overflow-hidden bg-surface-container anime-card-hover border border-white/5 ${
                          viewMode === 'list' ? 'flex gap-4 p-3' : ''
                        }`}
                      >
                        <div className={viewMode === 'list' ? 'w-24 shrink-0' : 'aspect-[2/3] w-full bg-surface-variant relative overflow-hidden'}>
                          <div className="w-full h-full bg-surface-variant" />
                          <div className="absolute top-2 left-2 z-20">
                            <span className={`bg-surface-container-lowest/80 backdrop-blur-sm font-mono text-label-sm px-2 py-1 rounded border ${
                              item.status === 'watching' ? 'text-accent-cyan border-accent-cyan/20' :
                              item.status === 'completed' ? 'text-accent-gold border-accent-gold/20' :
                              item.status === 'on_hold' ? 'text-accent-violet border-accent-violet/20' :
                              item.status === 'dropped' ? 'text-error border-error/20' :
                              'text-on-surface-variant border-white/10'
                            }`}>
                              {item.status === 'plan_to_watch' ? 'Plan to Watch' :
                               item.status === 'watching' ? 'Next: Tonight' :
                               item.status === 'completed' ? 'Completed' :
                               item.status === 'on_hold' ? 'On Hold' :
                               item.status === 'dropped' ? 'Dropped' : item.status}
                            </span>
                          </div>
                        </div>
                        <div className={viewMode === 'list' ? 'flex-1 py-1' : 'p-3 bg-surface-container relative z-20'}>
                          <h5 className="font-body font-bold text-on-surface truncate mb-1">{item.anime.title}</h5>
                          <div className="flex justify-between items-center font-body text-metadata text-on-surface-variant">
                            <span>{item.progress}/{item.totalEpisodes} Eps</span>
                            <span className="flex items-center gap-1">
                              <span className="text-accent-gold text-sm">★</span> {item.rating || '—'}
                            </span>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-surface-variant z-20">
                          <div
                            className={`h-full ${item.status === 'completed' ? 'bg-accent-violet' : 'bg-accent-cyan'}`}
                            style={{ width: `${(item.progress / item.totalEpisodes) * 100}%` }}
                          />
                        </div>
                      </Link>
                    ))}
                    <Link
                      href="/"
                      className="group relative rounded-xl overflow-hidden bg-surface-container border border-white/5 opacity-50 hover:opacity-100 transition-opacity flex flex-col items-center justify-center aspect-[2/3]"
                    >
                      <span className="text-[48px] text-on-surface-variant">+</span>
                      <span className="font-body text-metadata text-on-surface-variant">Discover More</span>
                    </Link>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
