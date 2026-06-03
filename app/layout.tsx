import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lean Talent Intelligence',
  description: 'Internal talent intelligence platform for Lean Technologies'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
