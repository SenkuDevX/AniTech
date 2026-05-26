'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, guestLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/login', {
        email,
        password,
      });
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      await guestLogin();
      router.push('/');
    } catch {
      setError('Unable to continue as guest');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background selection:bg-accent-violet selection:text-white">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-deep-indigo rounded-full blur-[200px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-cyan rounded-full blur-[200px] opacity-20 mix-blend-screen" />
        <div className="absolute top-[40%] right-[20%] w-[25%] h-[25%] bg-accent-violet rounded-full blur-[180px] opacity-15 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div className="glass-panel rounded-2xl p-8 md:p-10 shadow-ambient border-white/10">
          <div className="text-center mb-8">
            <h1 className="font-display text-display-lg font-bold text-on-surface">
              <span className="gradient-text">Welcome Back</span>
            </h1>
            <p className="font-body text-metadata text-on-surface-variant mt-2">
              Sign in to continue your journey
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error-container/50 border border-error/30 backdrop-blur-md">
              <p className="font-body text-metadata text-error flex items-center gap-2">
                <span>⚠</span>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-label-sm text-on-surface-variant uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-surface-container-low/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 font-body text-metadata text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-accent-cyan/50 focus:bg-surface-container-low/80 transition-all duration-300"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-label-sm text-on-surface-variant uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-surface-container-low/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 font-body text-metadata text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-accent-cyan/50 focus:bg-surface-container-low/80 transition-all duration-300"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-white/10 bg-surface-container-low/60 accent-accent-cyan focus:ring-accent-cyan/30"
                />
                <span className="font-body text-metadata text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Remember me
                </span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="font-body text-metadata text-accent-cyan hover:text-accent-cyan/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-body text-metadata font-bold py-3.5 rounded-xl hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-4 font-mono text-label-sm text-on-surface-variant">
                OR
              </span>
            </div>
          </div>

          <button
            onClick={handleGuest}
            disabled={loading}
            className="w-full bg-surface-variant/30 backdrop-blur-md border border-white/10 text-on-surface font-body text-metadata py-3.5 rounded-xl hover:bg-surface-variant/50 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
          >
            Continue as Guest
          </button>

          <p className="mt-6 text-center font-body text-metadata text-on-surface-variant">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/register"
              className="text-accent-violet hover:text-accent-violet/80 font-bold transition-colors"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
