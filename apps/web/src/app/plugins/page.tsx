'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';
import type { Plugin } from '@/types/design';

const categories = ['Discover', 'Installed', 'Themes', 'Playback', 'Social', 'Developer Tools', 'Integrations'];

const defaultPlugins: Plugin[] = [
  { id: '1', name: 'AniMotion Plus', description: 'Advanced easing curves and transition management for the core UI.', author: 'Studio TriggerUI', category: 'featured', rating: 4.9, isInstalled: false, version: '1.2.0' },
  { id: '2', name: 'Glassify Theme Pack', description: 'Overhauls the default UI with deeper blurs, enhanced vibrancy, and customizable accent colors.', author: 'Aesthetica', category: 'featured', isInstalled: true, version: '2.0.4' },
  { id: '3', name: 'Discord Rich Presence', description: 'Show what you\'re watching directly on your Discord profile with episode tracking.', author: 'Community', category: 'trending', isInstalled: false, isNew: false, version: '1.0.0' },
  { id: '4', name: 'MAL Sync Pro', description: 'Automatically update your MyAnimeList progress as you watch.', author: 'Community', category: 'trending', isInstalled: true, hasUpdate: true, version: '3.1.2' },
  { id: '5', name: 'AutoSubs AI', description: 'Real-time AI translation and subtitle generation for raw broadcasts.', author: 'AI Labs', category: 'trending', isInstalled: false, isNew: true, version: '0.9.5-beta' },
];

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [activeCategory, setActiveCategory] = useState('Discover');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<{ data: Plugin[] }>('/plugins')
      .then((res) => setPlugins(res.data || []))
      .catch(() => setPlugins(defaultPlugins))
      .finally(() => setLoading(false));
  }, []);

  const featured = plugins.filter((p) => p.category === 'featured').length > 0
    ? plugins.filter((p) => p.category === 'featured')
    : defaultPlugins.filter((p) => p.category === 'featured');

  const trending = plugins.filter((p) => p.category === 'trending').length > 0
    ? plugins.filter((p) => p.category === 'trending')
    : defaultPlugins.filter((p) => p.category === 'trending');

  return (
    <div className="flex h-screen overflow-hidden selection:bg-accent-violet selection:text-white">
      <Sidebar />
      <main className="ml-0 md:ml-[260px] flex-1 h-full overflow-y-auto px-[40px] py-8 relative">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-violet via-transparent to-transparent" />
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 relative z-10 gap-4">
          <div>
            <h1 className="font-display text-display-xl mb-2 gradient-text">Plugin Manager</h1>
            <p className="font-body text-body-lg text-on-surface-variant flex items-center gap-2 flex-wrap">
              Extend and customize your AniTech OS experience.
              <span className="inline-flex items-center gap-1 bg-surface-variant/50 px-3 py-1 rounded-full text-accent-cyan font-body text-metadata border border-accent-cyan/20">
                <span>🔒</span>
                System Integrity Confirmed
              </span>
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">⌕</span>
            <input
              className="w-full bg-surface-container/50 border border-white/10 rounded-full py-3 pl-12 pr-4 text-on-surface font-body text-metadata focus:outline-none focus:border-accent-violet focus:ring-1 focus:ring-accent-violet transition-all backdrop-blur-md"
              placeholder="Search extensions..."
              type="text"
            />
          </div>
        </header>

        {error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-error font-body text-body-lg">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3 space-y-12">
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2 rounded-full font-body text-metadata whitespace-nowrap transition-colors ${
                      activeCategory === cat
                        ? 'bg-surface-variant text-on-surface border border-white/10'
                        : 'bg-transparent text-on-surface-variant border border-transparent hover:bg-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {loading ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-48 bg-surface-container-high rounded-xl animate-pulse" />
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-36 bg-surface-container-high rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <section>
                    <h2 className="font-display text-headline-lg mb-6">Featured</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {featured.map((plugin) => (
                        <div key={plugin.id} className="glass-panel rounded-xl p-6 relative overflow-hidden group ambient-shadow hover:scale-[1.02] transition-transform duration-300">
                          <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-violet/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-accent-violet/30 transition-all" />
                          <div className="flex items-start justify-between relative z-10 mb-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-violet to-deep-indigo flex items-center justify-center text-white shadow-lg shrink-0">
                              <span className="text-[32px]">{plugin.name.includes('Motion') ? '✨' : '🎨'}</span>
                            </div>
                            {plugin.rating && (
                              <span className="bg-surface-bright px-3 py-1 rounded-lg font-mono text-label-sm text-on-surface flex items-center gap-1 border border-white/10">
                                <span className="text-accent-gold text-sm">★</span> {plugin.rating}
                              </span>
                            )}
                          </div>
                          <div className="relative z-10">
                            <h3 className="font-display text-headline-md mb-1">{plugin.name}</h3>
                            <p className="font-body text-metadata text-on-surface-variant mb-4 line-clamp-2">{plugin.description}</p>
                            <div className="flex items-center justify-between mt-6">
                              <span className="font-mono text-label-sm text-on-surface-variant">By {plugin.author}</span>
                              <button className={`px-4 py-2 rounded-lg font-body text-metadata transition-colors border ${
                                plugin.isInstalled
                                  ? 'bg-surface/50 text-on-surface-variant border-white/10 hover:text-white'
                                  : 'bg-surface-bright hover:bg-white/20 text-on-surface border-white/10'
                              }`}>
                                {plugin.isInstalled ? 'Configure' : 'Install'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-headline-lg">Trending Integrations</h2>
                      <button className="text-accent-violet font-body text-metadata hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {trending.map((plugin) => (
                        <div key={plugin.id} className="glass-panel rounded-lg p-5 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                          {plugin.isNew && (
                            <div className="absolute top-0 right-0 bg-accent-magenta/20 text-accent-magenta text-[10px] font-mono text-label-sm px-2 py-1 rounded-bl-lg border-l border-b border-accent-magenta/30">NEW</div>
                          )}
                          <div className="flex gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-white/5 relative">
                              <span className={`text-2xl ${
                                plugin.name.includes('Discord') ? 'text-accent-magenta' :
                                plugin.name.includes('MAL') ? 'text-accent-blue' : 'text-accent-gold'
                              }`}>
                                {plugin.name.includes('Discord') ? '💬' : plugin.name.includes('MAL') ? '🔄' : 'CC'}
                              </span>
                              {plugin.hasUpdate && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-cyan rounded-full border-2 border-surface-dim" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-body text-body-lg font-semibold leading-tight">{plugin.name}</h4>
                              <p className="font-mono text-label-sm text-on-surface-variant mt-1">
                                {plugin.hasUpdate ? '98% Match' : plugin.isNew ? 'Playback' : 'Utility'}
                              </p>
                            </div>
                          </div>
                          <p className="font-body text-metadata text-on-surface-variant text-sm mb-4 line-clamp-2">{plugin.description}</p>
                          <button className={`w-full py-2 rounded-md font-body text-metadata text-sm transition-colors border ${
                            plugin.hasUpdate
                              ? 'bg-surface/50 text-accent-cyan border-accent-cyan/20 flex items-center justify-center gap-2'
                              : 'bg-surface-bright hover:bg-white/10 text-on-surface border-white/5'
                          }`}>
                            {plugin.hasUpdate ? <><span>🔄</span> Update Available</> : 'Install'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mt-8">
                    <div className="rounded-xl border border-dashed border-white/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-surface-container-low/50 backdrop-blur-sm">
                      <div className="flex gap-6 items-center">
                        <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center border border-white/10">
                          <span className="text-[32px] text-on-surface-variant">&lt;/&gt;</span>
                        </div>
                        <div>
                          <h3 className="font-display text-headline-md mb-1">Build Your Own Plugin</h3>
                          <p className="font-body text-metadata text-on-surface-variant">Extend AniTech OS using our comprehensive API and SDK.</p>
                        </div>
                      </div>
                      <button className="px-6 py-3 rounded-lg bg-surface-bright text-on-surface font-body text-metadata border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 shrink-0">
                        Read Documentation →
                      </button>
                    </div>
                  </section>
                </>
              )}
            </div>

            <aside className="hidden xl:block col-span-1">
              <div className="glass-panel rounded-xl h-full p-6 sticky top-0 flex flex-col gap-8">
                <div>
                  <h3 className="font-body text-body-lg font-semibold border-b border-white/10 pb-2 mb-4">System Status</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-body text-metadata text-on-surface-variant flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-cyan" /> Active Plugins
                      </span>
                      <span className="font-mono text-label-sm">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-body text-metadata text-on-surface-variant flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent-violet" /> Memory Usage
                      </span>
                      <span className="font-mono text-label-sm">142 MB</span>
                    </div>
                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2">
                      <div className="bg-gradient-to-r from-accent-blue to-accent-violet h-full w-[35%] rounded-full" />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-body text-body-lg font-semibold border-b border-white/10 pb-2 mb-4">Recently Updated</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Audio Enhancer Pro', version: 'v2.4.1', time: '2 hrs ago', icon: '🎵' },
                      { name: 'Midnight Theme', version: 'v1.1.0', time: '1 day ago', icon: '🎨' },
                    ].map((item) => (
                      <div key={item.name} className="flex gap-3 items-center group cursor-pointer">
                        <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center shrink-0 border border-white/5">
                          <span className="text-sm">{item.icon}</span>
                        </div>
                        <div>
                          <p className="font-body text-metadata text-sm group-hover:text-accent-cyan transition-colors">{item.name}</p>
                          <p className="font-mono text-label-sm text-on-surface-variant">{item.version} • {item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
