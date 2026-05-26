'use client';
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';

const categories = [
  { id: 'personalization', label: 'Personalization', icon: '🎨' },
  { id: 'playback', label: 'Playback & Subtitles', icon: 'CC' },
  { id: 'network', label: 'Network & Downloads', icon: '⬇' },
  { id: 'privacy', label: 'Social & Privacy', icon: '🔒' },
  { id: 'system', label: 'System Info', icon: '💻' },
] as const;

const accentColors = [
  { color: 'bg-accent-cyan', name: 'Cyan' },
  { color: 'bg-accent-violet', name: 'Violet' },
  { color: 'bg-accent-magenta', name: 'Magenta' },
  { color: 'bg-accent-gold', name: 'Gold' },
  { color: 'bg-slate-400', name: 'Neutral' },
];

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('personalization');
  const [selectedAccent, setSelectedAccent] = useState(0);

  return (
    <div className="min-h-screen h-screen overflow-hidden flex selection:bg-accent-violet selection:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-deep-indigo rounded-full blur-[150px] opacity-30 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent-cyan rounded-full blur-[150px] opacity-20 mix-blend-screen" />
      </div>
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[260px] h-full relative z-10 flex flex-col overflow-hidden">
        <header className="h-24 shrink-0 flex items-center px-[40px] border-b border-white/5 bg-background/50 backdrop-blur-md">
          <h2 className="font-display text-display-xl text-on-surface flex items-center gap-4">
            <span className="text-[40px] text-accent-violet">⚙</span>
            Settings
          </h2>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <aside className="w-72 shrink-0 border-r border-white/5 bg-surface-container-lowest/50 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full text-left px-4 py-3 rounded-lg font-body text-metadata flex items-center gap-3 transition-all ${
                  activeCategory === cat.id
                    ? 'bg-surface-variant/50 text-accent-cyan shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-white/10'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30'
                }`}
              >
                <span className="text-[20px]">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </aside>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-[40px] pb-32">
            <div className="max-w-4xl mx-auto flex flex-col gap-10">
              <section>
                <h3 className="font-display text-headline-md text-on-surface mb-6 flex items-center gap-2">
                  <span className="text-accent-violet">◉</span>
                  System Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-violet/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex justify-between items-center z-10">
                      <span className="font-body text-metadata text-on-surface-variant">Local Cache</span>
                      <span className="text-accent-violet">💾</span>
                    </div>
                    <div className="z-10">
                      <div className="font-display text-headline-lg text-on-surface">42.8 <span className="font-body text-metadata text-on-surface-variant">GB</span></div>
                      <div className="w-full h-1.5 bg-surface-container-high rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-accent-violet w-[65%] rounded-full" />
                      </div>
                      <div className="flex justify-between mt-2 font-mono text-label-sm text-on-surface-variant opacity-70">
                        <span>Used</span>
                        <span>120 GB Total</span>
                      </div>
                    </div>
                  </div>
                  <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex justify-between items-center z-10">
                      <span className="font-body text-metadata text-on-surface-variant">Connection</span>
                      <span className="text-accent-cyan">📶</span>
                    </div>
                    <div className="z-10">
                      <div className="font-display text-headline-lg text-on-surface flex items-end gap-2">
                        Optimal
                        <span className="w-2 h-2 rounded-full bg-accent-cyan mb-2 animate-pulse" />
                      </div>
                      <div className="mt-4 flex items-center gap-2 font-mono text-label-sm text-on-surface-variant">
                        <span>⬇</span> 1.2 Gbps
                        <span className="ml-2">⬆</span> 450 Mbps
                      </div>
                    </div>
                  </div>
                  <div className="glass-panel rounded-xl p-6 flex flex-col justify-between relative overflow-hidden group border-accent-cyan/30">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-cyan/20 via-transparent to-transparent opacity-50" />
                    <div className="flex justify-between items-start z-10">
                      <div>
                        <span className="font-body text-metadata text-on-surface-variant block mb-1">Performance Profile</span>
                        <span className="font-display text-headline-md text-accent-cyan">Cinematic Focus</span>
                      </div>
                      <span className="text-accent-cyan">⚡</span>
                    </div>
                    <button className="mt-4 z-10 text-left font-mono text-label-sm text-on-surface-variant hover:text-white flex items-center gap-1 transition-colors w-fit">
                      Configure →
                    </button>
                  </div>
                </div>
              </section>

              {activeCategory === 'personalization' && (
                <section className="glass-panel rounded-2xl p-8 relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <span className="text-[120px]">🎨</span>
                  </div>
                  <div className="flex items-center gap-4 border-b border-white/5 pb-6 mb-8 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center border border-white/10 shadow-lg">
                      <span className="text-accent-cyan">🎨</span>
                    </div>
                    <div>
                      <h3 className="font-display text-headline-lg text-on-surface">Personalization</h3>
                      <p className="font-body text-body-md text-on-surface-variant">Customize your AniTech OS visual experience.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 relative z-10">
                    <div className="flex flex-col gap-6">
                      <div>
                        <h4 className="font-body text-metadata text-on-surface mb-4">Theme Accent</h4>
                        <div className="flex gap-4">
                          {accentColors.map((accent, idx) => (
                            <button
                              key={accent.name}
                              onClick={() => setSelectedAccent(idx)}
                              className={`w-12 h-12 rounded-full ${accent.color} flex items-center justify-center transition-all ${
                                selectedAccent === idx
                                  ? 'ring-2 ring-white ring-offset-4 ring-offset-background shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                                  : 'hover:scale-110 opacity-70 hover:opacity-100'
                              }`}
                            >
                              {selectedAccent === idx && <span className="text-background text-[20px]">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="pt-4">
                        <div className="flex justify-between items-end mb-4">
                          <h4 className="font-body text-metadata text-on-surface">Glassmorphism Intensity</h4>
                          <span className="font-mono text-label-sm text-accent-cyan">High (20px blur)</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container-high rounded-full relative">
                          <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-accent-blue to-accent-cyan w-3/4 rounded-full" />
                          <div className="absolute left-3/4 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] cursor-pointer hover:scale-125 transition-transform" />
                        </div>
                        <div className="flex justify-between mt-2 font-mono text-label-sm text-on-surface-variant opacity-50">
                          <span>Minimal (Solid)</span>
                          <span>Immersive (Deep Glass)</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface-container-high/50 rounded-xl p-6 border border-white/5 relative">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-body text-metadata text-on-surface">Typography Scale</h4>
                        <div className="flex bg-surface-container rounded-lg p-1">
                          <button className="px-3 py-1 font-mono text-label-sm text-on-surface-variant hover:text-white transition-colors">A-</button>
                          <button className="px-3 py-1 font-mono text-label-sm text-white bg-surface-variant rounded shadow-sm">A</button>
                          <button className="px-3 py-1 font-mono text-label-sm text-on-surface-variant hover:text-white transition-colors">A+</button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="font-mono text-label-sm text-accent-cyan mb-1">Display XL (Sora)</p>
                          <p className="font-display text-display-xl text-on-surface truncate">The quick brown fox</p>
                        </div>
                        <div className="pt-2">
                          <p className="font-mono text-label-sm text-accent-cyan mb-1">Body Medium (Hanken Grotesk)</p>
                          <p className="font-body text-body-md text-on-surface-variant line-clamp-2">Jumps over the lazy dog. AniTech OS is a free, open-source community media platform.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeCategory !== 'personalization' && (
                <div className="glass-panel rounded-2xl p-12 text-center">
                  <p className="text-on-surface-variant font-body text-body-lg">Settings section coming soon</p>
                </div>
              )}

              <section className="mt-8 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <span className="text-emerald-400">✓</span>
                  </div>
                  <div>
                    <h5 className="font-body text-metadata text-on-surface">System Integrity Verified</h5>
                    <p className="font-mono text-label-sm text-on-surface-variant">Core v2.4.1 • All plugins secure</p>
                  </div>
                </div>
                <button className="px-6 py-2 rounded-lg font-body text-metadata text-on-surface-variant border border-white/10 hover:bg-white/5 transition-colors">
                  Check for Updates
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
