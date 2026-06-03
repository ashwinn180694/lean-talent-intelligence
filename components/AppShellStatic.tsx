'use client';
import Link from 'next/link';
export default function AppShellStatic({ children }: { children: React.ReactNode }) {return <div className="shell"><aside className="sidebar"><div className="brand">Lean Talent Intelligence</div><nav className="nav"><Link href="/dashboard">Home</Link><Link href="/companies">Companies</Link><Link href="/candidates">Candidates</Link><Link href="/talent-pools">Talent Pools</Link><Link href="/settings">Settings</Link></nav></aside><main className="main">{children}</main></div>}
