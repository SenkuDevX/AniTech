export const colors = {
  surface: '#081425',
  'surface-container-lowest': '#040e1f',
  'surface-container-low': '#111c2d',
  'surface-container': '#152031',
  'surface-container-high': '#1f2a3c',
  'surface-container-highest': '#2a3548',
  'surface-bright': '#2f3a4c',
  'surface-variant': '#2a3548',
  'on-surface': '#d8e3fb',
  'on-surface-variant': '#c6c6cd',
  background: '#081425',
  'on-background': '#d8e3fb',
  'accent-cyan': '#22D3EE',
  'accent-violet': '#A78BFA',
  'accent-magenta': '#D946EF',
  'accent-gold': '#FDE68A',
  'accent-blue': '#3B82F6',
  primary: '#bec6e0',
  secondary: '#b9c7e0',
  tertiary: '#2fd9f4',
  error: '#ffb4ab',
  'error-container': '#93000a',
  'muted-charcoal': '#0F172A',
  'deep-indigo': '#312E81',
} as const;

export const fonts = {
  display: ['Sora', 'sans-serif'],
  body: ['Hanken Grotesk', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
} as const;

export const spacing = {
  sidebar: '260px',
  'sidebar-collapsed': '80px',
  content: '40px',
  gutter: '24px',
  grid: '8px',
} as const;

export const borderRadius = {
  sm: '0.25rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
} as const;

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
  isGuest: boolean;
}

export interface Anime {
  id: string;
  title: string;
  alternativeTitles?: string[];
  description?: string;
  posterUrl?: string;
  bannerUrl?: string;
  rating?: number;
  genres?: string[];
  format?: string;
  episodes?: number;
  status?: string;
  season?: string;
  studio?: string;
  source?: string;
  year?: number;
}

export interface Episode {
  id: string;
  animeId: string;
  number: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number;
  progress?: number;
  isNew?: boolean;
}

export interface WatchlistItem {
  id: string;
  animeId: string;
  anime: Anime;
  status: 'watching' | 'plan_to_watch' | 'completed' | 'dropped' | 'on_hold';
  progress: number;
  totalEpisodes: number;
  rating?: number;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  icon?: string;
  category: string;
  rating?: number;
  isInstalled: boolean;
  hasUpdate?: boolean;
  isNew?: boolean;
}
