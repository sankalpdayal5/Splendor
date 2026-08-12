import { describe, it, expect } from 'vitest';
import { createInitialState, applyAction, validateAction, getTotalGems, calculatePlayerDiscounts } from '../gameEngine.js';
import { generateLegalActions, selectBotAction } from '../aiEngine.js';
import { GameState, GameConfig, GameAction } from '../types.js';

describe('E2E Brute Force Game Engine & Rule Invariant Stress Testing', () => {
  it('should run 100 full games across 2, 3, and 4 players without state corruption or rule violations', () => {
    let totalGamesFinished = 0;
    let totalActionsExecuted = 0;

    const playerCounts: (2 | 3 | 4)[] = [2, 3, 4];
    const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];

    for (let gameIdx = 0; gameIdx < 100; gameIdx++) {
      const pCount = playerCounts[gameIdx % playerCounts.length];
      const diff = difficulties[gameIdx % difficulties.length];

      const config: GameConfig = {
        mode: 'offline_bot',
        playerCount: pCount,
        botCount: pCount - 1,
        botDifficulty: diff,
        players: Array.from({ length: pCount }, (_, i) => ({
          name: i === 0 ? 'Human Player' : `Bot ${i}`,
          isBot: i > 0,
          difficulty: diff
        }))
      };

      let state: GameState = createInitialState(config);
      let turnCount = 0;
      const MAX_TURNS = 200;

      while (state.phase !== 'FINISHED' && turnCount < MAX_TURNS) {
        turnCount++;
        totalActionsExecuted++;

        const activePlayer = state.players[state.currentTurnIndex];

        // 1. If in Token Discard Phase
        if (state.phase === 'PHASE_DISCARD') {
          const totalGems = getTotalGems(activePlayer.gems);
          const excess = totalGems - 10;
          if (excess > 0) {
            const discardMap = { emerald: 0, diamond: 0, sapphire: 0, ruby: 0, onyx: 0, gold: 0 };
            let remainingToDiscard = excess;

            for (const col of (['emerald', 'diamond', 'sapphire', 'ruby', 'onyx', 'gold'] as const)) {
              if (remainingToDiscard <= 0) break;
              const avail = activePlayer.gems[col] || 0;
              const toTake = Math.min(avail, remainingToDiscard);
              discardMap[col] = toTake;
              remainingToDiscard -= toTake;
            }

            const action: GameAction = { type: 'DISCARD_TOKENS', tokens: discardMap };
            expect(validateAction(state, action).valid).toBe(true);
            state = applyAction(state, action);
            continue;
          }
        }

        // 2. If in Noble Selection Phase
        if (state.phase === 'PHASE_NOBLE_SELECTION' && state.pendingNobleOptions.length > 0) {
          const selectedNobleId = state.pendingNobleOptions[0];
          const action: GameAction = { type: 'SELECT_NOBLE', nobleId: selectedNobleId };
          expect(validateAction(state, action).valid).toBe(true);
          state = applyAction(state, action);
          continue;
        }

        // 3. Normal Action Phase
        const legalActions = generateLegalActions(state, state.currentTurnIndex);
        expect(legalActions.length).toBeGreaterThan(0);

        let chosenAction: GameAction;
        if (activePlayer.isBot) {
          chosenAction = selectBotAction(state, diff);
        } else {
          // Brute force random pick for human player
          chosenAction = legalActions[Math.floor(Math.random() * legalActions.length)];
        }

        // Validate Action before applying
        const validation = validateAction(state, chosenAction);
        expect(validation.valid).toBe(true);

        // Apply Action
        state = applyAction(state, chosenAction);

        // INVARIANT CHECKS after every single action
        for (const col of (['emerald', 'diamond', 'sapphire', 'ruby', 'onyx', 'gold'] as const)) {
          expect(state.bank[col]).toBeGreaterThanOrEqual(0);
        }

        for (const p of state.players) {
          expect(p.reservedCards.length).toBeLessThanOrEqual(3);
          expect(p.prestigePoints).toBeGreaterThanOrEqual(0);

          // Verify Prestige Points sum
          const cardPoints = p.cards.reduce((sum, c) => sum + c.prestigePoints, 0);
          const noblePoints = p.nobles.reduce((sum, n) => sum + n.prestigePoints, 0);
          expect(p.prestigePoints).toBe(cardPoints + noblePoints);

          // Verify Discounts match card bonuses
          const discounts = calculatePlayerDiscounts(p);
          for (const col of (['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as const)) {
            const count = p.cards.filter(c => c.gemBonus === col).length;
            expect(discounts[col]).toBe(count);
          }
        }
      }

      if (state.phase === 'FINISHED') {
        totalGamesFinished++;
        expect(state.winnerIds).not.toBeNull();
        expect(state.winnerIds!.length).toBeGreaterThan(0);
      }
    }

    console.log(`✅ Brute-Force Stress Test Complete: ${totalGamesFinished}/100 games finished cleanly with ${totalActionsExecuted} total verified actions executed.`);
  });
});
