'use client';
import FastSidebar from './FastSidebar';
import GlobalSearch from './GlobalSearch';
export default function AppShellStatic({ children }: { children: React.ReactNode }) {
  return <div className="shell"><FastSidebar/><main className="main"><GlobalSearch />{children}</main></div>;
}
