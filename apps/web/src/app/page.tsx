'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import RightPanel from '@/components/layout/RightPanel';
import { apiClient } from '@/lib/api';
import type { Anime, Episode } from '@/types/design';

const fallbackHero = {
  title: 'Echoes of the Void',
  description: 'The stellar convergence reaches its peak as Kaelen faces the Abyss Lord. In a final stand, the vanguard must protect the central core before the reality tear expands.',
  tag1: 'S2 E4',
  tag2: 'Dark Fantasy',
  bannerUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200',
};

const fallbackContinue: Episode[] = [
  { id: '1', animeId: 'a1', number: 12, title: 'Neon Genesis Protocol', duration: 24 * 60 + 12, progress: 65, thumbnailUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400' },
  { id: '2', animeId: 'a2', number: 5, title: 'Wandering Spirit', duration: 24 * 60 + 5, progress: 30, thumbnailUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400' },
];

export default function HomePage() {
  const [continueWatching, setContinueWatching] = useState<Episode[]>([]);
  const [heroAnime, setHeroAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiClient.get<Anime[]>('/anime/featured').catch(() => []),
      apiClient.get<any[]>('/watchlist/continue-watching').catch(() => []),
    ])
      .then(([featured, cont]) => {
        if (featured?.length) setHeroAnime(featured[0]);
        setContinueWatching(cont?.length ? cont : fallbackContinue);
      })
      .catch(() => {
        setContinueWatching(fallbackContinue);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[260px] flex flex-col min-h-screen relative w-full lg:pr-[300px]">
        <TopBar />
        <div className="flex-1 pb-16 pt-16">
          {error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-error font-body text-body-lg">Failed to load content</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg font-body text-metadata">Retry</button>
              </div>
            </div>
          ) : (
            <>
              <section className="relative w-full h-[614px] min-h-[500px] mb-12">
                <div className="absolute inset-0 bg-surface-container-highest">
                  <div className="w-full h-full bg-gradient-to-br from-surface-container-highest via-surface to-deep-indigo/30" />
                </div>
                <div className="absolute inset-0 hero-gradient" />
                <div className="absolute bottom-0 left-0 w-full p-[40px] z-10 flex flex-col justify-end">
                  <div className="flex gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 font-mono text-label-sm text-accent-cyan">{heroAnime?.genres?.[0] || 'S2 E4'}</span>
                    <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 font-mono text-label-sm text-on-surface-variant">{heroAnime?.genres?.[1] || 'Dark Fantasy'}</span>
                  </div>
                  <h2 className="font-display text-display-xl text-on-surface mb-2 text-glow max-w-3xl">{heroAnime?.title || 'Echoes of the Void'}</h2>
                  <p className="font-body text-body-md text-on-surface-variant max-w-2xl mb-6 line-clamp-2">{heroAnime?.description || 'Loading description...'}</p>
                  <div className="flex items-center gap-4">
                    <Link
                      href={continueWatching.length > 0 ? `/player/${continueWatching[0].animeId}/${continueWatching[0].id}` : '#'}
                      className="bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-body text-metadata font-bold py-3 px-8 rounded-lg hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all flex items-center gap-2"
                    >
                      <span>▶</span>
                      {continueWatching.length > 0 ? 'Continue Watching' : 'Browse Anime'}
                    </Link>
                    <Link
                      href={heroAnime ? `/anime/${heroAnime.id}` : '#'}
                      className="bg-surface-variant/40 backdrop-blur-md border border-white/10 text-on-surface font-body text-metadata py-3 px-6 rounded-lg hover:bg-surface-variant/60 transition-all flex items-center gap-2"
                    >
                      <span>ℹ</span>
                      Details
                    </Link>
                  </div>
                </div>
              </section>

              <section className="px-[40px] mb-12">
                <h3 className="font-display text-headline-md text-on-surface mb-6 flex items-center gap-2">
                  <span className="text-accent-cyan">◉</span>
                  Continue Watching
                </h3>
                {loading ? (
                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="min-w-[280px] w-[280px] rounded-xl bg-surface-container-high border border-white/5 overflow-hidden animate-pulse flex-shrink-0">
                        <div className="aspect-video bg-surface-variant" />
                        <div className="p-4 space-y-2">
                          <div className="h-3 bg-surface-variant rounded w-3/4" />
                          <div className="h-3 bg-surface-variant rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : continueWatching.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-on-surface-variant font-body text-body-md">No episodes in progress</p>
                    <Link href="/watchlist" className="mt-4 inline-block px-6 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg font-body text-metadata">
                      Browse Library
                    </Link>
                  </div>
                ) : (
                  <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {continueWatching.map((ep) => (
                      <Link
                        key={ep.id}
                        href={`/player/${ep.animeId}/${ep.id}`}
                        className="min-w-[280px] w-[280px] rounded-xl bg-surface-container-high border border-white/5 overflow-hidden group cursor-pointer card-hover-effect flex-shrink-0"
                      >
                        <div className="relative aspect-video">
                          <div className="w-full h-full bg-surface-variant" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            <span className="text-4xl text-white opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300">▶</span>
                          </div>
                          {ep.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded font-mono text-label-sm text-on-surface">
                              {Math.floor(ep.duration / 60)}:{(ep.duration % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                        </div>
                        <div className="h-0.5 w-full bg-surface-variant">
                          <div className="h-full bg-accent-cyan w-[65%] shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${ep.progress || 0}%` }} />
                        </div>
                        <div className="p-4">
                          <div className="font-mono text-label-sm text-accent-violet mb-1">S1 E{ep.number}</div>
                          <h4 className="font-body text-metadata text-on-surface truncate">{ep.title}</h4>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
      <RightPanel />
    </div>
  );
}
