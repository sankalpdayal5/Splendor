import { describe, it, expect } from 'vitest';
import { createInitialState, validateAction, applyAction, resolveWinners, canAffordCard } from '../engine/gameEngine.js';
import { GameConfig } from '../engine/types.js';

describe('Game Engine Rule Invariants & State Machine Test Suite', () => {
  const baseConfig: GameConfig = {
    playerCount: 3,
    mode: 'offline_bot',
    players: [
      { name: 'Player 1', isBot: false },
      { name: 'Player 2', isBot: true, botDifficulty: 'medium' },
      { name: 'Player 3', isBot: true, botDifficulty: 'medium' }
    ]
  };

  it('Test 1: TAKE_3_DISTINCT rejects duplicate colors and incorrect count', () => {
    const state = createInitialState(baseConfig);

    // Attempt duplicate colors
    const invalidDupAction = { type: 'TAKE_3_DISTINCT' as const, colors: ['ruby', 'ruby', 'emerald'] as any };
    expect(validateAction(state, invalidDupAction).valid).toBe(false);

    // Attempt selecting only 2 colors when bank has 5 available
    const invalidCountAction = { type: 'TAKE_3_DISTINCT' as const, colors: ['ruby', 'emerald'] as any };
    expect(validateAction(state, invalidCountAction).valid).toBe(false);

    // Valid 3 distinct colors
    const validAction = { type: 'TAKE_3_DISTINCT' as const, colors: ['ruby', 'emerald', 'diamond'] as any };
    expect(validateAction(state, validAction).valid).toBe(true);
  });

  it('Test 2: TAKE_2_SAME requires at least 4 gems of that color in bank', () => {
    let state = createInitialState(baseConfig);

    // Bank has 4 rubies
    state.bank.ruby = 4;
    const valid2Same = { type: 'TAKE_2_SAME' as const, color: 'ruby' as const };
    expect(validateAction(state, valid2Same).valid).toBe(true);

    // Bank has only 3 rubies -> invalid
    state.bank.ruby = 3;
    const invalid2Same = { type: 'TAKE_2_SAME' as const, color: 'ruby' as const };
    const check = validateAction(state, invalid2Same);
    expect(check.valid).toBe(false);
    expect(check.reason).toContain('at least 4');
  });

  it('Test 3: Exceeding 10 total gems transitions state to PHASE_DISCARD', () => {
    let state = createInitialState(baseConfig);
    // Give active player 9 gems
    state.players[0].gems = { emerald: 3, diamond: 3, sapphire: 3, ruby: 0, onyx: 0, gold: 0 };
    state.bank.ruby = 5;
    state.bank.onyx = 5;
    state.bank.emerald = 5;

    // Take 3 distinct -> Total becomes 12
    const take3 = { type: 'TAKE_3_DISTINCT' as const, colors: ['ruby', 'onyx', 'emerald'] as any };
    state = applyAction(state, take3);

    expect(state.phase).toBe('PHASE_DISCARD');
    expect(state.currentTurnIndex).toBe(0); // Turn held for discard phase

    // Attempting main action in discard phase is rejected
    const mainAction = { type: 'TAKE_2_SAME' as const, color: 'ruby' as const };
    expect(validateAction(state, mainAction).valid).toBe(false);
  });

  it('Test 4: DISCARD_TOKENS returns excess tokens to bank and restores PHASE_ACTION', () => {
    let state = createInitialState(baseConfig);
    state.players[0].gems = { emerald: 4, diamond: 4, sapphire: 4, ruby: 0, onyx: 0, gold: 0 };
    state.phase = 'PHASE_DISCARD';

    // Must discard exactly 2 tokens down to 10
    const discard2 = {
      type: 'DISCARD_TOKENS' as const,
      tokens: { emerald: 1, diamond: 1, sapphire: 0, ruby: 0, onyx: 0, gold: 0 }
    };

    expect(validateAction(state, discard2).valid).toBe(true);
    state = applyAction(state, discard2);

    expect(state.phase).toBe('PHASE_ACTION');
    expect(state.currentTurnIndex).toBe(1); // Turn advanced to Player 2
    expect(state.players[0].gems.emerald).toBe(3);
    expect(state.players[0].gems.diamond).toBe(3);
  });

  it('Test 5: Buying a card applies permanent gem bonus discount to subsequent purchases', () => {
    const player = {
      id: 'p1',
      name: 'P1',
      gems: { emerald: 2, diamond: 1, sapphire: 0, ruby: 0, onyx: 0, gold: 0 },
      cards: [{ id: 'c1', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: {} }], // 1 Emerald discount!
      reservedCards: [],
      nobles: [],
      prestigePoints: 0,
      isBot: false
    } as any;

    const targetCard = { id: 'c2', tier: 1, gemBonus: 'ruby', prestigePoints: 1, cost: { emerald: 3 } } as any;

    // Card cost is 3 emerald. Discount is 1 emerald. Player pays 2 emerald.
    const afford = canAffordCard(player, targetCard);
    expect(afford.canAfford).toBe(true);
    expect(afford.tokensToPay.emerald).toBe(2);
  });

  it('Test 6: Reserving a card adds to reservedCards and allocates 1 Gold wildcard if available', () => {
    let state = createInitialState(baseConfig);
    state.bank.gold = 3;

    const reserveAction = { type: 'RESERVE_GRID' as const, tier: 1 as const, slotIdx: 0 };
    const cardToReserve = state.tierGrid.tier1[0]!;

    expect(validateAction(state, reserveAction).valid).toBe(true);
    state = applyAction(state, reserveAction);

    expect(state.players[0].reservedCards.length).toBe(1);
    expect(state.players[0].reservedCards[0].id).toBe(cardToReserve.id);
    expect(state.players[0].gems.gold).toBe(1);
    expect(state.bank.gold).toBe(2);
  });

  it('Test 7: Reserving a card when bank gold is 0 reserves card with 0 gold bonus', () => {
    let state = createInitialState(baseConfig);
    state.bank.gold = 0;

    const reserveAction = { type: 'RESERVE_GRID' as const, tier: 1 as const, slotIdx: 0 };
    state = applyAction(state, reserveAction);

    expect(state.players[0].reservedCards.length).toBe(1);
    expect(state.players[0].gems.gold).toBe(0);
    expect(state.bank.gold).toBe(0);
  });

  it('Test 8: Player holding 3 reserved cards cannot reserve a 4th card', () => {
    let state = createInitialState(baseConfig);
    state.players[0].reservedCards = [
      { id: 'r1', tier: 1, gemBonus: 'ruby', prestigePoints: 0, cost: {} },
      { id: 'r2', tier: 1, gemBonus: 'ruby', prestigePoints: 0, cost: {} },
      { id: 'r3', tier: 1, gemBonus: 'ruby', prestigePoints: 0, cost: {} }
    ] as any;

    const reserveAction = { type: 'RESERVE_GRID' as const, tier: 1 as const, slotIdx: 0 };
    const check = validateAction(state, reserveAction);

    expect(check.valid).toBe(false);
    expect(check.reason).toContain('Cannot hold more than 3 reserved cards');
  });

  it('Test 9: Meeting noble requirements automatically claims noble tile and awards +3 VP', () => {
    let state = createInitialState(baseConfig);
    state.nobles = [
      { id: 'n1', name: 'Noble 1', prestigePoints: 3, reqs: { emerald: 3, diamond: 0, sapphire: 0, ruby: 0, onyx: 0 } } as any
    ];

    // Player has 2 emerald cards
    state.players[0].cards = [
      { id: 'c1', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: {} },
      { id: 'c2', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: {} }
    ] as any;

    // Grid card providing 3rd emerald discount
    state.tierGrid.tier1[0] = { id: 'c3', tier: 1, gemBonus: 'emerald', prestigePoints: 1, cost: { ruby: 0 } } as any;

    const buyAction = { type: 'BUY_GRID' as const, tier: 1 as const, slotIdx: 0 };
    state = applyAction(state, buyAction);

    expect(state.players[0].nobles.length).toBe(1);
    expect(state.players[0].nobles[0].id).toBe('n1');
    expect(state.players[0].prestigePoints).toBe(4); // 1 from card + 3 from noble!
    expect(state.nobles.length).toBe(0);
  });

  it('Test 10: 15-VP final round victory trigger and tiebreaking by fewest development cards', () => {
    const players = [
      { id: 'p1', name: 'P1', prestigePoints: 16, cards: [{}, {}, {}, {}, {}, {}, {}, {}] }, // 8 cards
      { id: 'p2', name: 'P2', prestigePoints: 16, cards: [{}, {}, {}, {}, {}] },             // 5 cards (Winner!)
      { id: 'p3', name: 'P3', prestigePoints: 12, cards: [{}, {}, {}, {}] }
    ] as any;

    const winners = resolveWinners(players);
    expect(winners).toEqual(['p2']);
  });
});
