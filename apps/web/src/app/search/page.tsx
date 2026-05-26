'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { apiClient } from '@/lib/api';

const FORMATS = ['TV', 'MOVIE', 'OVA', 'ONA', 'SPECIAL', 'MUSIC'] as const;
const STATUSES = ['RELEASING', 'FINISHED', 'NOT_YET_RELEASED', 'CANCELLED', 'HIATUS'] as const;
const SEASONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'] as const;
const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'score', label: 'Score' },
  { value: 'title', label: 'Title' },
  { value: 'latest', label: 'Latest' },
] as const;
const MOODS = [
  { value: 'dark', label: 'Dark', icon: '🌑' },
  { value: 'chill', label: 'Chill', icon: '🍃' },
  { value: 'hype', label: 'Hype', icon: '🔥' },
  { value: 'sad', label: 'Sad', icon: '💧' },
  { value: 'romantic', label: 'Romantic', icon: '💕' },
  { value: 'funny', label: 'Funny', icon: '😂' },
  { value: 'epic', label: 'Epic', icon: '⚔' },
  { value: 'mysterious', label: 'Mysterious', icon: '🔮' },
  { value: 'relaxing', label: 'Relaxing', icon: '🌊' },
  { value: 'intense', label: 'Intense', icon: '💥' },
] as const;

interface SearchResult {
  id: string;
  title: string;
  posterUrl?: string;
  format?: string;
  rating?: number;
  score?: number;
  genres?: string[];
  episodes?: number;
  status?: string;
  season?: string;
  year?: number;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  perPage: number;
}

interface Filters {
  format: string;
  status: string;
  season: string;
  yearFrom: string;
  yearTo: string;
  sort: string;
  moods: string[];
}

const defaultFilters: Filters = {
  format: '',
  status: '',
  season: '',
  yearFrom: '',
  yearTo: '',
  sort: 'popularity',
  moods: [],
};

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    Promise.all([
      apiClient.post<{ results: string[] }>('/search/recent').catch(() => ({ results: [] })),
      apiClient.get<{ results: string[] }>('/search/popular').catch(() => ({ results: [] })),
    ])
      .then(([recent, popular]) => {
        setRecentSearches(recent.results || []);
        setPopularSearches(popular.results || []);
      })
      .finally(() => setInitialLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node) && inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    debounceRef.current = setTimeout(() => {
      apiClient.get<string[]>('/search/suggestions', { q })
        .then((data) => {
          setSuggestions(Array.isArray(data) ? data : []);
          setShowSuggestions(true);
        })
        .catch(() => {
          setSuggestions([]);
        })
        .finally(() => setLoadingSuggestions(false));
    }, 250);
  }, []);

  const doSearch = useCallback(async (q: string, p: number, f: Filters) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setShowSuggestions(false);
    try {
      const params: Record<string, string | number | undefined> = { q, page: p, perPage };
      if (f.format) params.format = f.format;
      if (f.status) params.status = f.status;
      if (f.season) params.season = f.season;
      if (f.yearFrom) params.yearFrom = f.yearFrom;
      if (f.yearTo) params.yearTo = f.yearTo;
      if (f.sort) params.sort = f.sort;
      if (f.moods.length) params.mood = f.moods.join(',');
      const res = await apiClient.get<SearchResponse>('/search', params);
      setResults(res.results || []);
      setTotal(res.total || 0);
      setPage(res.page || 1);
    } catch (err: any) {
      setError(err.message || 'Search failed');
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setPage(1);
    doSearch(query, 1, filters);
  };

  const handleSuggestionClick = (s: string) => {
    setQuery(s);
    setPage(1);
    doSearch(s, 1, filters);
  };

  const handleFilterChange = (key: keyof Filters, value: string | string[]) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    if (hasSearched && query.trim()) {
      setPage(1);
      doSearch(query, 1, updated);
    }
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    if (hasSearched && query.trim()) {
      setPage(1);
      doSearch(query, 1, defaultFilters);
    }
  };

  const toggleMood = (mood: string) => {
    const moods = filters.moods.includes(mood)
      ? filters.moods.filter((m) => m !== mood)
      : [...filters.moods, mood];
    handleFilterChange('moods', moods);
  };

  const totalPages = Math.ceil(total / perPage);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const hasActiveFilters = Object.values(filters).some((v) => v && (typeof v !== 'object' || v.length > 0));

  const filteredCount = filters.moods.filter((m) => MOODS.some((mo) => mo.value === m)).length;

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[260px] pt-16 min-h-screen">
        <TopBar />
        <div className="px-[40px] py-8 max-w-[1800px] mx-auto">
          <div className="mb-6">
            <h1 className="font-display text-display-xl text-on-surface mb-2">Search</h1>
            <p className="font-body text-body-md text-on-surface-variant">Discover anime across every genre, season, and mood.</p>
          </div>

          <form onSubmit={handleSubmit} className="relative mb-8" ref={suggestRef}>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl z-10">⌕</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); fetchSuggestions(e.target.value); }}
                  onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
                  placeholder="Search anime, genres, studios..."
                  className="w-full bg-surface-container/50 border border-white/10 rounded-2xl py-4 pl-14 pr-12 text-on-surface font-body text-body-md focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/30 transition-all backdrop-blur-md"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => { setQuery(''); setSuggestions([]); setShowSuggestions(false); }}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-body text-metadata font-bold px-8 py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all flex items-center gap-2 shrink-0"
              >
                <span>⌕</span>
                <span className="hidden sm:inline">Search</span>
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-4 rounded-2xl font-body text-metadata transition-all border shrink-0 ${
                  hasActiveFilters
                    ? 'bg-accent-violet/20 text-accent-violet border-accent-violet/30'
                    : 'bg-surface-container/50 text-on-surface-variant border-white/10 hover:bg-surface-container'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>⚙</span>
                  <span className="hidden sm:inline">Filters</span>
                  {filteredCount > 0 && (
                    <span className="bg-accent-violet text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-mono">
                      {filteredCount}
                    </span>
                  )}
                </span>
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-[200px] mt-2 z-50 glass-panel-strong rounded-xl border border-white/10 shadow-ambient overflow-hidden animate-fade-in">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full text-left px-5 py-3 font-body text-metadata text-on-surface hover:bg-surface-variant/50 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
                  >
                    <span className="text-on-surface-variant">⌕</span>
                    <span className="truncate">{s}</span>
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="flex gap-6">
            {showFilters && (
              <aside className="w-full md:w-72 shrink-0 animate-slide-up">
                <div className="glass-panel-strong rounded-2xl p-6 sticky top-24 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-headline-md text-on-surface">Filters</h3>
                    {hasActiveFilters && (
                      <button onClick={clearFilters} className="font-mono text-label-sm text-accent-cyan hover:text-accent-cyan/80 transition-colors">
                        Clear
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider block mb-3">Format</label>
                    <div className="flex flex-wrap gap-2">
                      {FORMATS.map((f) => (
                        <button
                          key={f}
                          onClick={() => handleFilterChange('format', filters.format === f ? '' : f)}
                          className={`px-3 py-1.5 rounded-lg font-body text-metadata border transition-colors ${
                            filters.format === f
                              ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30'
                              : 'bg-surface-container text-on-surface-variant border-white/5 hover:bg-surface-container-high'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider block mb-3">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleFilterChange('status', filters.status === s ? '' : s)}
                          className={`px-3 py-1.5 rounded-lg font-body text-metadata border transition-colors ${
                            filters.status === s
                              ? 'bg-accent-violet/20 text-accent-violet border-accent-violet/30'
                              : 'bg-surface-container text-on-surface-variant border-white/5 hover:bg-surface-container-high'
                          }`}
                        >
                          {s === 'NOT_YET_RELEASED' ? 'Upcoming' : s === 'RELEASING' ? 'Airing' : s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider block mb-3">Season</label>
                    <div className="flex flex-wrap gap-2">
                      {SEASONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleFilterChange('season', filters.season === s ? '' : s)}
                          className={`px-3 py-1.5 rounded-lg font-body text-metadata border transition-colors ${
                            filters.season === s
                              ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30'
                              : 'bg-surface-container text-on-surface-variant border-white/5 hover:bg-surface-container-high'
                          }`}
                        >
                          {s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider block mb-3">Year Range</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="number"
                        placeholder="From"
                        value={filters.yearFrom}
                        onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
                        className="w-full bg-surface-container border border-white/10 rounded-lg px-3 py-2 font-body text-metadata text-on-surface focus:outline-none focus:border-accent-cyan/50 transition-colors placeholder-on-surface-variant/50"
                      />
                      <span className="text-on-surface-variant font-body text-metadata">—</span>
                      <input
                        type="number"
                        placeholder="To"
                        value={filters.yearTo}
                        onChange={(e) => handleFilterChange('yearTo', e.target.value)}
                        className="w-full bg-surface-container border border-white/10 rounded-lg px-3 py-2 font-body text-metadata text-on-surface focus:outline-none focus:border-accent-cyan/50 transition-colors placeholder-on-surface-variant/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider block mb-3">Sort</label>
                    <div className="flex flex-wrap gap-2">
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleFilterChange('sort', filters.sort === opt.value ? defaultFilters.sort : opt.value)}
                          className={`px-3 py-1.5 rounded-lg font-body text-metadata border transition-colors ${
                            filters.sort === opt.value
                              ? 'bg-accent-violet/20 text-accent-violet border-accent-violet/30'
                              : 'bg-surface-container text-on-surface-variant border-white/5 hover:bg-surface-container-high'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider block mb-3">Mood</label>
                    <div className="flex flex-wrap gap-2">
                      {MOODS.map((m) => (
                        <button
                          key={m.value}
                          onClick={() => toggleMood(m.value)}
                          className={`px-3 py-1.5 rounded-lg font-body text-metadata border transition-colors flex items-center gap-1.5 ${
                            filters.moods.includes(m.value)
                              ? 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30'
                              : 'bg-surface-container text-on-surface-variant border-white/5 hover:bg-surface-container-high'
                          }`}
                        >
                          <span>{m.icon}</span>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>
            )}

            <div className="flex-1 min-w-0">
              {initialLoading ? (
                <div className="space-y-6">
                  <div className="h-5 bg-surface-container-high rounded w-48 animate-pulse" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] bg-surface-container-high rounded-xl mb-3" />
                        <div className="h-4 bg-surface-container-high rounded w-3/4 mb-2" />
                        <div className="h-3 bg-surface-container-high rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : !hasSearched && !loading ? (
                <div className="space-y-10">
                  {recentSearches.length > 0 && (
                    <section>
                      <h3 className="font-display text-headline-md text-on-surface mb-4 flex items-center gap-2">
                        <span className="text-accent-cyan">🕐</span>
                        Recent Searches
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => { setQuery(s); setPage(1); doSearch(s, 1, filters); }}
                            className="px-4 py-2 rounded-full bg-surface-container border border-white/5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-body text-metadata"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {popularSearches.length > 0 && (
                    <section>
                      <h3 className="font-display text-headline-md text-on-surface mb-4 flex items-center gap-2">
                        <span className="text-accent-violet">🔥</span>
                        Popular Searches
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => { setQuery(s); setPage(1); doSearch(s, 1, filters); }}
                            className="px-4 py-2 rounded-full bg-surface-container border border-white/5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors font-body text-metadata"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {recentSearches.length === 0 && popularSearches.length === 0 && (
                    <div className="glass-panel rounded-2xl p-16 text-center">
                      <div className="text-5xl mb-4 opacity-40">⌕</div>
                      <h3 className="font-display text-headline-lg text-on-surface mb-2">Discover Anime</h3>
                      <p className="font-body text-body-md text-on-surface-variant max-w-md mx-auto">
                        Search for your favorite anime, explore by genre, or filter by mood to find something new.
                      </p>
                    </div>
                  )}
                </div>
              ) : loading ? (
                <div className="space-y-6">
                  <div className="h-5 bg-surface-container-high rounded w-48 animate-pulse" />
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] bg-surface-container-high rounded-xl mb-3" />
                        <div className="h-4 bg-surface-container-high rounded w-3/4 mb-2" />
                        <div className="h-3 bg-surface-container-high rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <p className="text-error font-body text-body-lg mb-2">{error}</p>
                    <button
                      onClick={() => { if (query.trim()) doSearch(query, 1, filters); }}
                      className="mt-2 px-6 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg font-body text-metadata hover:bg-accent-cyan/30 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : results.length === 0 ? (
                <div className="glass-panel rounded-2xl p-16 text-center">
                  <div className="text-5xl mb-4 opacity-40">🔍</div>
                  <h3 className="font-display text-headline-lg text-on-surface mb-2">No Results Found</h3>
                  <p className="font-body text-body-md text-on-surface-variant max-w-md mx-auto mb-6">
                    We could not find any anime matching your search. Try different keywords or adjust your filters.
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white rounded-xl font-body text-metadata hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="font-body text-metadata text-on-surface-variant">
                      <span className="text-on-surface font-bold">{total.toLocaleString()}</span> results for <span className="text-accent-cyan font-bold">&quot;{query}&quot;</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {results.map((anime) => (
                      <Link
                        key={anime.id}
                        href={`/anime/${anime.id}`}
                        className="group relative rounded-xl overflow-hidden bg-surface-container border border-white/5 anime-card-hover"
                      >
                        <div className="aspect-[2/3] w-full bg-surface-variant relative overflow-hidden">
                          <div className="w-full h-full bg-surface-variant" />
                          <div className="absolute top-2 left-2 z-20 flex gap-1.5 flex-wrap">
                            {anime.format && (
                              <span className="bg-accent-violet/80 backdrop-blur-sm font-mono text-label-sm px-2 py-0.5 rounded border border-accent-violet/30 text-white">
                                {anime.format}
                              </span>
                            )}
                            {anime.episodes && (
                              <span className="bg-surface-container-lowest/80 backdrop-blur-sm font-mono text-label-sm px-2 py-0.5 rounded border border-white/10 text-on-surface-variant">
                                {anime.episodes} eps
                              </span>
                            )}
                          </div>
                          {(anime.rating || anime.score) && (
                            <div className="absolute bottom-2 right-2 z-20 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                              <span className="text-accent-gold text-sm">★</span>
                              <span className="font-mono text-label-sm text-white">{anime.rating || anime.score}</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <h5 className="font-body font-bold text-on-surface truncate leading-tight mb-1 group-hover:text-accent-cyan transition-colors">
                            {anime.title}
                          </h5>
                          <div className="flex items-center gap-2 font-body text-metadata text-on-surface-variant mb-2">
                            {anime.season && anime.year && (
                              <span>{anime.season.charAt(0) + anime.season.slice(1).toLowerCase()} {anime.year}</span>
                            )}
                            {anime.status && !anime.season && (
                              <span>{anime.status === 'RELEASING' ? 'Airing' : anime.status === 'FINISHED' ? 'Finished' : anime.status}</span>
                            )}
                          </div>
                          {anime.genres && anime.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {anime.genres.slice(0, 3).map((g) => (
                                <span key={g} className="bg-surface-container-high px-2 py-0.5 rounded font-mono text-[10px] text-on-surface-variant border border-white/5">
                                  {g}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10 mb-8">
                      <button
                        onClick={() => doSearch(query, page - 1, filters)}
                        disabled={page <= 1}
                        className="px-4 py-2 rounded-lg font-body text-metadata border border-white/10 bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        ← Prev
                      </button>
                      <div className="flex gap-1">
                        {getPageNumbers().map((p, i) =>
                          typeof p === 'string' ? (
                            <span key={`ellipsis-${i}`} className="px-3 py-2 font-body text-metadata text-on-surface-variant">...</span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => doSearch(query, p, filters)}
                              className={`w-10 h-10 rounded-lg font-body text-metadata transition-colors ${
                                p === page
                                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30'
                                  : 'bg-surface-container text-on-surface-variant border border-white/5 hover:bg-surface-container-high hover:text-on-surface'
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                      </div>
                      <button
                        onClick={() => doSearch(query, page + 1, filters)}
                        disabled={page >= totalPages}
                        className="px-4 py-2 rounded-lg font-body text-metadata border border-white/10 bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
