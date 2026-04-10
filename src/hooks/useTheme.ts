import { useState, useCallback, useEffect } from 'react';

type Theme = 'light' | 'dark';

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore
  }
  return 'dark';
}

function useTheme() {
  const [resolvedTheme, setResolvedTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const toggleTheme = useCallback(() => {
    setResolvedTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return { theme: resolvedTheme, resolvedTheme, toggleTheme };
}

export { useTheme };
export type { Theme };
