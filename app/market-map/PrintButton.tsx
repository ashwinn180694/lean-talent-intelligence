'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '7px',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'border-color 0.15s, color 0.15s',
        fontFamily: 'inherit',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--hover-border)';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
      Export as image
    </button>
  );
}
