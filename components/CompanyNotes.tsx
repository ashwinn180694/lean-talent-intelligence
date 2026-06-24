'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Trash2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

type Note = {
  id: string;
  content: string;
  author_email: string | null;
  created_at: string;
  user_id: string | null;
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function initials(email: string | null) {
  if (!email) return '?';
  const name = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
  const parts = name.split(' ').filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || email[0].toUpperCase();
}

export default function CompanyNotes({ companyId }: { companyId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
    });
    fetchNotes();
  }, [companyId]);

  async function fetchNotes() {
    setLoading(true);
    const { data } = await supabase
      .from('company_notes')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    setNotes((data || []) as Note[]);
    setLoading(false);
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || !userId) return;
    setSaving(true);
    const { data, error } = await supabase.from('company_notes').insert({
      company_id: companyId,
      user_id: userId,
      author_email: userEmail,
      content: text,
    }).select().single();
    setSaving(false);
    if (!error && data) {
      setNotes(prev => [data as Note, ...prev]);
      setContent('');
      textareaRef.current?.focus();
    }
  }

  async function deleteNote(id: string) {
    await supabase.from('company_notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '14px' }}>
        <MessageSquare size={14} style={{ color: '#3DD68C' }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#787F85', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Team Notes
        </span>
        {notes.length > 0 && (
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: '10px',
            background: 'rgba(61,214,140,0.12)', color: '#3DD68C',
            borderRadius: '99px', padding: '1px 7px',
          }}>{notes.length}</span>
        )}
      </div>

      {/* Add note */}
      <form onSubmit={addNote} style={{ marginBottom: '16px' }}>
        <div style={{
          background: '#1B1B1F', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '9px', overflow: 'hidden',
          transition: 'border-color 0.12s',
        }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(61,214,140,0.35)')}
          onBlurCapture={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
        >
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote(e as any); }}
            placeholder="Add a note about this company… (⌘↵ to save)"
            rows={3}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              padding: '10px 12px', fontSize: '13px', color: '#FFFFFF',
              fontFamily: 'inherit', resize: 'none', lineHeight: '1.5',
            }}
          />
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            padding: '6px 10px', borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            <button
              type="submit"
              disabled={!content.trim() || saving}
              className="btn-primary"
              style={{ gap: '5px', opacity: !content.trim() ? 0.4 : 1, padding: '6px 14px', fontSize: '12.5px' }}
            >
              <Send size={12} />
              {saving ? 'Saving…' : 'Add note'}
            </button>
          </div>
        </div>
      </form>

      {/* Notes list */}
      {loading ? (
        <p style={{ fontSize: '13px', color: '#5b6066', textAlign: 'center', padding: '16px 0' }}>Loading…</p>
      ) : notes.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#5b6066', textAlign: 'center', padding: '16px 0' }}>
          No notes yet — be the first to add one.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notes.map(note => (
            <div key={note.id} style={{
              background: '#1B1B1F', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '9px', padding: '11px 13px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(61,214,140,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#3DD68C', fontSize: '9px', fontWeight: 700,
                  }}>
                    {initials(note.author_email)}
                  </div>
                  <span style={{ fontSize: '12px', color: '#C8CAD0', fontWeight: 500 }}>
                    {note.author_email?.split('@')[0].replace(/[._-]+/g, ' ') || 'Team member'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#5b6066' }}>{timeAgo(note.created_at)}</span>
                </div>
                {note.user_id === userId && (
                  <button
                    onClick={() => deleteNote(note.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: '#5b6066', display: 'flex', transition: 'color 0.12s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#F26669')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#5b6066')}
                    title="Delete note"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#FFFFFF', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>
                {note.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
