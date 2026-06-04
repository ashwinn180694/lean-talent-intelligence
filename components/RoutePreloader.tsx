'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ROUTES = ['/dashboard', '/companies', '/candidates', '/talent-pools', '/settings'];

export function usePreloadRoutes() {
  const router = useRouter();
  useEffect(() => {
    const timer = window.setTimeout(() => {
      ROUTES.forEach((route) => router.prefetch(route));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [router]);

  return (route: string) => router.prefetch(route);
}
