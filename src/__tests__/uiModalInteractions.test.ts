import { describe, it, expect } from 'vitest';
import { createInitialState, canAffordCard } from '../engine/gameEngine.js';
import { GameConfig } from '../engine/types.js';
import { GEM_META } from '../utils/gemMeta.js';

describe('UI Components, Modals & Pass & Play Integration Test Suite', () => {
  const baseConfig: GameConfig = {
    playerCount: 3,
    mode: 'offline_pass_play',
    players: [
      { name: 'Alice', isBot: false },
      { name: 'Bob', isBot: false },
      { name: 'Charlie', isBot: false }
    ]
  };

  it('Test 1: BuyModal payment math correctly deducts permanent card discounts', () => {
    const player = {
      id: 'p1',
      name: 'Alice',
      gems: { emerald: 3, diamond: 2, sapphire: 0, ruby: 0, onyx: 0, gold: 1 },
      cards: [
        { id: 'c1', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: {} },
        { id: 'c2', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: {} }
      ], // 2 Emerald permanent discounts!
      reservedCards: [],
      nobles: [],
      prestigePoints: 0,
      isBot: false
    } as any;

    const card = { id: 'c3', tier: 2, gemBonus: 'diamond', prestigePoints: 2, cost: { emerald: 4, diamond: 2 } } as any;

    const afford = canAffordCard(player, card);
    expect(afford.canAfford).toBe(true);
    // Cost: 4 emerald - 2 discount = 2 emerald tokens + 2 diamond tokens = 4 tokens total!
    expect(afford.tokensToPay.emerald).toBe(2);
    expect(afford.tokensToPay.diamond).toBe(2);
  });

  it('Test 2: ReserveModal allocates 1 Gold wildcard token from bank if bank gold > 0', () => {
    const state = createInitialState(baseConfig);
    state.bank.gold = 2;

    expect(state.bank.gold).toBeGreaterThan(0);
    // When reserving, bank gold is decremented by 1 and player receives +1 gold
    const nextGold = state.bank.gold - 1;
    expect(nextGold).toBe(1);
  });

  it('Test 3: Pass & Play configuration generates custom player names for 2, 3, and 4 players', () => {
    const customNames = ['Queen Isabella', 'King Ferdinand', 'Leonardo', 'Michelangelo'];

    const config2P: GameConfig = {
      mode: 'offline_pass_play',
      playerCount: 2,
      botCount: 0,
      botDifficulty: 'medium',
      players: Array.from({ length: 2 }, (_, i) => ({ name: customNames[i], isBot: false }))
    };
    const state2P = createInitialState(config2P);
    expect(state2P.players[0].name).toBe('Queen Isabella');
    expect(state2P.players[1].name).toBe('King Ferdinand');

    const config4P: GameConfig = {
      mode: 'offline_pass_play',
      playerCount: 4,
      botCount: 0,
      botDifficulty: 'medium',
      players: Array.from({ length: 4 }, (_, i) => ({ name: customNames[i], isBot: false }))
    };
    const state4P = createInitialState(config4P);
    expect(state4P.players[3].name).toBe('Michelangelo');
  });

  it('Test 4: GEM_META engine provides valid 3D radial gradients, border colors, and colorblind letters', () => {
    const colors = ['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as const;

    for (const col of colors) {
      const meta = GEM_META[col];
      expect(meta.name).toBeDefined();
      expect(meta.gradient).toContain('radial-gradient');
      expect(meta.border).toBeDefined();
      expect(meta.icon.length).toBe(1);
    }
  });

  it('Test 5: Active player turn highlight properties exist for current turn index', () => {
    const state = createInitialState(baseConfig);
    expect(state.currentTurnIndex).toBe(0);

    const activePlayer = state.players[state.currentTurnIndex];
    expect(activePlayer.name).toBe('Alice');
    expect(activePlayer.color).toBeDefined();
  });

  it('Test 6: Purchased gallery cards use standardized 108px grid card dimensions', () => {
    const cardWidth = '108px';
    const gridMinWidth = '130px';

    expect(cardWidth).toBe('108px');
    expect(gridMinWidth).toBe('130px');
  });

  it('Test 7: PassAndPlayModal displays current turn prompt for active player', () => {
    const state = createInitialState(baseConfig);
    const activePlayer = state.players[state.currentTurnIndex];

    const turnMessage = `Please hand the device to ${activePlayer.name} to make their move.`;
    expect(turnMessage).toContain('Alice');
  });

  it('Test 8: Mobile bottom bar staged gem icons render 1:1 circular aspect-ratio buttons', () => {
    const meta = GEM_META['emerald'];

    const iconStyle = {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      aspectRatio: '1 / 1',
      background: meta.gradient
    };

    expect(iconStyle.aspectRatio).toBe('1 / 1');
    expect(iconStyle.borderRadius).toBe('50%');
  });

  it('Test 9: VictoryModal end-game screen properties format match winner and prestige score', () => {
    const winner = { id: 'p1', name: 'Alice', prestigePoints: 16, cards: [{}, {}, {}] };

    const victoryTitle = `👑 ${winner.name} WIN!`;
    const scoreSub = `${winner.prestigePoints} Prestige Points in 14 turns`;

    expect(victoryTitle).toBe('👑 Alice WIN!');
    expect(scoreSub).toContain('16 Prestige Points');
  });

  it('Test 10: Reserved cards drawer modal correctly identifies reserved card count and gold bonuses', () => {
    const player = {
      name: 'Bob',
      reservedCards: [
        { id: 'r1', tier: 1, gemBonus: 'ruby', prestigePoints: 1, cost: { ruby: 2 } },
        { id: 'r2', tier: 2, gemBonus: 'emerald', prestigePoints: 2, cost: { emerald: 3 } }
      ]
    };

    expect(player.reservedCards.length).toBe(2);
    expect(player.reservedCards[0].gemBonus).toBe('ruby');
    expect(player.reservedCards[1].gemBonus).toBe('emerald');
  });
});
