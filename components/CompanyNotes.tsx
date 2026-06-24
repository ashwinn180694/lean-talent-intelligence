'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageSquare, Trash2, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';
import UserAvatar, { type Profile } from './UserAvatar';

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

// Render note content with highlighted @mentions
function NoteContent({ content, profiles }: { content: string; profiles: Profile[] }) {
  const parts = content.split(/(@\w[\w.]*)/g);
  return (
    <p style={{ margin: 0, fontSize: '13px', color: '#FFFFFF', lineHeight: '1.55', whiteSpace: 'pre-wrap' }}>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          const name = part.slice(1).toLowerCase();
          const matched = profiles.find(p =>
            (p.display_name || '').toLowerCase().replace(/\s+/g, '') === name ||
            (p.email || '').split('@')[0].toLowerCase() === name
          );
          const color = matched?.avatar_color || '#3DD68C';
          return (
            <span key={i} style={{ color, fontWeight: 500 }}>{part}</span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

export default function CompanyNotes({ companyId }: { companyId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  // @mention state
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPos, setMentionPos] = useState<number | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<Profile[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
    });
    fetchNotes();
    // Load all team profiles for @mention
    supabase.from('profiles').select('*').then(({ data }) => {
      if (data) setProfiles(data as Profile[]);
    });
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

  // Handle textarea input — detect @ mentions
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setContent(val);

    const cursor = e.target.selectionStart ?? val.length;
    const textUpToCursor = val.slice(0, cursor);
    const match = textUpToCursor.match(/@(\w*)$/);

    if (match) {
      const query = match[1].toLowerCase();
      setMentionQuery(query);
      setMentionPos(cursor - match[0].length);
      const filtered = profiles.filter(p => {
        const name = (p.display_name || '').toLowerCase();
        const emailPart = p.email.split('@')[0].toLowerCase();
        return name.includes(query) || emailPart.includes(query);
      }).slice(0, 5);
      setMentionSuggestions(filtered);
      setSelectedSuggestion(0);
    } else {
      setMentionSuggestions([]);
      setMentionPos(null);
    }
  }

  function insertMention(profile: Profile) {
    if (mentionPos === null) return;
    const mentionText = profile.display_name
      ? `@${profile.display_name.replace(/\s+/g, '')} `
      : `@${profile.email.split('@')[0]} `;
    const newContent = content.slice(0, mentionPos) + mentionText + content.slice(textareaRef.current?.selectionStart ?? content.length);
    setContent(newContent);
    setMentionSuggestions([]);
    setMentionPos(null);
    setTimeout(() => {
      textareaRef.current?.focus();
      const pos = mentionPos + mentionText.length;
      textareaRef.current?.setSelectionRange(pos, pos);
    }, 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedSuggestion(s => Math.min(s + 1, mentionSuggestions.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedSuggestion(s => Math.max(s - 1, 0)); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(mentionSuggestions[selectedSuggestion]); return; }
      if (e.key === 'Escape') { setMentionSuggestions([]); return; }
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addNote(e as any);
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
      setMentionSuggestions([]);
      textareaRef.current?.focus();
    }
  }

  async function deleteNote(id: string) {
    await supabase.from('company_notes').delete().eq('id', id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  function profileForEmail(email: string | null): Profile {
    const found = profiles.find(p => p.email === email);
    return found || { id: '', email: email || '', display_name: null, avatar_color: '#3DD68C' };
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
      <form onSubmit={addNote} style={{ marginBottom: '16px', position: 'relative' }}>
        <div style={{
          background: '#1B1B1F', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '9px', overflow: 'visible',
          transition: 'border-color 0.12s',
        }}
          onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(61,214,140,0.35)')}
          onBlurCapture={e => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }
          }}
        >
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Add a note… type @ to mention a teammate (⌘↵ to save)"
            rows={3}
            style={{
              width: '100%', background: 'transparent', border: 'none', outline: 'none',
              padding: '10px 12px', fontSize: '13px', color: '#FFFFFF',
              fontFamily: 'inherit', resize: 'none', lineHeight: '1.5', boxSizing: 'border-box',
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

        {/* @mention dropdown */}
        {mentionSuggestions.length > 0 && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, marginBottom: '6px',
            background: '#212329', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '9px', overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            zIndex: 50, minWidth: '220px',
          }}>
            {mentionSuggestions.map((p, i) => (
              <button
                key={p.id}
                type="button"
                onMouseDown={e => { e.preventDefault(); insertMention(p); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 12px', background: i === selectedSuggestion ? 'rgba(61,214,140,0.08)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  borderBottom: i < mentionSuggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <UserAvatar profile={p} size={24} />
                <div>
                  <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 500, color: '#FFFFFF' }}>
                    {p.display_name || p.email.split('@')[0]}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#5b6066' }}>{p.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
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
          {notes.map(note => {
            const authorProfile = profileForEmail(note.author_email);
            const displayName = authorProfile.display_name || note.author_email?.split('@')[0].replace(/[._-]+/g, ' ') || 'Team member';
            return (
              <div key={note.id} style={{
                background: '#1B1B1F', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '9px', padding: '11px 13px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '7px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserAvatar profile={authorProfile} size={22} />
                    <span style={{ fontSize: '12px', color: '#C8CAD0', fontWeight: 500 }}>{displayName}</span>
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
                <NoteContent content={note.content} profiles={profiles} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
