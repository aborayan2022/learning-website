import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../app/store/theme.store';

describe('Theme Store', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light', resolvedTheme: 'light' });
    document.documentElement.classList.remove('dark');
  });

  it('should have light as default resolved theme after reset', () => {
    const state = useThemeStore.getState();
    expect(state.resolvedTheme).toBe('light');
  });

  it('should set theme to dark', () => {
    useThemeStore.getState().setTheme('dark');
    const state = useThemeStore.getState();
    expect(state.theme).toBe('dark');
    expect(state.resolvedTheme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should set theme to light', () => {
    useThemeStore.getState().setTheme('dark');
    useThemeStore.getState().setTheme('light');
    const state = useThemeStore.getState();
    expect(state.theme).toBe('light');
    expect(state.resolvedTheme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should toggle theme', () => {
    useThemeStore.setState({ theme: 'light', resolvedTheme: 'light' });
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');

    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
  });
});
