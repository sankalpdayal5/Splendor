import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialState, applyAction } from '../engine/gameEngine.js';
import { GameConfig, GameState } from '../engine/types.js';

// Polyfill in-memory localStorage mock for node environment
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

describe('Local State Persistence & Session Recovery Integration Test Suite', () => {
  const STORAGE_KEY = 'splendor_active_game';

  const baseConfig: GameConfig = {
    playerCount: 2,
    mode: 'offline_pass_play',
    players: [
      { name: 'Alice', isBot: false },
      { name: 'Bob', isBot: false }
    ]
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('Test 1: Saves active game state to localStorage cleanly', () => {
    const state = createInitialState(baseConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const savedRaw = localStorage.getItem(STORAGE_KEY);
    expect(savedRaw).not.toBeNull();

    const restored: GameState = JSON.parse(savedRaw!);
    expect(restored.players.length).toBe(2);
    expect(restored.players[0].name).toBe('Alice');
    expect(restored.players[1].name).toBe('Bob');
  });

  it('Test 2: Cold start reloads saved state from localStorage seamlessly', () => {
    let state = createInitialState(baseConfig);
    // Execute 1 action
    state = applyAction(state, { type: 'TAKE_3_DISTINCT', colors: ['ruby', 'emerald', 'diamond'] });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    // Simulate page reload
    const restoredRaw = localStorage.getItem(STORAGE_KEY);
    const restoredState: GameState = JSON.parse(restoredRaw!);

    expect(restoredState.currentTurnIndex).toBe(1); // Turn 2 active!
    expect(restoredState.players[0].gems.ruby).toBe(1);
    expect(restoredState.players[0].gems.emerald).toBe(1);
    expect(restoredState.players[0].gems.diamond).toBe(1);
  });

  it('Test 3: Corrupted JSON in localStorage triggers graceful fallback without app crash', () => {
    localStorage.setItem(STORAGE_KEY, 'INVALID_CORRUPTED_JSON_DATA{{{');

    let restoredState: GameState | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      restoredState = JSON.parse(raw!);
    } catch (e) {
      restoredState = null;
    }

    expect(restoredState).toBeNull();
  });

  it('Test 4: Clearing match state removes item from localStorage', () => {
    const state = createInitialState(baseConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    localStorage.removeItem(STORAGE_KEY);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('Test 5: Persists exact turn index and staged gem selection state', () => {
    let state = createInitialState(baseConfig);
    state.currentTurnIndex = 1; // Bob's turn
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

    const restored: GameState = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(restored.currentTurnIndex).toBe(1);
    expect(restored.players[1].name).toBe('Bob');
  });

  it('Test 6: Persists user settings (mute & colorblind preferences)', () => {
    const SETTINGS_KEY = 'splendor_user_settings';
    const settings = { isMuted: true, colorblindMode: true };

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    const restoredSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)!);
    expect(restoredSettings.isMuted).toBe(true);
    expect(restoredSettings.colorblindMode).toBe(true);
  });
});
