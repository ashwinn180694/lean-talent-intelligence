import AppShell from '@/components/AppShell';
import CompanyDetailClient from '@/components/CompanyDetailClient';

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  return (
    <AppShell>
      <CompanyDetailClient companyId={params.id} />
    </AppShell>
  );
}
