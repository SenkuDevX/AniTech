'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';
import type { Anime } from '@/types/design';

export default function MangaPage() {
  const [items, setItems] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<{ results: Anime[]; total: number; page: number; perPage: number }>('/anime', { format: 'MANGA' })
      .then((res) => setItems(res.results || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[260px] pt-16 min-h-screen relative">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-violet via-transparent to-transparent" />
        <div className="px-[40px] py-8 max-w-[1800px] mx-auto relative z-10">
          <header className="mb-10">
            <h2 className="font-display text-display-xl text-on-surface mb-2">Manga Library</h2>
            <p className="font-body text-body-md text-on-surface-variant">Browse and discover manga titles.</p>
          </header>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-surface-container-high rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-error font-body text-body-lg">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg font-body text-metadata">Retry</button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="glass-panel rounded-xl p-12 text-center">
              <p className="text-on-surface-variant font-body text-body-lg mb-4">No manga titles found</p>
              <Link href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-lg font-body text-metadata">
                Browse Anime
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/anime/${item.id}`}
                  className="group relative rounded-xl overflow-hidden bg-surface-container anime-card-hover border border-white/5"
                >
                  <div className="aspect-[2/3] w-full bg-surface-variant relative overflow-hidden">
                    <div className="w-full h-full bg-surface-variant" />
                    <div className="absolute top-2 left-2 z-20">
                      <span className="bg-surface-container-lowest/80 backdrop-blur-sm font-mono text-label-sm px-2 py-1 rounded border text-accent-cyan border-accent-cyan/20">
                        {item.format || 'MANGA'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-surface-container relative z-20">
                    <h5 className="font-body font-bold text-on-surface truncate mb-1">{item.title}</h5>
                    <div className="flex justify-between items-center font-body text-metadata text-on-surface-variant">
                      <span>{item.episodes ? `${item.episodes} Ch.` : 'Ongoing'}</span>
                      <span className="flex items-center gap-1">
                        <span className="text-accent-gold text-sm">★</span> {item.rating || '—'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
