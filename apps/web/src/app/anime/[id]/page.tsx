'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { apiClient } from '@/lib/api';
import type { Anime, Episode } from '@/types/design';

export default function AnimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    Promise.all([
      apiClient.get<{ data: Anime }>(`/anime/${params.id}`).catch(() => null),
      apiClient.get<{ data: Episode[] }>(`/anime/${params.id}/episodes`).catch(() => ({ data: [] })),
    ])
      .then(([animeRes, epRes]) => {
        if (animeRes?.data) setAnime(animeRes.data);
        else throw new Error('Anime not found');
        setEpisodes(epRes.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[260px] pt-16">
          <div className="h-[716px] bg-surface-container-highest animate-pulse" />
          <div className="px-[40px] py-8 space-y-6">
            <div className="h-8 bg-surface-variant rounded w-1/3" />
            <div className="h-4 bg-surface-variant rounded w-2/3" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 bg-surface-variant rounded-xl" />
                ))}
              </div>
              <div className="h-64 bg-surface-variant rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[260px] pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-error font-body text-body-lg">{error || 'Anime not found'}</p>
            <button onClick={() => router.push('/')} className="mt-4 px-6 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg font-body text-metadata">Go Home</button>
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
        <section className="relative w-full h-[716px] min-h-[600px] flex items-end pb-[40px]">
          <div className="absolute inset-0 z-0 hero-mask">
            <div className="w-full h-full bg-gradient-to-br from-surface-container-highest via-surface to-deep-indigo/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
          <div className="relative z-10 px-[40px] w-full max-w-7xl mx-auto flex gap-12 items-end">
            <div className="hidden lg:block w-64 shrink-0 rounded-xl overflow-hidden ambient-shadow border border-white/10 group">
              <div className="relative aspect-[2/3]">
                <div className="w-full h-full bg-surface-variant" />
                {anime.rating && (
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                    <span className="text-accent-gold text-sm">★</span>
                    <span className="font-mono text-label-sm text-white">{anime.rating}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 pb-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {anime.genres?.map((g) => (
                  <span key={g} className="bg-surface-bright/80 backdrop-blur-md px-3 py-1 rounded-full font-mono text-label-sm text-on-surface-variant border border-white/5">{g}</span>
                ))}
                {anime.format && (
                  <span className="bg-accent-violet/20 px-3 py-1 rounded-full font-mono text-label-sm text-accent-violet border border-accent-violet/30">{anime.format}</span>
                )}
              </div>
              <h2 className="font-display text-display-xl text-white mb-2 leading-tight">
                {anime.title}{' '}
                <span className="gradient-text">✦</span>
              </h2>
              <p className="font-body text-body-lg text-on-surface-variant max-w-3xl mb-8 line-clamp-3">
                {anime.description || 'No description available.'}
              </p>
              <div className="flex items-center gap-4">
                <Link
                  href={episodes.length > 0 ? `/player/${anime.id}/${episodes[0].id}` : '#'}
                  className="bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-display text-metadata font-bold px-8 py-4 rounded-xl flex items-center gap-3 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all hover:-translate-y-1"
                >
                  <span>▶</span> Play {episodes.length > 0 ? `Episode 1` : ''}
                </Link>
                <button className="glass-panel text-on-surface font-display text-metadata font-bold px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors">
                  <span>+</span> Add to Watchlist
                </button>
                <div className="ml-4 flex items-center gap-4 text-on-surface-variant font-body text-metadata">
                  {anime.studio && (
                    <>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider opacity-70">Studio</span>
                        <span className="text-on-surface">{anime.studio}</span>
                      </div>
                      <div className="h-8 w-px bg-white/10" />
                    </>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider opacity-70">Status</span>
                    <span className="text-accent-cyan">{anime.status || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="px-[40px] max-w-7xl mx-auto mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex justify-between items-end mb-6">
                <h3 className="font-display text-headline-md text-white">Episodes</h3>
              </div>
              {episodes.length === 0 ? (
                <div className="glass-panel rounded-xl p-8 text-center">
                  <p className="text-on-surface-variant font-body text-body-md">No episodes available yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {episodes.map((ep, idx) => (
                    <Link
                      key={ep.id}
                      href={`/player/${anime.id}/${ep.id}`}
                      className={`glass-panel rounded-xl p-4 flex gap-6 hover:bg-surface-bright/50 transition-colors cursor-pointer group relative overflow-hidden ${idx === 0 ? 'border-l-4 border-l-accent-cyan' : ''}`}
                    >
                      {(ep.progress || idx === 0) && (
                        <div className="absolute bottom-0 left-0 h-1 bg-surface-bright w-full" />
                      )}
                      {(ep.progress || idx === 0) && (
                        <div
                          className="absolute bottom-0 left-0 h-1 bg-accent-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                          style={{ width: `${ep.progress || 75}%` }}
                        />
                      )}
                      <div className="w-48 aspect-video rounded-lg overflow-hidden relative shrink-0">
                        <div className="w-full h-full bg-surface-variant group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
                            <span className="text-[28px]">▶</span>
                          </div>
                        </div>
                        {ep.isNew && (
                          <div className="absolute top-2 right-2 bg-accent-magenta px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">New</div>
                        )}
                      </div>
                      <div className="flex-1 py-1">
                        <div className="flex justify-between items-start mb-1">
                          <div className={`font-mono text-label-sm ${idx === 0 ? 'text-accent-cyan' : 'text-on-surface-variant'} mb-1`}>
                            Episode {ep.number}
                          </div>
                          {ep.duration && (
                            <span className="font-body text-[12px] text-on-surface-variant">
                              {ep.progress ? `${Math.floor(((100 - ep.progress) / 100) * (ep.duration / 60))}m left` : `${Math.floor(ep.duration / 60)}m`}
                            </span>
                          )}
                        </div>
                        <h4 className="font-display text-[18px] text-white mb-2 group-hover:text-accent-cyan transition-colors">{ep.title}</h4>
                        {ep.description && (
                          <p className="font-body text-[14px] text-on-surface-variant line-clamp-2">{ep.description}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
          <div className="space-y-8">
            <div className="glass-panel rounded-xl p-6">
              <h4 className="font-mono text-label-sm text-on-surface-variant mb-4 uppercase tracking-widest border-b border-white/5 pb-2">Information</h4>
              <dl className="space-y-3 font-body text-[14px]">
                {[
                  { label: 'Format', value: anime.format || '—' },
                  { label: 'Episodes', value: String(anime.episodes || '—') },
                  { label: 'Status', value: anime.status || '—', accent: true },
                  { label: 'Season', value: anime.season || '—' },
                  { label: 'Studio', value: anime.studio || '—' },
                  { label: 'Source', value: anime.source || '—' },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between">
                    <dt className="text-on-surface-variant">{item.label}</dt>
                    <dd className={item.accent ? 'text-accent-cyan text-right' : 'text-white text-right'}>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div>
              <h4 className="font-display text-[20px] text-white mb-4">Main Cast</h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'Elara Vance', va: 'Saori Hayami' },
                  { name: 'Kael Thorne', va: 'Yuichi Nakamura' },
                ].map((char) => (
                  <div key={char.name} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer border border-white/5 card-hover">
                    <div className="w-full h-full bg-surface-variant" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent flex flex-col justify-end p-3 opacity-90 group-hover:opacity-100 transition-opacity">
                      <div className="font-display text-[14px] text-white leading-tight">{char.name}</div>
                      <div className="font-body text-[10px] text-on-surface-variant mt-1">VA: {char.va}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
