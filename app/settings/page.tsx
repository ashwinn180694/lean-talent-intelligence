import AppShell from '@/components/AppShell';
import { createSupabaseServer } from '@/lib/supabase-server';

export default async function SettingsPage() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AppShell>
      <div className="p-6 max-w-lg space-y-6">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Your account details</p>
        </div>
        <div className="card p-5 space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">Email</p>
            <p className="text-sm text-slate-800">{user?.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5">User ID</p>
            <p className="text-xs text-slate-400 font-mono">{user?.id || '—'}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
