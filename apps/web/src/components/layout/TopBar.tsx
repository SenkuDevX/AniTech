'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/auth';

const navLinks = [
  { label: 'Simulcasts', href: '#' },
  { label: 'Movies', href: '#' },
  { label: 'Trending', href: '#' },
];

export default function TopBar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <header className="fixed top-0 right-0 w-full md:w-[calc(100%-260px)] lg:w-[calc(100%-260px-300px)] h-16 bg-surface/40 backdrop-blur-md border-b border-white/5 z-40 flex justify-between items-center px-[40px]">
      <div className="flex items-center gap-6">
        <div className="relative group hidden sm:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-accent-cyan transition-colors text-sm">⌕</span>
          <input
            className="bg-surface-variant/30 border border-white/5 rounded-full py-1.5 pl-10 pr-4 font-body text-metadata text-on-surface focus:outline-none focus:border-accent-cyan/50 focus:bg-surface-variant/50 transition-all w-64 placeholder-on-surface-variant/50"
            placeholder="Search anime, genres..."
            type="text"
          />
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-6 font-body text-metadata h-full">
        {navLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-on-surface-variant hover:text-primary transition-colors h-full flex items-center"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <button className="hidden sm:flex text-on-surface hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant/50">
          <span className="text-lg">🔔</span>
        </button>
        {loading ? (
          <div className="h-8 w-8 rounded-full bg-surface-variant animate-pulse" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-surface-variant overflow-hidden border border-white/10 cursor-pointer hover:border-accent-violet transition-colors">
              {user.avatarUrl ? (
                <img alt={user.username} className="w-full h-full object-cover" src={user.avatarUrl} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-on-surface-variant">
                  {user.username[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={logout}
              className="hidden sm:block font-body text-metadata text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors font-body text-metadata text-on-surface"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-body text-metadata hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
