'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/store/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!EMAIL_REGEX.test(email)) errs.push('Please enter a valid email address');
    if (!USERNAME_REGEX.test(username))
      errs.push('Username must be 3-30 characters (letters, numbers, underscores)');
    if (password.length < 8) errs.push('Password must be at least 8 characters');
    if (password !== confirmPassword) errs.push('Passwords do not match');
    setErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrors([]);

    try {
      const res = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/register', {
        email,
        username,
        password,
      });
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('refreshToken', res.refreshToken);
      await register({ username, email, password });
      router.push('/');
    } catch (err: any) {
      setErrors([err.message || 'Registration failed. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background selection:bg-accent-violet selection:text-white">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-deep-indigo rounded-full blur-[200px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-violet rounded-full blur-[200px] opacity-20 mix-blend-screen" />
        <div className="absolute top-[30%] right-[25%] w-[20%] h-[20%] bg-accent-cyan rounded-full blur-[180px] opacity-15 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div className="glass-panel rounded-2xl p-8 md:p-10 shadow-ambient border-white/10">
          <div className="text-center mb-8">
            <h1 className="font-display text-display-lg font-bold text-on-surface">
              <span className="gradient-text">Create Account</span>
            </h1>
            <p className="font-body text-metadata text-on-surface-variant mt-2">
              Join the AniTech community
            </p>
          </div>

          {errors.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-error-container/50 border border-error/30 backdrop-blur-md">
              <ul className="flex flex-col gap-1">
                {errors.map((err, i) => (
                  <li key={i} className="font-body text-metadata text-error flex items-center gap-2">
                    <span>⚠</span>
                    {err}
                  </li>
                ))}
              </ul>
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
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="YourUsername"
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

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-label-sm text-on-surface-variant uppercase tracking-widest">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-surface-container-low/60 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 font-body text-metadata text-on-surface placeholder-on-surface-variant/40 focus:outline-none focus:border-accent-cyan/50 focus:bg-surface-container-low/80 transition-all duration-300"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-violet to-accent-magenta text-white font-body text-metadata font-bold py-3.5 rounded-xl hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-metadata text-on-surface-variant">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-accent-cyan hover:text-accent-cyan/80 font-bold transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
