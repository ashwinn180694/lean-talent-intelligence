'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

interface WatchlistButtonProps {
  companyId: string;
  initialWatched: boolean;
}

export default function WatchlistButton({ companyId, initialWatched }: WatchlistButtonProps) {
  const [watched, setWatched] = useState(initialWatched);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    // Optimistic update
    setWatched(prev => !prev);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Revert if no user
        setWatched(prev => !prev);
        return;
      }

      if (!watched) {
        // INSERT
        const { error } = await supabase
          .from('watchlists')
          .insert({ user_id: user.id, company_id: companyId });
        if (error) setWatched(prev => !prev);
      } else {
        // DELETE
        const { error } = await supabase
          .from('watchlists')
          .delete()
          .eq('user_id', user.id)
          .eq('company_id', companyId);
        if (error) setWatched(prev => !prev);
      }
    } catch {
      setWatched(prev => !prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      title={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '50%',
        cursor: loading ? 'default' : 'pointer',
        padding: 0,
        opacity: loading ? 0.6 : 1,
        transition: 'opacity 0.15s, border-color 0.15s, box-shadow 0.15s',
        zIndex: 2,
      }}
      onMouseEnter={e => {
        if (!loading) {
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--hover-border)';
          (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px var(--hover-shadow)';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
      }}
    >
      <Heart
        size={13}
        style={{
          color: watched ? 'var(--brand)' : 'var(--text-muted)',
          fill: watched ? 'var(--brand)' : 'none',
          transition: 'fill 0.15s, color 0.15s',
          flexShrink: 0,
        }}
      />
    </button>
  );
}
