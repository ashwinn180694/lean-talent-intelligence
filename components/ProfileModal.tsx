'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import type { Profile } from './UserAvatar';
import UserAvatar from './UserAvatar';

const COLORS = [
  '#3DD68C', '#46B8D8', '#5B5BD6', '#D6A35C',
  '#9AB654', '#F26669', '#35B979', '#C084FC',
];

export default function ProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: Profile;
  onClose: () => void;
  onSave: (updated: Profile) => void;
}) {
  const [name, setName] = useState(profile.display_name || '');
  const [title, setTitle] = useState(profile.title || '');
  const [color, setColor] = useState(profile.avatar_color || '#3DD68C');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const preview: Profile = { ...profile, display_name: name || null, avatar_color: color, title: title || null };

  async function handleSave() {
    setSaving(true);
    setError('');
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name || null, title: title || null, avatar_color: color, updated_at: new Date().toISOString() })
      .eq('id', profile.id);
    setSaving(false);
    if (error) { setError(error.message); return; }
    onSave(preview);
    onClose();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#212329', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '14px', width: '100%', maxWidth: '380px', padding: '24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#FFFFFF' }}>Your profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#787F85', padding: '4px', borderRadius: '6px', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>

        {/* Avatar preview */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
          <UserAvatar profile={preview} size={48} />
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#FFFFFF' }}>{name || profile.email}</p>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#787F85' }}>{profile.email}</p>
          </div>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: '#787F85', marginBottom: '5px' }}>Display name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              style={{ width: '100%', background: '#1B1B1F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '9px 12px', fontSize: '13.5px', color: '#FFFFFF', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#3DD68C'; e.target.style.boxShadow = '0 0 0 3px rgba(61,214,140,0.10)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: '#787F85', marginBottom: '5px' }}>Title / role</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Talent Partner"
              style={{ width: '100%', background: '#1B1B1F', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '9px 12px', fontSize: '13.5px', color: '#FFFFFF', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = '#3DD68C'; e.target.style.boxShadow = '0 0 0 3px rgba(61,214,140,0.10)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 500, color: '#787F85', marginBottom: '8px' }}>Avatar colour</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '26px', height: '26px', borderRadius: '50%', background: c,
                    border: color === c ? '2px solid #FFFFFF' : '2px solid transparent',
                    cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                    transition: 'box-shadow 0.1s',
                  }}
                >
                  {color === c && <Check size={12} color="#000" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '14px', borderRadius: '8px', background: 'rgba(242,102,105,0.10)', border: '1px solid rgba(242,102,105,0.25)', padding: '9px 12px', fontSize: '13px', color: '#F26669' }}>{error}</div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '22px' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', borderRadius: '7px', background: 'transparent', border: '1px solid rgba(255,255,255,0.10)', color: '#787F85', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding: '8px 18px', borderRadius: '7px', background: '#3DD68C', border: 'none', color: '#0c1f16', fontSize: '13px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'inherit' }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
