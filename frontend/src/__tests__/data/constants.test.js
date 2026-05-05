import { describe, it, expect } from 'vitest';
import { formatDate, EMOJI, IMG_BG } from '../../data/constants';

describe('formatDate', () => {
  it('formats a valid ISO date string', () => {
    expect(formatDate('2024-03-15T00:00:00.000Z')).toMatch(/Mar 2024/);
  });

  it('formats a JS Date object', () => {
    const d = new Date(2024, 5, 1); // June 1 2024 in local time
    expect(formatDate(d)).toMatch(/Jun 2024/);
  });

  it('returns empty string for falsy input', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('returns raw value if unparseable', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date');
  });
});

describe('EMOJI', () => {
  it('has entries for all categories', () => {
    const categories = ['Furniture', 'Textbooks', 'Electronics', 'Clothing', 'Appliances', 'Sports', 'Other'];
    categories.forEach(cat => {
      expect(EMOJI[cat]).toBeDefined();
    });
  });
});

describe('IMG_BG', () => {
  it('has gradient strings for all categories', () => {
    const categories = ['Furniture', 'Textbooks', 'Electronics', 'Clothing', 'Appliances', 'Sports', 'Other'];
    categories.forEach(cat => {
      expect(IMG_BG[cat]).toContain('linear-gradient');
    });
  });
});
