import { describe, it, expect } from 'vitest';
import {
  TEA_VARIETIES,
  PASTRY_ITEMS,
  TEA_QUESTIONS,
  SCENARIO_CARDS,
  COSMETIC_CATALOG,
  APPEARANCE_PRESETS,
  ROOM_THEMES
} from '../src/index.js';

describe('Tea Lore and Content Data Integrity', () => {
  it('has at least 6 unique tea varieties with full descriptions', () => {
    expect(TEA_VARIETIES.length).toBeGreaterThanOrEqual(6);
    const ids = new Set(TEA_VARIETIES.map(t => t.id));
    expect(ids.size).toBe(TEA_VARIETIES.length);
    for (const t of TEA_VARIETIES) {
      expect(t.name).toBeTruthy();
      expect(t.aromaProfile).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.recommendedTopic).toBeTruthy();
    }
  });

  it('has at least 12 unique pastry items with tea pairing notes', () => {
    expect(PASTRY_ITEMS.length).toBeGreaterThanOrEqual(12);
    const ids = new Set(PASTRY_ITEMS.map(p => p.id));
    expect(ids.size).toBe(PASTRY_ITEMS.length);
    for (const p of PASTRY_ITEMS) {
      expect(p.name).toBeTruthy();
      expect(p.flavor).toBeTruthy();
      expect(p.teaPairingNote).toBeTruthy();
    }
  });

  it('has at least 30 conversation questions categorized', () => {
    expect(TEA_QUESTIONS.length).toBeGreaterThanOrEqual(30);
    const ids = new Set(TEA_QUESTIONS.map(q => q.id));
    expect(ids.size).toBe(TEA_QUESTIONS.length);
    for (const q of TEA_QUESTIONS) {
      expect(q.text.length).toBeGreaterThan(10);
      expect(q.suggestedPrompt).toBeTruthy();
      expect(['SỞ THÍCH', 'TÍNH CÁCH', 'LỐI SỐNG', 'ƯỚC MƠ', 'GIAO TIẾP']).toContain(q.category);
    }
  });

  it('has at least 18 scenario cards with dilemma and 3 distinct options', () => {
    expect(SCENARIO_CARDS.length).toBeGreaterThanOrEqual(18);
    const ids = new Set(SCENARIO_CARDS.map(s => s.id));
    expect(ids.size).toBe(SCENARIO_CARDS.length);
    for (const s of SCENARIO_CARDS) {
      expect(s.title).toBeTruthy();
      expect(s.context).toBeTruthy();
      expect(s.dilemma).toBeTruthy();
      expect(s.optionA).toBeTruthy();
      expect(s.optionB).toBeTruthy();
      expect(s.optionC).toBeTruthy();
    }
  });

  it('has at least 12 cosmetic catalog items and 8 appearance presets', () => {
    expect(COSMETIC_CATALOG.length).toBeGreaterThanOrEqual(12);
    expect(APPEARANCE_PRESETS.length).toBeGreaterThanOrEqual(8);
    expect(ROOM_THEMES.length).toBe(3);
  });
});
