'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, X, Send, Sparkles, RotateCcw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Which Tier 1 companies are in payments?',
  'Best companies to source a Head of Compliance',
  'Series B companies in UAE with fit ≥7',
  'Compare Fireblocks and BitGo',
  'Which sectors have the most high-fit companies?',
];

export default function AIChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput('');

    const next: Message[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setStreaming(true);

    // Add empty assistant message to stream into
    setMessages(m => [...m, { role: 'assistant', content: '' }]);

    try {
      abortRef.current = new AbortController();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error('Request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages(m => {
          const updated = [...m];
          updated[updated.length - 1] = { role: 'assistant', content: accumulated };
          return updated;
        });
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setMessages(m => {
          const updated = [...m];
          updated[updated.length - 1] = { role: 'assistant', content: 'Something went wrong. Please try again.' };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
    }
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([]);
    setInput('');
    setStreaming(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="AI Assistant"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 200,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: open ? 'var(--surface)' : 'var(--green)',
          border: open ? '1px solid var(--border)' : 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.2,0.8,0.2,1)',
          color: open ? 'var(--text-muted)' : 'var(--green-text)',
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; }}
      >
        {open ? <X size={18} /> : <Sparkles size={18} />}
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            zIndex: 199,
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '520px',
            maxHeight: 'calc(100vh - 120px)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: '0 16px 48px rgba(0,0,0,0.35)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'panelIn 0.18s cubic-bezier(0.2,0.8,0.2,1) both',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '7px',
                background: 'var(--green-12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Sparkles size={14} color="var(--green)" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-hi)' }}>Talent Assistant</p>
                <p style={{ margin: 0, fontSize: '10.5px', color: 'var(--text-faint)' }}>Powered by Llama 3.3 · Groq</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={reset}
                title="Clear chat"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', display: 'flex', padding: '4px',
                  borderRadius: '5px', transition: 'color 0.12s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-hi)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isEmpty ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'var(--green-12)', margin: '0 auto 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <MessageSquare size={20} color="var(--green)" />
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '13.5px', fontWeight: 600, color: 'var(--text-hi)' }}>Ask about your talent universe</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-faint)' }}>Questions about companies, sectors, fit scores, and more</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      style={{
                        textAlign: 'left', padding: '8px 12px', borderRadius: '8px',
                        background: 'var(--app-bg)', border: '1px solid var(--border)',
                        fontSize: '12px', color: 'var(--text-mid)', cursor: 'pointer',
                        transition: 'all 0.12s', fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-accent)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-hi)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--text-mid)';
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '9px 13px',
                      borderRadius: m.role === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                      background: m.role === 'user' ? 'var(--green)' : 'var(--app-bg)',
                      color: m.role === 'user' ? 'var(--green-text)' : 'var(--text-hi)',
                      fontSize: '13px',
                      lineHeight: '1.55',
                      border: m.role === 'assistant' ? '1px solid var(--border)' : 'none',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {m.content || (
                      <span style={{ display: 'flex', gap: '3px', alignItems: 'center', padding: '2px 0' }}>
                        {[0,1,2].map(j => (
                          <span key={j} style={{
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: 'var(--text-faint)',
                            animation: `dotPulse 1.2s ease-in-out ${j * 0.2}s infinite`,
                            display: 'inline-block',
                          }} />
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 14px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: '8px', alignItems: 'center',
            flexShrink: 0,
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask anything about your companies…"
              disabled={streaming}
              style={{
                flex: 1, background: 'var(--app-bg)', border: '1px solid var(--border)',
                borderRadius: '8px', padding: '8px 12px', fontSize: '13px',
                color: 'var(--text-hi)', outline: 'none', fontFamily: 'inherit',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--green)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || streaming}
              style={{
                width: '34px', height: '34px', borderRadius: '8px',
                background: input.trim() && !streaming ? 'var(--green)' : 'var(--app-bg)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed',
                color: input.trim() && !streaming ? 'var(--green-text)' : 'var(--text-faint)',
                transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
