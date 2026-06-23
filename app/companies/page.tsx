import AppShell from '@/components/AppShell';
import CompaniesGrid from '@/components/CompaniesGrid';

// Server component: wraps the shell around the client-side grid
export default function CompaniesPage() {
  return (
    <AppShell>
      <CompaniesGrid />
    </AppShell>
  );
}
