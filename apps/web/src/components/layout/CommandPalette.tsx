'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: string;
  action: () => void;
}

interface SearchSuggestion {
  id: string;
  label: string;
  description?: string;
  icon?: string;
}

const pageItems: CommandItem[] = [
  { id: 'home', label: 'Home', description: 'Go to homepage', icon: '◉', action: () => {} },
  { id: 'watchlist', label: 'Watchlist', description: 'View your anime watchlist', icon: '▣', action: () => {} },
  { id: 'library', label: 'Library', description: 'Browse your library', icon: '◻', action: () => {} },
  { id: 'social', label: 'Community', description: 'Friend activity and watch parties', icon: '◆', action: () => {} },
  { id: 'plugins', label: 'Plugins', description: 'Manage extensions', icon: '⚙', action: () => {} },
  { id: 'settings', label: 'Settings', description: 'Configure preferences', icon: '⚡', action: () => {} },
];

const actionItems: CommandItem[] = [
  { id: 'search-anime', label: 'Search Anime', description: 'Search for anime titles', icon: '⌕', action: () => {} },
  { id: 'create-party', label: 'Create Watch Party', description: 'Start a watch party with friends', icon: '▶', action: () => {} },
  { id: 'browse-seasonal', label: 'Browse Seasonal', description: 'Explore current season anime', icon: '◉', action: () => {} },
];

const quickLinks: CommandItem[] = [
  { id: 'continue-watching', label: 'Continue Watching', description: 'Ctrl+Shift+C', icon: '▶', action: () => {} },
  { id: 'toggle-theme', label: 'Toggle Theme', description: 'Ctrl+Shift+T', icon: '◉', action: () => {} },
  { id: 'search', label: 'Quick Search', description: 'Ctrl+K', icon: '⌕', action: () => {} },
];

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return { isOpen, open, close, toggle };
}

export function CommandPalette() {
  const router = useRouter();
  const { isOpen, close, toggle } = useCommandPalette();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const allItems = [
    ...(query.trim()
      ? suggestions.map(
          (s): CommandItem => ({
            id: `suggestion-${s.id}`,
            label: s.label,
            description: s.description,
            icon: s.icon || '⌕',
            action: () => {
              close();
              router.push(`/search?q=${encodeURIComponent(s.label)}`);
            },
          })
        )
      : []),
    ...(query.trim()
      ? []
      : [
          { section: 'Pages' as const, items: pageItems },
          { section: 'Actions' as const, items: actionItems },
          { section: 'Quick Links' as const, items: quickLinks },
        ]
    ),
  ];

  const flatItems: { item: CommandItem; section?: string }[] = Array.isArray(allItems) && 'section' in (allItems[0] || {})
    ? (allItems as { section: string; items: CommandItem[] }[]).flatMap((group) =>
        group.items.map((item) => ({ item, section: group.section }))
      )
    : (allItems as CommandItem[]).map((item) => ({ item }));

  // Reset index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSuggestions([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      apiClient
        .get<{ results: SearchSuggestion[] }>('/search/suggestions', { q: query })
        .then((res) => setSuggestions(res.results || []))
        .catch(() => setSuggestions([]))
        .finally(() => setLoadingSuggestions(false));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Bind page actions
  pageItems.forEach((item) => {
    item.action = () => {
      close();
      router.push(`/${item.id === 'home' ? '' : item.id}`);
    };
  });

  actionItems.forEach((item) => {
    item.action = () => {
      close();
      if (item.id === 'search-anime') router.push('/search');
      else if (item.id === 'create-party') router.push('/social');
      else if (item.id === 'browse-seasonal') router.push('/?seasonal=true');
    };
  });

  quickLinks.forEach((item) => {
    item.action = () => {
      close();
      if (item.id === 'continue-watching') router.push('/watchlist');
      else if (item.id === 'toggle-theme') {
        document.documentElement.classList.toggle('dark');
      } else if (item.id === 'search') {
        // already in command palette
      }
    };
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(flatItems.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + Math.max(flatItems.length, 1)) % Math.max(flatItems.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[activeIndex]) {
        flatItems[activeIndex].item.action();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={close}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[580px] bg-surface-container-low/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
          <span className="text-on-surface-variant text-lg">⌕</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search anything..."
            className="flex-1 bg-transparent border-none outline-none font-body text-body-lg text-on-surface placeholder-on-surface-variant/50"
          />
          <kbd className="hidden sm:inline-flex px-2 py-0.5 bg-surface-variant/50 rounded font-mono text-label-sm text-on-surface-variant border border-white/5">
            ESC
          </kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
          {loadingSuggestions && query.trim() && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingSuggestions && flatItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-3xl text-on-surface-variant mb-3">⌕</span>
              <p className="font-body text-body-md text-on-surface-variant">No results found</p>
              <p className="font-mono text-label-sm text-on-surface-variant mt-1">Try a different search term</p>
            </div>
          )}

          {flatItems.length > 0 && (
            <div>
              {(() => {
                let lastSection: string | undefined;
                return flatItems.map((entry, idx) => {
                  const showSection = entry.section && entry.section !== lastSection;
                  lastSection = entry.section;
                  return (
                    <div key={`${entry.item.id}-${idx}`}>
                      {showSection && (
                        <div className="px-3 pt-3 pb-1">
                          <span className="font-mono text-label-sm text-on-surface-variant font-bold uppercase tracking-widest">
                            {entry.section}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={entry.item.action}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          idx === activeIndex
                            ? 'bg-accent-violet/15 text-accent-violet border border-accent-violet/20'
                            : 'text-on-surface hover:bg-white/5'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${
                          idx === activeIndex ? 'bg-accent-violet/20' : 'bg-surface-container-high'
                        }`}>
                          {entry.item.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-metadata font-medium truncate">{entry.item.label}</p>
                          {entry.item.description && (
                            <p className="font-mono text-label-sm text-on-surface-variant truncate mt-0.5">
                              {entry.item.description}
                            </p>
                          )}
                        </div>
                        {idx === activeIndex && (
                          <span className="font-mono text-label-sm text-accent-violet shrink-0">
                            ↵
                          </span>
                        )}
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 px-5 py-3 border-t border-white/5 bg-surface-container-lowest/50">
          <div className="flex items-center gap-2 font-mono text-label-sm text-on-surface-variant">
            <kbd className="px-1.5 py-0.5 bg-surface-variant rounded text-[10px] border border-white/5">↑↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-label-sm text-on-surface-variant">
            <kbd className="px-1.5 py-0.5 bg-surface-variant rounded text-[10px] border border-white/5">↵</kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-label-sm text-on-surface-variant">
            <kbd className="px-1.5 py-0.5 bg-surface-variant rounded text-[10px] border border-white/5">Esc</kbd>
            <span>Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
