'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { apiClient } from '@/lib/api';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage?: string;
  category: string;
  publishedAt: string;
  author?: {
    displayName: string;
    avatarUrl?: string;
    username: string;
  };
}

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.slug) return;
    apiClient.get<{ data: NewsArticle }>(`/news/${params.slug}`)
      .then((res) => setArticle(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[260px] pt-16">
          <div className="h-[400px] bg-surface-container-highest animate-pulse" />
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
            <div className="h-10 bg-surface-variant rounded w-3/4" />
            <div className="h-4 bg-surface-variant rounded w-1/4" />
            <div className="space-y-4 pt-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-4 bg-surface-variant rounded w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[260px] pt-16 flex items-center justify-center">
          <div className="text-center">
            <p className="text-error font-body text-body-lg mb-4">{error || 'Article not found'}</p>
            <Link href="/news" className="px-6 py-2 bg-accent-magenta/20 text-accent-magenta rounded-lg font-body text-metadata">Back to News</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[260px] pt-16 min-h-screen">
        <TopBar />
        <article>
          <header className="relative w-full h-[500px] flex items-end">
            <div className="absolute inset-0 z-0">
              <div className="w-full h-full bg-surface-container-highest" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>
            <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12 w-full">
              <Link href="/news" className="inline-flex items-center gap-2 text-accent-magenta font-mono text-label-sm mb-6 hover:gap-4 transition-all">
                <span>&larr;</span> BACK TO NEWS
              </Link>
              <div className="mb-4">
                <span className="bg-accent-magenta/20 text-accent-magenta px-3 py-1 rounded-full font-mono text-[10px] border border-accent-magenta/30 uppercase tracking-widest">
                  {article.category}
                </span>
              </div>
              <h1 className="font-display text-display-lg text-white mb-6 leading-tight">
                {article.title}
              </h1>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-surface-variant overflow-hidden border border-white/10">
                  {article.author?.avatarUrl && <img src={article.author.avatarUrl} alt="" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <div className="text-white font-body font-bold">{article.author?.displayName || 'AniTech Staff'}</div>
                  <div className="text-on-surface-variant font-body text-metadata">
                    Published on {new Date(article.publishedAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-4xl mx-auto px-6 py-12">
            <div 
              className="prose prose-invert prose-magenta max-w-none font-body text-body-lg text-on-surface-variant leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            <footer className="mt-16 pt-8 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-2">
                {['Anime', 'Community', 'Update'].map(tag => (
                  <span key={tag} className="px-3 py-1 bg-surface-container rounded-lg text-metadata text-on-surface-variant">#{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-metadata text-on-surface-variant">Share this article:</span>
                <div className="flex gap-2">
                  {['Twitter', 'Reddit', 'Copy'].map(platform => (
                    <button key={platform} className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors border border-white/5">
                      <span className="text-xs">{platform[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </footer>
          </div>
        </article>
      </main>
    </div>
  );
}
