import { describe, it, expect } from 'vitest';
import { createInitialState, validateAction, applyAction, canAffordCard, resolveWinners } from '../gameEngine';
import { GameConfig } from '../types';

describe('Splendor Game Engine Core Unit Tests', () => {
  const config: GameConfig = {
    playerCount: 3,
    mode: 'offline_bot',
    players: [
      { name: 'Alice', isBot: false },
      { name: 'Bob', isBot: true },
      { name: 'Charlie', isBot: true }
    ]
  };

  it('initializes game bank scaling correctly for 3 players', () => {
    const state = createInitialState(config);
    expect(state.bank.emerald).toBe(5);
    expect(state.bank.diamond).toBe(5);
    expect(state.bank.gold).toBe(5);
    expect(state.nobles.length).toBe(4); // 3 + 1 nobles
    expect(state.players.length).toBe(3);
  });

  it('validates and applies taking 3 distinct gems', () => {
    const state = createInitialState(config);
    const action = { type: 'TAKE_3_DISTINCT' as const, colors: ['ruby', 'emerald', 'sapphire'] as any };

    const validation = validateAction(state, action);
    expect(validation.valid).toBe(true);

    const nextState = applyAction(state, action);
    expect(nextState.players[0].gems.ruby).toBe(1);
    expect(nextState.bank.ruby).toBe(4);
    expect(nextState.currentTurnIndex).toBe(1); // Advanced turn
  });

  it('enforces taking 2 same gems requirement (bank >= 4)', () => {
    const state = createInitialState(config);
    state.bank.ruby = 3; // Reduced to 3

    const action = { type: 'TAKE_2_SAME' as const, color: 'ruby' as any };
    const validation = validateAction(state, action);
    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('at least 4');
  });

  it('calculates gold wildcard substitution during card purchase', () => {
    const player = {
      id: 'p1',
      name: 'Player 1',
      isBot: false,
      gems: { emerald: 1, diamond: 0, sapphire: 0, ruby: 0, onyx: 0, gold: 2 },
      cards: [],
      reservedCards: [],
      nobles: [],
      prestigePoints: 0,
      color: '#FFF'
    };

    const card = {
      id: 'test_card',
      tier: 1 as const,
      gemBonus: 'ruby' as const,
      prestigePoints: 1,
      cost: { emerald: 2 }
    };

    const afford = canAffordCard(player, card);
    expect(afford.canAfford).toBe(true);
    expect(afford.goldNeeded).toBe(1);
  });

  it('correctly applies tie-breaker 1 (fewest purchased cards)', () => {
    const players = [
      {
        id: 'p1', name: 'Alice', isBot: false,
        gems: { emerald: 0, diamond: 0, sapphire: 0, ruby: 0, onyx: 0, gold: 0 },
        cards: [{}, {}, {}, {}, {}] as any, // 5 cards
        reservedCards: [], nobles: [], prestigePoints: 15, color: '#FFF'
      },
      {
        id: 'p2', name: 'Bob', isBot: false,
        gems: { emerald: 0, diamond: 0, sapphire: 0, ruby: 0, onyx: 0, gold: 0 },
        cards: [{}, {}, {}] as any, // 3 cards (Fewest!)
        reservedCards: [], nobles: [], prestigePoints: 15, color: '#FFF'
      }
    ];

    const winners = resolveWinners(players);
    expect(winners).toEqual(['p2']); // Bob wins tie-breaker
  });
});
