'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'warm' | 'dark' | 'slate';

const THEMES: Theme[] = ['warm', 'dark', 'slate'];

const THEME_META: Record<Theme, { label: string; dot: string }> = {
  warm:  { label: 'Warm Refined', dot: '#c47e3a' },
  dark:  { label: 'Obsidian Dark', dot: '#7c74ff' },
  slate: { label: 'Slate Pro',     dot: '#3b82f6' },
};

interface ThemeCtx {
  theme: Theme;
  setTheme: (t: Theme) => void;
  cycleTheme: () => void;
  meta: typeof THEME_META;
}

const Ctx = createContext<ThemeCtx>({
  theme: 'warm',
  setTheme: () => {},
  cycleTheme: () => {},
  meta: THEME_META,
});

export function useTheme() {
  return useContext(Ctx);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('warm');

  useEffect(() => {
    const stored = (localStorage.getItem('lean-theme') as Theme) || 'warm';
    applyTheme(stored);
    setThemeState(stored);
  }, []);

  function applyTheme(t: Theme) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('lean-theme', t);
  }

  function setTheme(t: Theme) {
    setThemeState(t);
    applyTheme(t);
  }

  function cycleTheme() {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
  }

  return (
    <Ctx.Provider value={{ theme, setTheme, cycleTheme, meta: THEME_META }}>
      {children}
    </Ctx.Provider>
  );
}
