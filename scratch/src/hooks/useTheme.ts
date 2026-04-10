import { useEffect } from 'react';
import { BusinessCategory, useApp } from '../store/AppContext';
import { DESIGN_TOKENS } from '../config/designTokens';

export function useTheme(category?: BusinessCategory) {
  const { theme } = useApp();

  useEffect(() => {
    const validCategory = category || 'other';
    const tokens = DESIGN_TOKENS[validCategory] || DESIGN_TOKENS.other;

    const root = document.documentElement;
    const isLight = theme === 'light';
    
    // Apply font
    root.style.setProperty('--font-sans', tokens.fontFamily);
    
    // Apply colors with intelligent fallback for light/dark modes
    // If the category token is naturally dark, and we are in light mode, we should ideally have a light variant
    // For now, let's just make sure we set the base variables
    root.style.setProperty('--color-primary', tokens.colors.primary);
    root.style.setProperty('--color-primary-dark', tokens.colors.primaryDark);
    root.style.setProperty('--color-primary-light', tokens.colors.primaryLight);
    root.style.setProperty('--color-accent', tokens.colors.accent);
    
    // Dynamic background and card adjustment if theme is explicitly set to light
    if (isLight) {
      root.style.setProperty('--color-bg', '#F8FAFC');
      root.style.setProperty('--color-card', '#FFFFFF');
      root.style.setProperty('--color-card-2', '#F1F5F9');
      root.style.setProperty('--color-text', '#334155');
      root.style.setProperty('--color-text-dim', '#64748B');
      root.style.setProperty('--color-border', '#E2E8F0');
    } else {
      root.style.setProperty('--color-bg', tokens.colors.backgroundBase);
      root.style.setProperty('--color-card', tokens.colors.cardPrimary);
      root.style.setProperty('--color-card-2', tokens.colors.cardSecondary);
      root.style.setProperty('--color-text', tokens.colors.textBase);
      root.style.setProperty('--color-text-dim', tokens.colors.textMuted);
      root.style.setProperty('--color-border', 'rgba(255,255,255,0.1)');
    }

    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', isLight ? '#F9FAFB' : tokens.colors.backgroundBase);

  }, [category, theme]);
}
