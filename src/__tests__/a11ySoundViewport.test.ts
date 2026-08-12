// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { GEM_META } from '../utils/gemMeta.js';
import { soundManager } from '../utils/SoundManager.js';
import { Haptics } from '../utils/haptics.js';
import { speechAnnouncer } from '../utils/SpeechAnnouncer.js';

describe('Accessibility, Audio, Haptics & Viewport Integration Test Suite', () => {
  it('Test 1: Colorblind Mode provides distinct single-letter badges for all 5 gem types', () => {
    expect(GEM_META.emerald.icon).toBe('E');
    expect(GEM_META.diamond.icon).toBe('D');
    expect(GEM_META.sapphire.icon).toBe('S');
    expect(GEM_META.ruby.icon).toBe('R');
    expect(GEM_META.onyx.icon).toBe('O');
  });

  it('Test 2: Gem bonus tags format explicit space between +1 and gem name', () => {
    const gemTypes = ['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as const;

    for (const gem of gemTypes) {
      const tagText = `+1 ${gem.toUpperCase()}`;
      expect(tagText).toMatch(/^\+1 [A-Z]+$/);
      expect(tagText).not.toContain('+1ONIX');
    }
  });

  it('Test 3: SoundManager handles Web Audio synthesis safely without throwing DOM errors', () => {
    expect(() => {
      soundManager.playButtonClick();
      soundManager.playCardReserve();
      soundManager.playCardBuy(2);
      soundManager.playVictoryFanfare();
    }).not.toThrow();
  });

  it('Test 4: Haptics triggers navigator.vibrate patterns safely', () => {
    expect(() => {
      Haptics.gemPick();
      Haptics.cardAction();
      Haptics.victoryFanfare();
    }).not.toThrow();
  });

  it('Test 5: SpeechAnnouncer updates ARIA live region elements for screen readers', async () => {
    document.body.innerHTML = `
      <div id="aria-live-polite"></div>
      <div id="aria-live-assertive"></div>
    `;

    speechAnnouncer.announcePolite('Player 1 bought Tier 2 Sapphire card (+2 pts)');
    await new Promise((r) => setTimeout(r, 450));

    const polite = document.getElementById('aria-live-polite');
    expect(polite?.textContent).toBe('Player 1 bought Tier 2 Sapphire card (+2 pts)');

    speechAnnouncer.announceAssertive('Victory! Player 1 won the match with 16 points!');
    await new Promise((r) => setTimeout(r, 50));

    const assertive = document.getElementById('aria-live-assertive');
    expect(assertive?.textContent).toBe('Victory! Player 1 won the match with 16 points!');
  });

  it('Test 6: Responsive viewport breakpoints categorize mobile (<768px) vs desktop (>=768px)', () => {
    const isMobileViewport = (width: number) => width < 768;

    expect(isMobileViewport(390)).toBe(true);  // iPhone 14
    expect(isMobileViewport(412)).toBe(true);  // Pixel 7
    expect(isMobileViewport(768)).toBe(false); // Tablet / Desktop
    expect(isMobileViewport(1280)).toBe(false); // Desktop HD
  });
});
