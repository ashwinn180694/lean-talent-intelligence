import AppShellStatic from '@/components/AppShellStatic';
import PageSkeleton from '@/components/PageSkeleton';
export default function Loading() { return <AppShellStatic><div className="topbar"><div><div className="skeleton-line wide"/><div className="skeleton-line"/></div></div><PageSkeleton /></AppShellStatic>; }
