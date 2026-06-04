import AppShellStatic from '@/components/AppShellStatic';
import CompanyDetailClient from '@/components/CompanyDetailClient';

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  return <AppShellStatic>
    <CompanyDetailClient companyId={params.id} />
  </AppShellStatic>;
}
