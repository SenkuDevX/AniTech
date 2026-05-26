'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiClient.post<{ resetToken?: string; message?: string }>('/auth/forgot-password', { email });
      setSent(true);
      if (res.resetToken) setDevToken(res.resetToken);
    } catch (err: any) {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background selection:bg-accent-violet selection:text-white">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-deep-indigo rounded-full blur-[200px] opacity-40 mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-violet rounded-full blur-[200px] opacity-20 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div className="glass-panel rounded-2xl p-8 md:p-10 shadow-ambient border-white/10">
          <div className="text-center mb-8">
            <h1 className="font-display text-display-lg font-bold text-on-surface">
              <span className="gradient-text">Reset Password</span>
            </h1>
            <p className="font-body text-metadata text-on-surface-variant mt-2">
              Enter your email to receive a reset link
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

          {sent ? (
            <div className="flex flex-col gap-4">
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md">
                <p className="font-body text-metadata text-emerald-400 flex items-start gap-3">
                  <span className="text-lg shrink-0">✓</span>
                  <span>
                    If that email is registered, you will receive a password reset link.
                  </span>
                </p>
              </div>
              {devToken && (
                <div className="p-4 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 backdrop-blur-md">
                  <p className="font-mono text-label-sm text-accent-cyan mb-2">
                    DEV MODE — Reset Token:
                  </p>
                  <code className="block font-mono text-label-sm text-on-surface bg-surface-container-low rounded-lg p-3 break-all border border-white/5 select-all">
                    {devToken}
                  </code>
                </div>
              )}
              <Link
                href="/auth/login"
                className="w-full mt-2 bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-body text-metadata font-bold py-3.5 rounded-xl hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300 text-center"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-accent-blue to-accent-cyan text-white font-body text-metadata font-bold py-3.5 rounded-xl hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {!sent && (
            <p className="mt-6 text-center font-body text-metadata text-on-surface-variant">
              Remember your password?{' '}
              <Link
                href="/auth/login"
                className="text-accent-violet hover:text-accent-violet/80 font-bold transition-colors"
              >
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
