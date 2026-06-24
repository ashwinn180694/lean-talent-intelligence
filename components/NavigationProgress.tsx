'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const prev = useRef(pathname);

  useEffect(() => {
    if (pathname !== prev.current) {
      prev.current = pathname;
      // Page arrived — flash complete then hide
      setDone(true);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setDone(false);
      }, 300);
    }
  }, [pathname]);

  // Show bar on link click
  useEffect(() => {
    function onAnchorClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || a.target === '_blank') return;
      clearTimeout(timerRef.current);
      setDone(false);
      setVisible(true);
    }
    document.addEventListener('click', onAnchorClick);
    return () => document.removeEventListener('click', onAnchorClick);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '2px',
      zIndex: 9999, pointerEvents: 'none',
    }}>
      <div style={{
        height: '100%',
        background: '#3DD68C',
        boxShadow: '0 0 8px #3DD68C88',
        borderRadius: '0 2px 2px 0',
        transition: done ? 'width 0.15s ease, opacity 0.2s ease' : 'none',
        width: done ? '100%' : undefined,
        opacity: done ? 0 : 1,
        animation: done ? 'none' : 'navProgress 1.8s cubic-bezier(0.1,0.6,0.3,1) forwards',
      }} />
    </div>
  );
}
