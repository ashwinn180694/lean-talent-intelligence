'use client';

import { useEffect, useState } from 'react';
import { GitCommitHorizontal } from 'lucide-react';
import { supabase } from '@/lib/supabase-browser';

type Change = {
  id: string;
  old_tier: string | null;
  new_tier: string;
  changer_email: string | null;
  created_at: string;
};

function tierColor(tier: string | null) {
  if (tier === 'Tier 1') return '#3DD68C';
  if (tier === 'Tier 2') return '#46B8D8';
  if (tier === 'Tier 3') return '#787F85';
  return '#5b6066';
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

export default function TierHistory({ companyId }: { companyId: string }) {
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('tier_changes')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setChanges((data || []) as Change[]);
        setLoading(false);
      });
  }, [companyId]);

  if (loading || changes.length === 0) return null;

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
        <GitCommitHorizontal size={13} style={{ color: '#5b6066' }} />
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#5b6066', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Tier history
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {changes.map(ch => (
          <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            {ch.old_tier ? (
              <span style={{ color: tierColor(ch.old_tier), fontWeight: 500 }}>{ch.old_tier}</span>
            ) : (
              <span style={{ color: '#5b6066' }}>—</span>
            )}
            <span style={{ color: '#5b6066' }}>→</span>
            <span style={{ color: tierColor(ch.new_tier), fontWeight: 600 }}>{ch.new_tier}</span>
            <span style={{ color: '#5b6066', marginLeft: 'auto' }}>
              {ch.changer_email?.split('@')[0] || 'team'} · {timeAgo(ch.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
