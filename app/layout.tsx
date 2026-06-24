import type { Metadata } from 'next';
import './globals.css';
import NavigationProgress from '@/components/NavigationProgress';

export const metadata: Metadata = {
  title: 'Lean Talent Intelligence',
  description: 'Talent intelligence platform for Lean Technologies'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
