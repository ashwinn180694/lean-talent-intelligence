'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-browser';

const ALLOWED_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || 'leantech.me';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    setError('');
    setMessage('');
    if (!email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)) {
      setError(`Only @${ALLOWED_DOMAIN} emails are allowed.`);
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      window.location.href = '/dashboard';
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` }
      });
      setLoading(false);
      if (error) { setError(error.message); return; }
      setMessage('Account created! Check your email to confirm, then sign in.');
      setMode('login');
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f7f4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '11px',
            background: '#1a1a2e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: '40%', background: 'rgba(196,126,58,0.25)'
            }} />
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#c47e3a', position: 'relative' }}>L</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e', margin: 0 }}>
              Lean Talent Intelligence
            </h1>
            <p style={{ fontSize: '13px', color: '#9a9080', margin: '4px 0 0' }}>
              Sign in with your @{ALLOWED_DOMAIN} account
            </p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #e8e6e0', borderRadius: '12px', padding: '24px' }}>

          {/* Mode toggle */}
          <div style={{
            display: 'flex', borderRadius: '8px',
            border: '1px solid #e8e6e0', background: '#f8f7f4',
            padding: '3px', marginBottom: '20px'
          }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setMessage(''); }}
                style={{
                  flex: 1, borderRadius: '6px', padding: '7px',
                  fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s', fontFamily: 'inherit',
                  background: mode === m ? '#fff' : 'transparent',
                  color: mode === m ? '#1a1a2e' : '#9a9080',
                  boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                }}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: '#9a9080', marginBottom: '4px' }}>
                Email
              </label>
              <input
                type="email"
                placeholder={`name@${ALLOWED_DOMAIN}`}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width: '100%', borderRadius: '8px', border: '1px solid #e8e6e0',
                  background: '#fff', padding: '9px 12px', fontSize: '13.5px',
                  color: '#1a1a2e', outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
                onFocus={e => { e.target.style.borderColor = '#c47e3a'; e.target.style.boxShadow = '0 0 0 3px rgba(196,126,58,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#e8e6e0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: '#9a9080', marginBottom: '4px' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  width: '100%', borderRadius: '8px', border: '1px solid #e8e6e0',
                  background: '#fff', padding: '9px 12px', fontSize: '13.5px',
                  color: '#1a1a2e', outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.15s, box-shadow 0.15s'
                }}
                onFocus={e => { e.target.style.borderColor = '#c47e3a'; e.target.style.boxShadow = '0 0 0 3px rgba(196,126,58,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = '#e8e6e0'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {error && (
              <div style={{
                borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca',
                padding: '10px 12px', fontSize: '13px', color: '#dc2626'
              }}>
                {error}
              </div>
            )}
            {message && (
              <div style={{
                borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0',
                padding: '10px 12px', fontSize: '13px', color: '#15803d'
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', borderRadius: '8px', background: loading ? '#d4924e' : '#c47e3a',
                padding: '10px', fontSize: '14px', fontWeight: 500, color: '#fff',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s', fontFamily: 'inherit', marginTop: '4px'
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.background = '#a86828'); }}
              onMouseLeave={e => { if (!loading) (e.currentTarget.style.background = '#c47e3a'); }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e8e6e0' }} />
            <span style={{ fontSize: '11.5px', color: '#b8b4aa' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#e8e6e0' }} />
          </div>

          <button
            onClick={handleGoogle}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', borderRadius: '8px', border: '1px solid #e8e6e0', background: '#fff',
              padding: '9px', fontSize: '13.5px', fontWeight: 500, color: '#5a5650',
              cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8f7f4'; e.currentTarget.style.borderColor = '#d4cfc8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e8e6e0'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#b8b4aa', marginTop: '20px' }}>
          Internal tool — Lean Technologies
        </p>
      </div>
    </div>
  );
}
