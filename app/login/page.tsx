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
      minHeight: '100vh', background: '#1B1B1F',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>

        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '11px', background: '#3DD68C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#0c1f16' }}>L</span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#EDEEF0', margin: 0 }}>Lean Talent Intelligence</h1>
            <p style={{ fontSize: '13px', color: '#5b6066', margin: '4px 0 0' }}>
              Sign in with your @{ALLOWED_DOMAIN} account
            </p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#212329', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px' }}>

          {/* Mode toggle */}
          <div style={{ display: 'flex', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.07)', background: '#1B1B1F', padding: '3px', marginBottom: '20px' }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setMessage(''); }} style={{
                flex: 1, borderRadius: '6px', padding: '7px', fontSize: '13px', fontWeight: 500,
                border: 'none', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                background: mode === m ? '#212329' : 'transparent',
                color: mode === m ? '#EDEEF0' : '#5b6066',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
              }}>
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: '#787F85', marginBottom: '4px' }}>Email</label>
              <input
                type="email" placeholder={`name@${ALLOWED_DOMAIN}`} value={email} onChange={e => setEmail(e.target.value)} required
                style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: '#1B1B1F', padding: '9px 12px', fontSize: '13.5px', color: '#EDEEF0', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onFocus={e => { e.target.style.borderColor = '#3DD68C'; e.target.style.boxShadow = '0 0 0 3px rgba(61,214,140,0.10)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: '#787F85', marginBottom: '4px' }}>Password</label>
              <input
                type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: '#1B1B1F', padding: '9px 12px', fontSize: '13.5px', color: '#EDEEF0', outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onFocus={e => { e.target.style.borderColor = '#3DD68C'; e.target.style.boxShadow = '0 0 0 3px rgba(61,214,140,0.10)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            {error && <div style={{ borderRadius: '8px', background: 'rgba(242,102,105,0.10)', border: '1px solid rgba(242,102,105,0.25)', padding: '10px 12px', fontSize: '13px', color: '#F26669' }}>{error}</div>}
            {message && <div style={{ borderRadius: '8px', background: 'rgba(61,214,140,0.08)', border: '1px solid rgba(61,214,140,0.20)', padding: '10px 12px', fontSize: '13px', color: '#3DD68C' }}>{message}</div>}

            <button type="submit" disabled={loading} style={{
              width: '100%', borderRadius: '6px', background: '#3DD68C', padding: '10px', fontSize: '14px',
              fontWeight: 600, color: '#0c1f16', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'filter 0.12s', fontFamily: 'inherit', marginTop: '4px',
            }}
              onMouseEnter={e => { if (!loading) (e.currentTarget.style.filter = 'brightness(1.08)'); }}
              onMouseLeave={e => { (e.currentTarget.style.filter = 'none'); }}
            >
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: '11.5px', color: '#5b6066' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <button onClick={handleGoogle} style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent',
            padding: '9px', fontSize: '13.5px', fontWeight: 500, color: '#ADB1B8',
            cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s', fontFamily: 'inherit',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
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

        <p style={{ textAlign: 'center', fontSize: '11.5px', color: '#5b6066', marginTop: '20px' }}>
          Internal tool — Lean Technologies
        </p>
      </div>
    </div>
  );
}
