'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase-browser';

const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || 'leantech.me';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    setError(''); setMessage('');
    if (!email.toLowerCase().endsWith(`@${allowedDomain}`)) {
      setError(`Only @${allowedDomain} emails can access this app.`);
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }
    return true;
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/dashboard` } });
    if (result.error) setError(result.error.message);
    else if (mode === 'signup') setMessage('Account created. Check your email if confirmation is enabled.');
    else window.location.href = '/dashboard';
  }

  async function googleLogin() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` } });
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="h1">Lean Talent Intelligence</h1>
        <p className="muted">Sign in with your Lean email to access the shared talent database.</p>
        <div className="toolbar">
          <button className={`btn ${mode === 'login' ? '' : 'secondary'}`} onClick={() => setMode('login')}>Login</button>
          <button className={`btn ${mode === 'signup' ? '' : 'secondary'}`} onClick={() => setMode('signup')}>Sign up</button>
        </div>
        <form onSubmit={submit} className="grid">
          <input className="input" placeholder="name@leantech.me" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
          <button className="btn" type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
          <button className="btn secondary" type="button" onClick={googleLogin}>Continue with Google</button>
        </form>
      </div>
    </div>
  );
}
