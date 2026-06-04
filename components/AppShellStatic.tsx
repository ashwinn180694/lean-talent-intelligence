'use client';
import FastSidebar from './FastSidebar';
export default function AppShellStatic({ children }: { children: React.ReactNode }) {
  return <div className="shell"><FastSidebar/><main className="main">{children}</main></div>;
}
