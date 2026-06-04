import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import AppShell from '@/components/AppShell';
import Link from 'next/link';

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies });
  const [{ count: companies }, { count: candidates }, { count: pools }, { count: tier1 }] = await Promise.all([
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('candidates').select('*', { count: 'exact', head: true }),
    supabase.from('talent_pools').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }).eq('priority_tier', 'Tier 1')
  ]);
  const [{ data: recent }, { data: activity }] = await Promise.all([
    supabase.from('candidates_view').select('*').order('created_at', { ascending: false }).limit(6),
    supabase.from('activity_feed').select('*').order('created_at', { ascending: false }).limit(8)
  ]);
  return <AppShell>
    <div className="topbar"><div><h1 className="h1">Dashboard</h1><p className="muted">Shared recruiting intelligence for Lean Talent Partners.</p></div></div>
    <div className="grid grid-4">
      <Link className="card metric-card" href="/companies"><div className="muted">Companies</div><div className="stat">{companies ?? 0}</div><span className="metric-hint">Open companies</span></Link>
      <Link className="card metric-card" href="/companies"><div className="muted">Tier 1 Companies</div><div className="stat">{tier1 ?? 0}</div><span className="metric-hint">Filter Tier 1</span></Link>
      <Link className="card metric-card" href="/candidates"><div className="muted">Candidates</div><div className="stat">{candidates ?? 0}</div><span className="metric-hint">Open candidates</span></Link>
      <Link className="card metric-card" href="/talent-pools"><div className="muted">Talent Pools</div><div className="stat">{pools ?? 0}</div><span className="metric-hint">Open pools</span></Link>
    </div>
    <div className="grid grid-2" style={{ marginTop: 18 }}>
      <div className="card">
        <h2>Recently added candidates</h2>
        <table className="table"><thead><tr><th>Name</th><th>Company</th><th>Function</th><th>Status</th></tr></thead><tbody>
          {(recent || []).map((c: any) => <tr key={c.id}><td><Link className="table-link" href={`/candidates/${c.id}`}>{c.full_name}</Link></td><td>{c.company_id ? <Link className="table-link" href={`/companies/${c.company_id}`}>{c.company_name}</Link> : c.company_name}</td><td>{c.function_area}</td><td><span className="status-pill">{c.status}</span></td></tr>)}
        </tbody></table>
      </div>
      <div className="card">
        <h2>Activity feed</h2>
        <div className="activity-list">
          {(activity || []).length ? (activity || []).map((item: any) => <div key={item.id} className="activity-item"><strong>{item.actor_email || 'Someone'}</strong> {item.action} <span>{item.entity_name}</span><div className="muted">{new Date(item.created_at).toLocaleString()}</div></div>) : <p className="muted">No activity yet. Edits, notes, and new candidates will appear here.</p>}
        </div>
      </div>
    </div>
  </AppShell>;
}
