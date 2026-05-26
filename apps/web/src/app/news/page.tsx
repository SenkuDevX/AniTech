'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { apiClient } from '@/lib/api';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category: string;
  publishedAt: string;
  author?: {
    displayName: string;
    avatarUrl?: string;
  };
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [trending, setTrending] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiClient.get<{ data: { results: NewsArticle[] } }>('/news', {
        category: activeCategory === 'ALL' ? undefined : activeCategory,
        limit: 12,
      }).catch(() => ({ data: { results: [] } })),
      apiClient.get<{ data: NewsArticle[] }>('/news/trending').catch(() => ({ data: [] })),
    ])
      .then(([newsRes, trendingRes]) => {
        setNews(newsRes.data?.results || []);
        setTrending(trendingRes.data || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const categories = [
    { id: 'ALL', label: 'All News' },
    { id: 'ANNOUNCEMENT', label: 'Announcements' },
    { id: 'RELEASE', label: 'Releases' },
    { id: 'FEATURE', label: 'Features' },
    { id: 'COMMUNITY', label: 'Community' },
  ];

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[260px] pt-16 min-h-screen relative">
        <TopBar />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-magenta via-transparent to-transparent" />
        
        <div className="px-[40px] py-8 max-w-[1800px] mx-auto relative z-10">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-display-xl text-on-surface mb-2 tracking-tight">Community News</h2>
              <p className="font-body text-body-md text-on-surface-variant">Stay updated with the latest in the anime world.</p>
            </div>
            <div className="flex gap-2 bg-surface-container/60 p-1.5 rounded-xl border border-white/5 backdrop-blur-md overflow-x-auto no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap font-body text-metadata transition-all ${
                    activeCategory === cat.id
                      ? 'bg-accent-magenta/20 text-accent-magenta border border-accent-magenta/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 space-y-8">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-[400px] bg-surface-container-high rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : error ? (
                <div className="glass-panel rounded-2xl p-12 text-center border-error/20">
                  <p className="text-error font-body text-body-lg mb-4">{error}</p>
                  <button onClick={() => window.location.reload()} className="px-6 py-2 bg-accent-magenta/20 text-accent-magenta rounded-lg font-body text-metadata">Retry</button>
                </div>
              ) : news.length === 0 ? (
                <div className="glass-panel rounded-2xl p-20 text-center border-white/5">
                  <div className="text-4xl mb-4 opacity-20">📰</div>
                  <p className="text-on-surface-variant font-body text-body-lg">No news articles found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {news.map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="group bg-surface-container/40 rounded-2xl overflow-hidden border border-white/5 hover:border-accent-magenta/30 transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col"
                    >
                      <div className="aspect-video relative overflow-hidden">
                        <div className="absolute inset-0 bg-surface-variant group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-4 left-4 z-20">
                          <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full font-mono text-[10px] text-accent-magenta border border-accent-magenta/30 uppercase tracking-widest">
                            {item.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-3 font-body text-metadata text-on-surface-variant">
                          <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                          <span className="opacity-30">•</span>
                          <span>{item.author?.displayName || 'AniTech Staff'}</span>
                        </div>
                        <h3 className="font-display text-headline-sm text-white mb-3 group-hover:text-accent-magenta transition-colors line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                        {item.excerpt && (
                          <p className="font-body text-body-sm text-on-surface-variant line-clamp-3 mb-6 flex-1">
                            {item.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-accent-magenta font-mono text-label-sm group-hover:gap-4 transition-all">
                          READ ARTICLE <span className="text-lg">→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-8">
              <section className="glass-panel rounded-2xl p-6 border-white/5">
                <h3 className="font-display text-headline-sm text-white mb-6 flex items-center gap-2">
                  <span className="text-accent-magenta">🔥</span> Trending
                </h3>
                <div className="space-y-6">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-16 h-16 bg-surface-variant rounded-lg animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-surface-variant rounded w-full" />
                          <div className="h-3 bg-surface-variant rounded w-2/3" />
                        </div>
                      </div>
                    ))
                  ) : trending.map((item, idx) => (
                    <Link key={item.id} href={`/news/${item.slug}`} className="flex gap-4 group">
                      <div className="font-display text-display-sm text-on-surface-variant opacity-20 group-hover:opacity-100 group-hover:text-accent-magenta transition-all">
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-body font-bold text-on-surface text-sm line-clamp-2 group-hover:text-accent-magenta transition-colors mb-1">
                          {item.title}
                        </h4>
                        <div className="font-body text-[10px] text-on-surface-variant uppercase tracking-wider">
                          {item.category} • {new Date(item.publishedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="bg-gradient-to-br from-accent-violet/20 to-accent-magenta/20 rounded-2xl p-8 border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-accent-magenta/20 blur-3xl rounded-full group-hover:bg-accent-magenta/40 transition-colors" />
                <h3 className="font-display text-headline-md text-white mb-4 relative z-10">Weekly Recap</h3>
                <p className="font-body text-body-sm text-on-surface-variant mb-6 relative z-10">
                  Get the most important anime news delivered to your notification center every Sunday.
                </p>
                <button className="w-full py-3 bg-white text-black font-display text-metadata font-bold rounded-xl hover:shadow-xl transition-all relative z-10">
                  Enable Updates
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
