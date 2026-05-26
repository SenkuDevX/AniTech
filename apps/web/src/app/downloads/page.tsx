'use client';
import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { apiClient } from '@/lib/api';

interface AnimeInfo {
  title: string;
}

interface Download {
  id: string;
  animeId: string;
  sourceUrl: string;
  filePath: string;
  fileSize: number;
  downloaded: number;
  status: 'DOWNLOADING' | 'PAUSED' | 'QUEUED' | 'COMPLETED' | 'FAILED';
  priority: number;
  quality: string;
  format: string;
  anime: AnimeInfo;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  DOWNLOADING: { label: 'Downloading', color: 'text-accent-cyan border-accent-cyan/30 bg-accent-cyan/10', dot: 'bg-accent-cyan' },
  PAUSED: { label: 'Paused', color: 'text-accent-gold border-accent-gold/30 bg-accent-gold/10', dot: 'bg-accent-gold' },
  QUEUED: { label: 'Queued', color: 'text-on-surface-variant border-white/10 bg-surface-variant/30', dot: 'bg-on-surface-variant' },
  COMPLETED: { label: 'Completed', color: 'text-tertiary border-tertiary/30 bg-tertiary/10', dot: 'bg-tertiary' },
  FAILED: { label: 'Failed', color: 'text-error border-error/30 bg-error/10', dot: 'bg-error' },
};

const fallbackDownloads: Download[] = [
  { id: 'd1', animeId: 'a1', sourceUrl: '', filePath: '', fileSize: 1450000000, downloaded: 980000000, status: 'DOWNLOADING', priority: 1, quality: '1080p', format: 'MKV', anime: { title: 'Neon Genesis Protocol' } },
  { id: 'd2', animeId: 'a2', sourceUrl: '', filePath: '', fileSize: 890000000, downloaded: 890000000, status: 'COMPLETED', priority: 2, quality: '720p', format: 'MP4', anime: { title: 'Wandering Spirit' } },
  { id: 'd3', animeId: 'a3', sourceUrl: '', filePath: '', fileSize: 2100000000, downloaded: 450000000, status: 'PAUSED', priority: 3, quality: '1080p', format: 'MKV', anime: { title: 'Echoes of the Abyss' } },
  { id: 'd4', animeId: 'a4', sourceUrl: '', filePath: '', fileSize: 780000000, downloaded: 0, status: 'QUEUED', priority: 4, quality: '720p', format: 'MP4', anime: { title: 'Starlight Requiem' } },
  { id: 'd5', animeId: 'a5', sourceUrl: '', filePath: '', fileSize: 1200000000, downloaded: 1200000000, status: 'COMPLETED', priority: 5, quality: '1080p', format: 'MKV', anime: { title: 'Chrono Trigger: The Animation' } },
  { id: 'd6', animeId: 'a6', sourceUrl: '', filePath: '', fileSize: 950000000, downloaded: 600000000, status: 'DOWNLOADING', priority: 2, quality: '4K', format: 'MKV', anime: { title: 'Demon Slayer: Infinity Castle' } },
];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

function formatSpeed(bytes: number): string {
  return `${formatBytes(bytes)}/s`;
}

export default function DownloadsPage() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDownloads = useCallback(() => {
    apiClient.get<Download[]>('/downloads')
      .then((data) => setDownloads(data || []))
      .catch(() => setDownloads(fallbackDownloads))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  const handlePause = async (id: string) => {
    try {
      await apiClient.patch(`/downloads/${id}/pause`);
      setDownloads((prev) => prev.map((d) => d.id === id ? { ...d, status: 'PAUSED' } : d));
    } catch {
      // silent
    }
  };

  const handleResume = async (id: string) => {
    try {
      await apiClient.patch(`/downloads/${id}/resume`);
      setDownloads((prev) => prev.map((d) => d.id === id ? { ...d, status: 'DOWNLOADING' } : d));
    } catch {
      // silent
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await apiClient.delete(`/downloads/${id}`);
      setDownloads((prev) => prev.filter((d) => d.id !== id));
    } catch {
      // silent
    }
  };

  const active = downloads.filter((d) => ['DOWNLOADING', 'PAUSED', 'QUEUED'].includes(d.status));
  const completed = downloads.filter((d) => d.status === 'COMPLETED');

  return (
    <div className="min-h-screen flex selection:bg-accent-violet selection:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan rounded-full blur-[150px] opacity-20 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-accent-violet rounded-full blur-[150px] opacity-15 mix-blend-screen" />
      </div>
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[260px] h-screen overflow-hidden relative z-10 flex flex-col">
        <header className="h-24 shrink-0 flex items-center px-[40px] border-b border-white/5 bg-background/50 backdrop-blur-md">
          <h2 className="font-display text-display-xl text-on-surface flex items-center gap-4">
            <span className="text-[40px] text-accent-cyan">⬇</span>
            Downloads
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto px-[40px] py-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-10">
            {loading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-32 bg-surface-container-high rounded-2xl animate-pulse" />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-error font-body text-body-lg">{error}</p>
                  <button onClick={fetchDownloads} className="mt-4 px-6 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg font-body text-metadata">Retry</button>
                </div>
              </div>
            ) : downloads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24">
                <span className="text-6xl text-on-surface-variant mb-6">⬇</span>
                <h3 className="font-display text-headline-lg text-on-surface mb-2">No Downloads</h3>
                <p className="font-body text-body-md text-on-surface-variant mb-8">Start downloading anime episodes to see them here.</p>
                <a href="/" className="px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-body text-metadata font-bold rounded-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all">
                  Browse Anime
                </a>
              </div>
            ) : (
              <>
                <section>
                  <h3 className="font-display text-headline-md text-on-surface mb-6 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-accent-cyan animate-pulse" />
                    Active Downloads
                    <span className="font-body text-metadata text-on-surface-variant ml-1">({active.length})</span>
                  </h3>
                  {active.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-8 text-center">
                      <p className="text-on-surface-variant font-body text-body-md">No active downloads</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {active.map((dl) => {
                        const cfg = statusConfig[dl.status] || statusConfig.QUEUED;
                        const pct = dl.fileSize > 0 ? Math.min(Math.round((dl.downloaded / dl.fileSize) * 100), 100) : 0;
                        return (
                          <div key={dl.id} className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10 flex flex-col gap-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-display text-headline-md text-on-surface truncate">{dl.anime.title}</h4>
                                    <span className={`shrink-0 px-3 py-0.5 rounded-full font-mono text-label-sm border flex items-center gap-1.5 ${cfg.color}`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                      {cfg.label}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 font-mono text-label-sm text-on-surface-variant">
                                    <span>{dl.quality}</span>
                                    <span className="w-1 h-1 rounded-full bg-on-surface-variant" />
                                    <span>{dl.format}</span>
                                    <span className="w-1 h-1 rounded-full bg-on-surface-variant" />
                                    <span>Priority {dl.priority}</span>
                                    <span className="w-1 h-1 rounded-full bg-on-surface-variant" />
                                    <span>{formatBytes(dl.downloaded)} / {formatBytes(dl.fileSize)}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                  {dl.status === 'DOWNLOADING' && (
                                    <button
                                      onClick={() => handlePause(dl.id)}
                                      className="px-4 py-2 rounded-lg bg-accent-gold/10 text-accent-gold border border-accent-gold/30 font-body text-metadata hover:bg-accent-gold/20 transition-colors flex items-center gap-1.5"
                                    >
                                      <span>⏸</span> Pause
                                    </button>
                                  )}
                                  {(dl.status === 'PAUSED' || dl.status === 'QUEUED') && (
                                    <button
                                      onClick={() => handleResume(dl.id)}
                                      className="px-4 py-2 rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 font-body text-metadata hover:bg-accent-cyan/20 transition-colors flex items-center gap-1.5"
                                    >
                                      <span>▶</span> Resume
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleCancel(dl.id)}
                                    className="px-4 py-2 rounded-lg bg-error/10 text-error border border-error/30 font-body text-metadata hover:bg-error/20 transition-colors flex items-center gap-1.5"
                                  >
                                    <span>✕</span> Cancel
                                  </button>
                                </div>
                              </div>
                              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    dl.status === 'PAUSED' ? 'bg-accent-gold' : dl.status === 'QUEUED' ? 'bg-on-surface-variant' : 'bg-accent-cyan'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <div className="flex justify-between font-mono text-label-sm text-on-surface-variant">
                                <span>{pct}%</span>
                                {dl.status === 'DOWNLOADING' && <span>~{formatSpeed(Math.floor(Math.random() * 5000000) + 1000000)}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="font-display text-headline-md text-on-surface mb-6 flex items-center gap-2">
                    <span className="text-tertiary">✓</span>
                    Completed
                    <span className="font-body text-metadata text-on-surface-variant ml-1">({completed.length})</span>
                  </h3>
                  {completed.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-8 text-center">
                      <p className="text-on-surface-variant font-body text-body-md">No completed downloads</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {completed.map((dl) => (
                        <div key={dl.id} className="glass-panel rounded-2xl p-6 relative overflow-hidden group border-tertiary/10">
                          <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10 flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-display text-headline-md text-on-surface truncate">{dl.anime.title}</h4>
                                <span className="shrink-0 px-3 py-0.5 rounded-full font-mono text-label-sm border text-tertiary border-tertiary/30 bg-tertiary/10 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                                  Completed
                                </span>
                              </div>
                              <div className="flex items-center gap-4 font-mono text-label-sm text-on-surface-variant">
                                <span>{dl.quality}</span>
                                <span className="w-1 h-1 rounded-full bg-on-surface-variant" />
                                <span>{dl.format}</span>
                                <span className="w-1 h-1 rounded-full bg-on-surface-variant" />
                                <span>{formatBytes(dl.fileSize)}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-4">
                              <button className="px-4 py-2 rounded-lg bg-surface-variant/40 text-on-surface border border-white/10 font-body text-metadata hover:bg-surface-variant/60 transition-colors flex items-center gap-1.5">
                                <span>▶</span> Play
                              </button>
                              <button
                                onClick={() => handleCancel(dl.id)}
                                className="px-4 py-2 rounded-lg bg-error/10 text-error border border-error/30 font-body text-metadata hover:bg-error/20 transition-colors flex items-center gap-1.5"
                              >
                                <span>✕</span> Remove
                              </button>
                            </div>
                          </div>
                          <div className="mt-4 w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-tertiary" style={{ width: '100%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
