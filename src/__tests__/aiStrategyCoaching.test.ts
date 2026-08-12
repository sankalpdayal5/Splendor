import { describe, it, expect } from 'vitest';
import { createInitialState } from '../engine/gameEngine.js';
import { generateLegalActions, selectBotAction, getTopRecommendedMoves } from '../engine/aiEngine.js';
import { evaluateActionScore, getRecommendedDiscardTokens } from '../engine/aiEvaluator.js';
import { runISMCTSSimulation } from '../engine/ismctsEngine.js';
import { GameConfig } from '../engine/types.js';

describe('AI Engine, ISMCTS & Learn Mode Coaching Test Suite', () => {
  const baseConfig: GameConfig = {
    playerCount: 3,
    mode: 'offline_bot',
    players: [
      { name: 'Human', isBot: false },
      { name: 'Bot 1', isBot: true, botDifficulty: 'easy' },
      { name: 'Bot 2', isBot: true, botDifficulty: 'hard' }
    ]
  };

  it('Test 1: Easy bot selects legal action within 100ms', () => {
    const state = createInitialState(baseConfig);
    state.currentTurnIndex = 1; // Bot 1 (Easy)

    const start = Date.now();
    const action = selectBotAction(state, 'easy');
    const duration = Date.now() - start;

    expect(action).toBeDefined();
    expect(duration).toBeLessThan(100);
  });

  it('Test 2: Medium bot samples from top candidate pool without crash', () => {
    const state = createInitialState(baseConfig);
    state.currentTurnIndex = 1;

    const action = selectBotAction(state, 'medium');
    expect(action).toBeDefined();
    expect(action.type).toBeDefined();
  });

  it('Test 3: Hard bot prioritizes game-winning prestige purchases (15+ PP)', () => {
    let state = createInitialState(baseConfig);
    state.currentTurnIndex = 2; // Bot 2 (Hard)
    state.players[2].prestigePoints = 13;
    state.players[2].gems = { ruby: 3, emerald: 3, sapphire: 0, diamond: 0, onyx: 0, gold: 0 };

    // Place a Tier 2 card costing 3 ruby + 3 emerald that awards +2 PP
    state.tierGrid.tier2[0] = { id: 'win_card', tier: 2, gemBonus: 'ruby', prestigePoints: 2, cost: { ruby: 3, emerald: 3 } };

    const chosenAction = selectBotAction(state, 'hard');

    // Must buy the card that reaches 15 PP
    expect(chosenAction.type).toBe('BUY_GRID');
    if (chosenAction.type === 'BUY_GRID') {
      expect(chosenAction.tier).toBe(2);
      expect(chosenAction.slotIdx).toBe(0);
    }
  });

  it('Test 4: ISMCTS simulation runs 150 rollouts and returns bounded win expectancies (35% to 99.4%)', () => {
    const state = createInitialState(baseConfig);
    const candidateMoves = generateLegalActions(state, 0).slice(0, 3);

    const ismctsResults = runISMCTSSimulation(state, candidateMoves, 150);

    expect(ismctsResults.length).toBe(candidateMoves.length);
    for (const res of ismctsResults) {
      expect(res.simulatedRollouts).toBe(150);
      expect(res.winExpectancy).toBeGreaterThanOrEqual(35.0);
      expect(res.winExpectancy).toBeLessThanOrEqual(99.4);
    }
  });

  it('Test 5: ISMCTS result generates 3-turn multi-step projected roadmap', () => {
    const state = createInitialState(baseConfig);
    const candidateMoves = generateLegalActions(state, 0).slice(0, 1);

    const results = runISMCTSSimulation(state, candidateMoves, 10);
    const path = results[0].projectedPath;

    expect(path.length).toBeGreaterThan(0);
    expect(path.length).toBeLessThanOrEqual(3);
    expect(path[0].turnOffset).toBe(1);
    expect(path[0].actionDescription).toBeDefined();
  });

  it('Test 6: getTopRecommendedMoves attaches #1 TOP CHOICE, #2 STRONG ALTERNATIVE, #3 TACTICAL MOVE badges', () => {
    const state = createInitialState(baseConfig);
    const recommendations = getTopRecommendedMoves(state, 3);

    expect(recommendations.length).toBe(3);
    expect(recommendations[0].badge).toBe('TOP CHOICE');
    expect(recommendations[0].badgeColor).toBe('#F59E0B');
    expect(recommendations[1].badge).toBe('STRONG ALTERNATIVE');
    expect(recommendations[1].badgeColor).toBe('#10B981');
    expect(recommendations[2].badge).toBe('TACTICAL MOVE');
    expect(recommendations[2].badgeColor).toBe('#3B82F6');
  });

  it('Test 7: getRecommendedDiscardTokens protects Gold wildcards and target gem deficits', () => {
    const state = createInitialState(baseConfig);
    const playerWith12Gems = {
      ...state.players[0],
      gems: { emerald: 3, diamond: 3, ruby: 3, sapphire: 2, onyx: 0, gold: 1 },
      reservedCards: [{ id: 'target_res', tier: 2, gemBonus: 'ruby', prestigePoints: 2, cost: { ruby: 4 } }]
    } as any;

    const discards = getRecommendedDiscardTokens(state, playerWith12Gems, 2);

    // Should NOT discard gold wildcard or target ruby gems!
    expect(discards.gold || 0).toBe(0);
    expect(discards.ruby || 0).toBe(0);
  });

  it('Test 8: evaluateActionScore calculates non-negative heuristic score for legal moves', () => {
    const state = createInitialState(baseConfig);
    const legalActions = generateLegalActions(state, 0);

    for (const act of legalActions) {
      const score = evaluateActionScore(state, act, 'medium');
      expect(score).toBeGreaterThan(0);
    }
  });
});
