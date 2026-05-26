'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Home', href: '/', icon: '◉' },
  { label: 'Watchlist', href: '/watchlist', icon: '▣' },
  { label: 'Library', href: '/library', icon: '◻' },
  { label: 'Community', href: '/social', icon: '◆' },
  { label: 'Plugins', href: '/plugins', icon: '⚙' },
  { label: 'Settings', href: '/settings', icon: '⚡' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col h-full fixed left-0 top-0 w-[260px] border-r border-white/5 bg-surface-container-low/80 backdrop-blur-xl shadow-2xl z-50 p-4 gap-2">
      <div className="mb-8 px-4 mt-2">
        <h1 className="font-display text-headline-md font-bold text-accent-violet">AniTech OS</h1>
        <p className="font-body text-metadata text-on-surface-variant">Open-Source Media Platform</p>
      </div>
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 py-3 px-4 rounded-lg font-mono text-label-sm tracking-wider transition-all duration-200 ${
                isActive
                  ? 'text-accent-violet font-bold bg-surface-variant/30 scale-105'
                  : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-2 border-t border-white/5 pt-4">
        <Link
          href="/social"
          className="w-full py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-mono text-label-sm rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all text-center"
        >
          Join Community
        </Link>
        <Link
          href="/settings"
          className="text-on-surface-variant flex items-center gap-3 py-3 px-4 rounded-lg font-mono text-label-sm tracking-wider hover:bg-surface-variant/50 hover:text-on-surface transition-all duration-300"
        >
          <span className="text-lg">❓</span>
          Support
        </Link>
      </div>
    </aside>
  );
}
