import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lean Market',
  description: 'Talent intelligence platform for Lean Technologies'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
