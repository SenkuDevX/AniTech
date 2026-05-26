'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import type { Anime, Episode } from '@/types/design';

interface StreamSource {
  url: string;
  quality: string;
  format: string;
}

interface Subtitle {
  language: string;
  fileUrl: string;
  format: string;
}

interface ProgressData {
  progress: number;
  duration: number;
}

interface UserSettings {
  defaultPlaybackSpeed?: number;
  autoSkipIntro?: boolean;
  autoSkipOutro?: boolean;
  autoNextEpisode?: boolean;
  defaultQuality?: string;
  volume?: number;
  muted?: boolean;
  subtitleLanguage?: string;
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

import { updateDiscordPresence, clearDiscordPresence } from '@/lib/native';

export default function PlayerPage() {
  const params = useParams();
  const router = useRouter();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<StreamSource[]>([]);
  const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
  const [settings, setSettings] = useState<UserSettings>({});
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'speed' | 'quality' | 'subtitles'>('speed');
  const [buffering, setBuffering] = useState(false);
  const [progressSaved, setProgressSaved] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const progressIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const resumeTimeRef = useRef<number>(0);

  const animeId = params.animeId as string;
  const episodeId = params.episodeId as string;

  const resetTimer = useCallback(() => {
    setUiVisible(true);
    setShowSettings(false);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setUiVisible(false), 3000);
  }, []);

  useEffect(() => {
    if (!animeId || !episodeId) return;
    setLoading(true);

    Promise.all([
      apiClient.get<{ data: Anime }>(`/anime/${animeId}`).catch(() => null),
      apiClient.get<{ data: Episode }>(`/anime/${animeId}/episodes/${episodeId}`).catch(() => null),
      apiClient.get<{ data: ProgressData }>(`/player/progress/${animeId}/${episodeId}`).catch(() => null),
      apiClient.get<{ data: StreamSource[] }>(`/player/sources/${animeId}/${episodeId}`).catch(() => null),
      apiClient.get<{ data: Subtitle[] }>(`/player/subtitles/${episodeId}`).catch(() => null),
      apiClient.get<{ data: UserSettings }>('/settings').catch(() => null),
    ])
      .then(([animeRes, epRes, progressRes, sourcesRes, subsRes, settingsRes]) => {
        if (!animeRes?.data && !epRes?.data) throw new Error('Content not found');
        if (animeRes?.data) setAnime(animeRes.data);
        if (epRes?.data) setEpisode(epRes.data);
        if (progressRes?.data) resumeTimeRef.current = progressRes.data.progress;
        if (sourcesRes?.data) setSources(sourcesRes.data);
        if (subsRes?.data) setSubtitles(subsRes.data);
        if (settingsRes?.data) {
          setSettings(settingsRes.data);
          setVolume(settingsRes.data.volume ?? 1);
          setIsMuted(settingsRes.data.muted ?? false);
          setPlaybackSpeed(settingsRes.data.defaultPlaybackSpeed ?? 1);
          if (settingsRes.data.defaultQuality) setSelectedQuality(settingsRes.data.defaultQuality);
          if (settingsRes.data.subtitleLanguage) setSelectedSubtitle(settingsRes.data.subtitleLanguage);
        }
        if (!sourcesRes?.data || sourcesRes.data.length === 0) throw new Error('No sources available');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [animeId, episodeId]);

  useEffect(() => {
    if (anime && episode) {
      updateDiscordPresence(
        `Watching ${anime.title}`,
        `Episode ${episode.number}${episode.title ? `: ${episode.title}` : ''}`,
        anime.posterUrl || 'logo',
        anime.title,
        isPlaying ? Date.now() - (videoRef.current?.currentTime || 0) * 1000 : undefined
      );
    }
    return () => {
      clearDiscordPresence();
    };
  }, [anime, episode, isPlaying]);

  useEffect(() => {
    resetTimer();
    const handleMouse = () => resetTimer();
    window.addEventListener('mousemove', handleMouse);
    window.addEventListener('keydown', handleMouse);
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      window.removeEventListener('keydown', handleMouse);
      clearTimeout(timeoutRef.current);
    };
  }, [resetTimer, loading]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => { setIsPlaying(true); setIsPaused(false); };
    const onPause = () => { setIsPlaying(false); setIsPaused(true); };
    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const onWaiting = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    const onPlaying = () => setBuffering(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('playing', onPlaying);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('playing', onPlaying);
    };
  }, [loading]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || loading) return;

    if (resumeTimeRef.current > 1) {
      video.currentTime = resumeTimeRef.current;
    }
  }, [loading]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const video = videoRef.current;
    if (!video || sources.length === 0) return;

    const hlsSource = sources.find((s) => s.format === 'hls' || s.url.includes('.m3u8'));
    if (hlsSource) {
      import('hls.js').then((HlsModule) => {
        const Hls = HlsModule.default;
        if (Hls.isSupported()) {
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hlsRef.current = hls;
          hls.loadSource(hlsSource.url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
            const levels = hls.levels.map((l: any) => l.height);
            if (selectedQuality !== 'auto') {
              const idx = levels.findIndex((h: number) => `${h}p` === selectedQuality);
              if (idx >= 0) hls.currentLevel = idx;
              else hls.currentLevel = -1;
            }
          });
          hls.on(Hls.Events.ERROR, (_: any, data: any) => {
            if (data.fatal) {
              hls.destroy();
              hlsRef.current = null;
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsSource.url;
          video.play().catch(() => {});
        }
      });
    } else {
      const preferredSource = selectedQuality !== 'auto'
        ? sources.find((s) => s.quality === selectedQuality) || sources[0]
        : sources[0];
      if (preferredSource) {
        video.src = preferredSource.url;
        video.play().catch(() => {});
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [sources, loading]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
  }, [volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (!isPlaying || !animeId || !episodeId) return;
    progressIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (!video) return;
      const progress = Math.floor(video.currentTime);
      const dur = Math.floor(video.duration || 0);
      if (progress === progressSaved) return;
      setProgressSaved(progress);
      apiClient.post('/player/progress', {
        animeId,
        episodeId,
        progress,
        duration: dur,
      }).catch(() => {});
    }, 30000);
    return () => clearInterval(progressIntervalRef.current);
  }, [isPlaying, animeId, episodeId, progressSaved]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (video.paused) video.play().catch(() => {});
          else video.pause();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setIsMuted((prev) => !prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume((prev) => Math.min(1, prev + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume((prev) => Math.max(0, prev - 0.1));
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };
    const onPause = () => {
      setIsPlaying(false);
      setIsPaused(true);
    };
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration);
    };
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => setBuffering(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else {
        await video.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch {
      setIsPiP(false);
    }
  }, []);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    video.currentTime = x * (video.duration || 0);
  }, []);

  const handleVolumeChange = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(x);
  }, []);

  const changeQuality = useCallback((quality: string) => {
    setSelectedQuality(quality);
    const video = videoRef.current;
    if (!video) return;
    if (hlsRef.current) {
      if (quality === 'auto') {
        hlsRef.current.currentLevel = -1;
      } else {
        const levels = hlsRef.current.levels;
        const idx = levels.findIndex((l: any) => `${l.height}p` === quality);
        if (idx >= 0) hlsRef.current.currentLevel = idx;
      }
    } else {
      const source = sources.find((s) => s.quality === quality);
      if (source && source.url !== video.src) {
        const ct = video.currentTime;
        const wasPlaying = !video.paused;
        video.src = source.url;
        video.currentTime = ct;
        if (wasPlaying) video.play().catch(() => {});
      }
    }
  }, [sources]);

  const seekFraction = duration > 0 ? currentTime / duration : 0;
  const buffered = videoRef.current?.buffered;
  let bufferedPercent = 0;
  if (buffered && buffered.length > 0 && duration > 0) {
    bufferedPercent = buffered.end(buffered.length - 1) / duration;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-highest animate-pulse mx-auto" />
          <p className="text-on-surface-variant font-body text-body-md">Loading player...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-error font-body text-body-lg">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg font-body text-metadata hover:bg-accent-cyan/30 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen bg-background text-on-surface overflow-hidden select-none"
    >
      <div
        className="absolute inset-0 z-0"
      >
        <div className="w-full h-full bg-gradient-to-br from-surface-container-highest via-surface to-black" />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-transparent to-surface/90 pointer-events-none" />
      </div>

      <div className="relative z-10 w-full h-full flex flex-col">
        <header
          className={`w-full px-6 pt-4 pb-2 flex items-center justify-between transition-opacity duration-300 ${
            uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href={anime ? `/anime/${anime.id}` : '/'}
              className="w-10 h-10 rounded-full bg-surface-container/50 backdrop-blur-md flex items-center justify-center hover:bg-surface-container-high transition-colors border border-white/10 group shrink-0"
            >
              <span className="text-on-surface group-hover:text-accent-cyan transition-colors text-lg">&larr;</span>
            </Link>
            <div className="min-w-0">
              <h1 className="font-display text-headline-md text-white truncate">
                {anime?.title || 'Unknown Anime'}
              </h1>
              <p className="font-body text-metadata text-on-surface-variant truncate">
                {episode ? `Episode ${episode.number}: ${episode.title}` : 'Episode'}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 relative flex items-center justify-center bg-black/40 mx-4 mb-2 rounded-xl overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full max-h-full object-contain"
            playsInline
            preload="auto"
            crossOrigin="anonymous"
          >
            {subtitles
              .filter((s) => selectedSubtitle === 'off' || s.language === selectedSubtitle)
              .map((sub) => (
                <track
                  key={sub.language}
                  kind="subtitles"
                  srcLang={sub.language}
                  src={sub.fileUrl}
                  label={sub.language}
                  default={sub.language === (selectedSubtitle !== 'off' ? selectedSubtitle : undefined)}
                />
              ))}
          </video>

          {sources.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60">
              <div className="text-center">
                <p className="text-on-surface-variant font-body text-body-lg">No sources available</p>
              </div>
            </div>
          )}

          {buffering && isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full border-2 border-accent-cyan border-t-transparent animate-spin" />
            </div>
          )}

          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ opacity: isPlaying || !uiVisible ? 0 : 1 }}
          >
            <div
              className="w-20 h-20 rounded-full bg-surface/40 backdrop-blur-sm border border-white/10 flex items-center justify-center pointer-events-auto cursor-pointer transition-transform hover:scale-110"
              onClick={togglePlay}
            >
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {uiVisible && (
            <div
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-4 px-4 transition-opacity duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer group/seek mb-4"
                onClick={handleSeek}
              >
                <div
                  className="absolute left-0 top-0 h-full bg-white/30 rounded-full"
                  style={{ width: `${bufferedPercent * 100}%` }}
                />
                <div
                  className="absolute left-0 top-0 h-full bg-accent-cyan rounded-full"
                  style={{ width: `${seekFraction * 100}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md opacity-0 group-hover/seek:opacity-100 transition-opacity"
                  style={{ left: `calc(${seekFraction * 100}% - 8px)` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="text-white hover:text-accent-cyan transition-colors"
                  >
                    {isPlaying ? (
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <div className="flex items-center gap-2 group/vol">
                    <button
                      onClick={() => setIsMuted((prev) => !prev)}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                        </svg>
                      ) : volume < 0.5 ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                      )}
                    </button>
                    <div
                      className="w-0 group-hover/vol:w-24 overflow-hidden transition-all duration-300 flex items-center h-6"
                    >
                      <div
                        className="w-full h-1 bg-white/20 rounded-full relative cursor-pointer"
                        onClick={handleVolumeChange}
                      >
                        <div
                          className="absolute left-0 top-0 h-full bg-white rounded-full"
                          style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md"
                          style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)` }}
                        />
                      </div>
                    </div>
                  </div>

                  <span className="font-mono text-label-sm text-white/70">
                    {formatTime(currentTime)}
                    <span className="mx-1 text-white/40">/</span>
                    {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button
                      onClick={() => { setShowSettings((prev) => !prev); setSettingsTab('speed'); }}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                      </svg>
                    </button>

                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 w-52 bg-surface-container/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                        <div className="flex border-b border-white/10">
                          {(['speed', 'quality', 'subtitles'] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setSettingsTab(tab)}
                              className={`flex-1 py-2 text-label-sm font-body transition-colors ${
                                settingsTab === tab
                                  ? 'text-accent-cyan border-b-2 border-accent-cyan'
                                  : 'text-white/60 hover:text-white/80'
                              }`}
                            >
                              {tab === 'speed' ? 'Speed' : tab === 'quality' ? 'Quality' : 'Subtitles'}
                            </button>
                          ))}
                        </div>
                        <div className="py-1 max-h-48 overflow-y-auto">
                          {settingsTab === 'speed' && PLAYBACK_SPEEDS.map((speed) => (
                            <button
                              key={speed}
                              onClick={() => { setPlaybackSpeed(speed); }}
                              className={`w-full px-4 py-2 text-left font-body text-metadata transition-colors flex items-center justify-between ${
                                playbackSpeed === speed
                                  ? 'text-accent-cyan bg-accent-cyan/10'
                                  : 'text-white/70 hover:bg-white/5'
                              }`}
                            >
                              <span>{speed}x</span>
                              {playbackSpeed === speed && (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                </svg>
                              )}
                            </button>
                          ))}
                          {settingsTab === 'quality' && (
                            <>
                              <button
                                onClick={() => changeQuality('auto')}
                                className={`w-full px-4 py-2 text-left font-body text-metadata transition-colors flex items-center justify-between ${
                                  selectedQuality === 'auto'
                                    ? 'text-accent-cyan bg-accent-cyan/10'
                                    : 'text-white/70 hover:bg-white/5'
                                }`}
                              >
                                <span>Auto</span>
                                {selectedQuality === 'auto' && (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                  </svg>
                                )}
                              </button>
                              {[...new Set(sources.map((s) => s.quality))].map((quality) => (
                                <button
                                  key={quality}
                                  onClick={() => changeQuality(quality)}
                                  className={`w-full px-4 py-2 text-left font-body text-metadata transition-colors flex items-center justify-between ${
                                    selectedQuality === quality
                                      ? 'text-accent-cyan bg-accent-cyan/10'
                                      : 'text-white/70 hover:bg-white/5'
                                  }`}
                                >
                                  <span>{quality}</span>
                                  {selectedQuality === quality && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </>
                          )}
                          {settingsTab === 'subtitles' && (
                            <>
                              <button
                                onClick={() => setSelectedSubtitle('off')}
                                className={`w-full px-4 py-2 text-left font-body text-metadata transition-colors flex items-center justify-between ${
                                  selectedSubtitle === 'off'
                                    ? 'text-accent-cyan bg-accent-cyan/10'
                                    : 'text-white/70 hover:bg-white/5'
                                }`}
                              >
                                <span>Off</span>
                                {selectedSubtitle === 'off' && (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                  </svg>
                                )}
                              </button>
                              {subtitles.map((sub) => (
                                <button
                                  key={sub.language}
                                  onClick={() => setSelectedSubtitle(sub.language)}
                                  className={`w-full px-4 py-2 text-left font-body text-metadata transition-colors flex items-center justify-between ${
                                    selectedSubtitle === sub.language
                                      ? 'text-accent-cyan bg-accent-cyan/10'
                                      : 'text-white/70 hover:bg-white/5'
                                  }`}
                                >
                                  <span>{sub.language}</span>
                                  {selectedSubtitle === sub.language && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={togglePiP}
                    className="text-white/80 hover:text-white transition-colors hidden sm:block"
                    title="Picture-in-Picture"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z" />
                    </svg>
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="text-white/80 hover:text-white transition-colors"
                    title="Fullscreen"
                  >
                    {isFullscreen ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div
          className={`w-full px-6 pb-4 pt-2 flex items-center gap-4 transition-opacity duration-300 ${
            uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {anime?.posterUrl && (
            <img
              src={anime.posterUrl}
              alt={anime.title}
              className="w-12 h-16 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="font-body text-metadata text-on-surface-variant">
              Now Playing
            </p>
            <p className="font-display text-body-md text-white truncate">
              {anime?.title || 'Unknown Anime'}
            </p>
            {episode && (
              <p className="font-body text-label-sm text-on-surface-variant truncate">
                Episode {episode.number}{episode.title ? ` - ${episode.title}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
