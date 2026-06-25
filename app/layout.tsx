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
      <head>
        {/* Apply saved theme before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('lti-theme');
              if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
            } catch(e) {}
          })();
        ` }} />
      </head>
      <body>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
