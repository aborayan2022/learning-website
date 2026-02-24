import { describe, it, expect } from 'vitest';
import en from '../app/i18n/locales/en.json';
import ar from '../app/i18n/locales/ar.json';

/**
 * Recursively collect all leaf keys from a nested object
 */
function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...collectKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

describe('i18n Translation Files', () => {
  const enKeys = collectKeys(en);
  const arKeys = collectKeys(ar);

  it('should have the same number of keys in EN and AR', () => {
    expect(enKeys.length).toBe(arKeys.length);
  });

  it('should have all EN keys present in AR', () => {
    const arSet = new Set(arKeys);
    const missing = enKeys.filter((k) => !arSet.has(k));
    expect(missing).toEqual([]);
  });

  it('should have all AR keys present in EN', () => {
    const enSet = new Set(enKeys);
    const missing = arKeys.filter((k) => !enSet.has(k));
    expect(missing).toEqual([]);
  });

  it('should not have empty string values in EN', () => {
    const emptyKeys = enKeys.filter((key) => {
      const parts = key.split('.');
      let val: unknown = en;
      for (const p of parts) {
        val = (val as Record<string, unknown>)[p];
      }
      return val === '';
    });
    expect(emptyKeys).toEqual([]);
  });

  it('should not have empty string values in AR', () => {
    const emptyKeys = arKeys.filter((key) => {
      const parts = key.split('.');
      let val: unknown = ar;
      for (const p of parts) {
        val = (val as Record<string, unknown>)[p];
      }
      return val === '';
    });
    expect(emptyKeys).toEqual([]);
  });

  it('should have required top-level sections', () => {
    const requiredSections = ['common', 'nav', 'auth', 'home', 'teachers', 'payment', 'footer', 'settings', 'about', 'help', 'contact', 'privacy', 'terms'];
    for (const section of requiredSections) {
      expect(en).toHaveProperty(section);
      expect(ar).toHaveProperty(section);
    }
  });
});
