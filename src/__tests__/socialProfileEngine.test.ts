// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { getOrCreateUserProfile, recordMatchResult, saveUserProfile, AVATAR_OPTIONS } from '../utils/userProfile.js';
import { generateRoomInvitePayload } from '../utils/socialShare.js';
import { generateVictoryCardDataUrl } from '../utils/VictoryShareCard.js';

// Polyfill in-memory localStorage mock for node test runner
const store: Map<string, string> = new Map();
const mockLocalStorage = {
  getItem: (key: string) => store.get(key) || null,
  setItem: (key: string, value: string) => store.set(key, value),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear()
};

if (typeof globalThis.localStorage === 'undefined' || !globalThis.localStorage.clear) {
  (globalThis as any).localStorage = mockLocalStorage;
}

describe('User Profile & Social Share Engine Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Test 1: Creates default User Profile with Level 1, 1200 Elo, and default title', () => {
    const profile = getOrCreateUserProfile();

    expect(profile.name).toBe('Renaissance Merchant');
    expect(profile.elo).toBe(1200);
    expect(profile.level).toBe(1);
    expect(profile.matchesPlayed).toBe(0);
    expect(profile.achievements.length).toBe(6);
  });

  it('Test 2: Updates Elo, Level XP, and career stats after winning match', () => {
    let profile = getOrCreateUserProfile();

    profile = recordMatchResult(
      true, // won
      16,   // prestigePoints
      14,   // totalTurns
      { emerald: 3, diamond: 2, sapphire: 1, ruby: 0, onyx: 0 },
      1,    // nobles
      0     // reservedCards
    );

    expect(profile.wins).toBe(1);
    expect(profile.matchesPlayed).toBe(1);
    expect(profile.elo).toBe(1225); // +25 Elo
    expect(profile.xp).toBe(150);
    expect(profile.highestSingleGameScore).toBe(16);
    expect(profile.fastestWinTurns).toBe(14);
  });

  it('Test 3: Unlocks achievements (First Victory, Speed Merchant, Pure Strategy)', () => {
    let profile = getOrCreateUserProfile();

    profile = recordMatchResult(
      true, // won
      16,
      12,   // <15 turns -> unlocks Speed Merchant!
      { emerald: 2, diamond: 2, sapphire: 0, ruby: 0, onyx: 0 },
      0,
      0     // 0 reserved -> unlocks Pure Strategy!
    );

    const firstWinAch = profile.achievements.find((a) => a.id === 'first_win');
    const speedAch = profile.achievements.find((a) => a.id === 'speed_merchant');
    const pureAch = profile.achievements.find((a) => a.id === 'pure_strategy');

    expect(firstWinAch?.unlocked).toBe(true);
    expect(speedAch?.unlocked).toBe(true);
    expect(pureAch?.unlocked).toBe(true);
  });

  it('Test 4: Generates valid WhatsApp / Social Media room invite payload', () => {
    const payload = generateRoomInvitePayload('ROOM99');

    expect(payload.title).toContain('Splendor');
    expect(payload.text).toContain('ROOM99');
    expect(payload.url).toContain('room=ROOM99');
  });

  it('Test 5: Generates PNG Data URL for Victory Card Canvas', () => {
    const dataUrl = generateVictoryCardDataUrl({
      winnerName: 'Alice',
      prestigePoints: 16,
      totalTurns: 14,
      gemsOwned: { emerald: 2, diamond: 3, sapphire: 0, ruby: 1, onyx: 0 },
      cardsCount: 6,
      noblesCount: 1
    });

    expect(dataUrl).toContain('data:image/png;base64,');
  });

  it('Test 6: AVATAR_OPTIONS contains 12 Renaissance avatar choices', () => {
    expect(AVATAR_OPTIONS.length).toBe(12);
    expect(AVATAR_OPTIONS[0].icon).toBeDefined();
  });
});
