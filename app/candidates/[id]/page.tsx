import AppShellStatic from '@/components/AppShellStatic';
import CandidateDetailClient from '@/components/CandidateDetailClient';

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  return <AppShellStatic>
    <CandidateDetailClient candidateId={params.id} />
  </AppShellStatic>;
}
