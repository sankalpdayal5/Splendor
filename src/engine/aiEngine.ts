import {
  GameState,
  GameAction,
  Player,
  DevelopmentCard,
  GemColor,
  ResourceMap,
  Noble
} from './types.js';
import {
  validateAction,
  applyAction,
  canAffordCard,
  calculatePlayerDiscounts,
  getTotalGems,
  GEM_COLORS,
  ALL_RESOURCES
} from './gameEngine.js';
import { runISMCTSSimulation } from './ismctsEngine.js';

export interface RecommendedMove {
  action: GameAction;
  score: number;
  winExpectancy: number;
  badge: 'TOP CHOICE' | 'STRONG ALTERNATIVE' | 'TACTICAL MOVE';
  badgeColor: string;
  title: string;
  rationale: string;
  projectedPath: {
    turnOffset: number;
    actionDescription: string;
    projectedPP: number;
  }[];
}

// AI Decision Engine supporting Easy, Medium, and Hard (ISMCTS Heuristic) Bot Personalities

export function generateLegalActions(state: GameState, playerIndex: number): GameAction[] {
  const player = state.players[playerIndex];
  const legalActions: GameAction[] = [];

  // 1. DISCARD PHASE
  if (state.phase === 'PHASE_DISCARD') {
    const totalGems = getTotalGems(player.gems);
    const neededDiscard = totalGems - 10;
    
    // Find valid token combinations to return
    const possibleDiscards = generateDiscardPermutations(player.gems, neededDiscard);
    for (const tokens of possibleDiscards) {
      const action: GameAction = { type: 'DISCARD_TOKENS', tokens };
      if (validateAction(state, action).valid) {
        legalActions.push(action);
      }
    }
    return legalActions;
  }

  // 2. NOBLE SELECTION PHASE
  if (state.phase === 'PHASE_NOBLE_SELECTION') {
    for (const nobleId of state.pendingNobleOptions) {
      const action: GameAction = { type: 'SELECT_NOBLE', nobleId };
      if (validateAction(state, action).valid) {
        legalActions.push(action);
      }
    }
    return legalActions;
  }

  // 3. MAIN ACTION PHASE

  // A. BUY CARD (Grid or Reserved)
  // Grid cards
  (['tier1', 'tier2', 'tier3'] as const).forEach((tierKey, tierIdx) => {
    const tierNum = (tierIdx + 1) as 1 | 2 | 3;
    state.tierGrid[tierKey].forEach((card, slotIdx) => {
      if (card) {
        const action: GameAction = { type: 'BUY_GRID', tier: tierNum, slotIdx };
        if (validateAction(state, action).valid) {
          legalActions.push(action);
        }
      }
    });
  });

  // Reserved cards
  player.reservedCards.forEach((card, reservedIndex) => {
    const action: GameAction = { type: 'BUY_RESERVED', reservedIndex };
    if (validateAction(state, action).valid) {
      legalActions.push(action);
    }
  });

  // B. RESERVE CARD (Grid or Deck)
  if (player.reservedCards.length < 3) {
    // Grid cards
    (['tier1', 'tier2', 'tier3'] as const).forEach((tierKey, tierIdx) => {
      const tierNum = (tierIdx + 1) as 1 | 2 | 3;
      state.tierGrid[tierKey].forEach((card, slotIdx) => {
        if (card) {
          const action: GameAction = { type: 'RESERVE_GRID', tier: tierNum, slotIdx };
          if (validateAction(state, action).valid) {
            legalActions.push(action);
          }
        }
      });
    });

    // Deck cards
    (['tier1', 'tier2', 'tier3'] as const).forEach((tierKey, tierIdx) => {
      const tierNum = (tierIdx + 1) as 1 | 2 | 3;
      if (state.tierDecks[tierKey].length > 0) {
        const action: GameAction = { type: 'RESERVE_DECK', tier: tierNum };
        if (validateAction(state, action).valid) {
          legalActions.push(action);
        }
      }
    });
  }

  // C. TAKE 3 DISTINCT GEMS
  const availableColors = GEM_COLORS.filter(col => (state.bank[col] || 0) > 0);
  const colorCombinations = getKCombinations(availableColors, Math.min(3, availableColors.length));
  
  for (const combo of colorCombinations) {
    if (combo.length > 0) {
      const action: GameAction = { type: 'TAKE_3_DISTINCT', colors: combo as GemColor[] };
      if (validateAction(state, action).valid) {
        legalActions.push(action);
      }
    }
  }

  // D. TAKE 2 SAME GEMS
  for (const col of GEM_COLORS) {
    if ((state.bank[col] || 0) >= 4) {
      const action: GameAction = { type: 'TAKE_2_SAME', color: col };
      if (validateAction(state, action).valid) {
        legalActions.push(action);
      }
    }
  }

  return legalActions;
}

export function selectBotAction(state: GameState, difficulty: 'easy' | 'medium' | 'hard'): GameAction {
  const legalActions = generateLegalActions(state, state.currentTurnIndex);
  if (legalActions.length === 0) {
    throw new Error('No legal actions available for bot.');
  }

  if (difficulty === 'easy') {
    const randomIndex = Math.floor(Math.random() * legalActions.length);
    return legalActions[randomIndex];
  }

  // Evaluate scores for all legal actions
  const scoredActions = legalActions.map(action => ({
    action,
    score: evaluateActionScore(state, action, difficulty)
  }));

  scoredActions.sort((a, b) => b.score - a.score);

  if (difficulty === 'medium') {
    // Top 40% candidate pool
    const topPool = scoredActions.slice(0, Math.max(1, Math.floor(scoredActions.length * 0.4)));
    const pick = topPool[Math.floor(Math.random() * topPool.length)];
    return pick.action;
  }

  // Hard difficulty: Pick best score
  return scoredActions[0].action;
}

// Evaluate legal moves for Learn Mode Coach
export function getTopRecommendedMoves(state: GameState, topN: number = 3): RecommendedMove[] {
  const legalActions = generateLegalActions(state, state.currentTurnIndex);
  if (legalActions.length === 0) return [];

  // Initial Heuristic Evaluation
  const scoredActions = legalActions.map(action => ({
    action,
    score: evaluateActionScore(state, action, 'hard')
  }));

  scoredActions.sort((a, b) => b.score - a.score);

  // Take top candidate moves for ISMCTS simulation
  const candidateActions = scoredActions.slice(0, topN).map(s => s.action);

  // Run fast ISMCTS 3-turn lookahead simulation
  const ismctsResults = runISMCTSSimulation(state, candidateActions, 150);

  const badges: { badge: 'TOP CHOICE' | 'STRONG ALTERNATIVE' | 'TACTICAL MOVE'; color: string }[] = [
    { badge: 'TOP CHOICE', color: '#F59E0B' },
    { badge: 'STRONG ALTERNATIVE', color: '#10B981' },
    { badge: 'TACTICAL MOVE', color: '#3B82F6' }
  ];

  return candidateActions.map((action, index) => {
    const meta = badges[index] || { badge: 'TACTICAL MOVE', color: '#8B5CF6' };
    const initialScore = scoredActions[index]?.score || 0;
    const simRes = ismctsResults.find(r => r.action === action);
    const winExpectancy = simRes ? simRes.winExpectancy : 50.0;
    const projectedPath = simRes ? simRes.projectedPath : [];

    const { title, rationale } = generateMoveRationale(state, action, initialScore);

    return {
      action,
      score: initialScore,
      winExpectancy,
      badge: meta.badge,
      badgeColor: meta.color,
      title,
      rationale,
      projectedPath
    };
  });
}

function generateMoveRationale(state: GameState, action: GameAction, score: number): { title: string; rationale: string } {
  const activePlayer = state.players[state.currentTurnIndex];

  if (action.type === 'BUY_GRID' || action.type === 'BUY_RESERVED') {
    let card: DevelopmentCard | null = null;
    if (action.type === 'BUY_GRID') {
      const tierKey = `tier${action.tier}` as keyof typeof state.tierGrid;
      card = state.tierGrid[tierKey][action.slotIdx];
    } else {
      card = activePlayer.reservedCards[action.reservedIndex];
    }

    if (card) {
      if (activePlayer.prestigePoints + card.prestigePoints >= 15) {
        return {
          title: `Buy ${card.gemBonus.toUpperCase()} Card (+${card.prestigePoints} pts)`,
          rationale: `🏆 Game Winning Move! Purchasing this card reaches 15+ prestige points to trigger victory!`
        };
      }
      if (card.prestigePoints > 0) {
        return {
          title: `Buy Tier ${card.tier} ${card.gemBonus.toUpperCase()} Card (+${card.prestigePoints} pts)`,
          rationale: `⭐ High Value Buy: Grants +${card.prestigePoints} prestige points and a permanent +1 ${card.gemBonus} bonus.`
        };
      }
      return {
        title: `Buy Tier ${card.tier} ${card.gemBonus.toUpperCase()} Card`,
        rationale: `⚙️ Engine Builder: Provides a permanent +1 ${card.gemBonus} discount to make higher-tier cards cheaper.`
      };
    }
  }

  if (action.type === 'TAKE_3_DISTINCT') {
    return {
      title: `Take 3 Gems (${action.colors.join(', ')})`,
      rationale: `💎 Resource Gathering: Collects ${action.colors.join(', ')} tokens needed for target development cards.`
    };
  }

  if (action.type === 'TAKE_2_SAME') {
    return {
      title: `Take 2 ${action.color.toUpperCase()} Gems`,
      rationale: `🔥 Heavy Gem Pickup: Secures 2 ${action.color} tokens to accelerate key card purchases.`
    };
  }

  if (action.type === 'RESERVE_GRID' || action.type === 'RESERVE_DECK') {
    return {
      title: `Reserve Card (+1 Gold)`,
      rationale: `🛡️ Tactical Reserve: Stores a key card in your hand, denies opponents, and awards +1 Gold wildcard token.`
    };
  }

  return {
    title: `Perform Action`,
    rationale: `Strategic move evaluated by AI engine.`
  };
}

function evaluateActionScore(state: GameState, action: GameAction, difficulty: 'medium' | 'hard'): number {
  const activePlayer = state.players[state.currentTurnIndex];
  let score = 0;

  // 1. Buy Card Action
  if (action.type === 'BUY_GRID' || action.type === 'BUY_RESERVED') {
    let card: DevelopmentCard | null = null;
    if (action.type === 'BUY_GRID') {
      const tierKey = `tier${action.tier}` as keyof typeof state.tierGrid;
      card = state.tierGrid[tierKey][action.slotIdx];
    } else {
      card = activePlayer.reservedCards[action.reservedIndex];
    }

    if (!card) return -100;

    score += 100; // Prefer buying over taking gems
    score += card.prestigePoints * 45; // High priority on prestige points

    // Winning move check
    if (activePlayer.prestigePoints + card.prestigePoints >= 15) {
      score += 1000;
    }

    // Noble synergy check
    const discounts = calculatePlayerDiscounts(activePlayer);
    discounts[card.gemBonus] += 1; // Simulated bonus after purchase

    for (const noble of state.nobles) {
      const reqMet = GEM_COLORS.every(col => (discounts[col] || 0) >= (noble.reqs[col] || 0));
      if (reqMet) {
        score += 300; // Huge bonus for claiming noble
      }
    }

    // Denial / Blocking check
    if (isOpponentTargetingCard(state, card)) {
      score += 50; // Boosted blocking reward
    }

    return score;
  }

  // 4. Reserve Action
  if (action.type === 'RESERVE_GRID' || action.type === 'RESERVE_DECK') {
    score += 30;
    if (state.bank.gold > 0) score += 10;

    if (action.type === 'RESERVE_GRID') {
      const tierKey = `tier${action.tier}` as keyof typeof state.tierGrid;
      const card = state.tierGrid[tierKey][action.slotIdx];
      if (card) {
        if (card.prestigePoints >= 3) score += card.prestigePoints * 15;
        if (isOpponentTargetingCard(state, card)) score += 60; // Hate-reserve boost!
      }
    }
    return score;
  }

  // 5. Take Gems Action
  if (action.type === 'TAKE_3_DISTINCT' || action.type === 'TAKE_2_SAME') {
    score += 20;
    const targetCardCosts = getTargetCardDeficits(state, activePlayer);
    
    if (action.type === 'TAKE_3_DISTINCT') {
      for (const col of action.colors) {
        if (targetCardCosts.has(col)) score += 15;
      }
    } else if (action.type === 'TAKE_2_SAME') {
      if (targetCardCosts.has(action.color)) score += 25;
    }
    return score;
  }

  return score;
}

function getTargetCardDeficits(state: GameState, player: Player): Set<GemColor> {
  const targetColors = new Set<GemColor>();
  const discounts = calculatePlayerDiscounts(player);

  // Look at face up grid cards
  (['tier1', 'tier2', 'tier3'] as const).forEach(tierKey => {
    state.tierGrid[tierKey].forEach(card => {
      if (card) {
        for (const col of GEM_COLORS) {
          const req = card.cost[col] || 0;
          const disc = discounts[col] || 0;
          if (req > disc) {
            targetColors.add(col);
          }
        }
      }
    });
  });

  return targetColors;
}

function isOpponentTargetingCard(state: GameState, card: DevelopmentCard): boolean {
  for (let i = 0; i < state.players.length; i++) {
    if (i !== state.currentTurnIndex) {
      const opponent = state.players[i];
      const { canAfford } = canAffordCard(opponent, card);
      if (canAfford || opponent.prestigePoints >= 12) {
        return true;
      }
    }
  }
  return false;
}

function getKCombinations<T>(set: T[], k: number): T[][] {
  if (k > set.length || k <= 0) return [];
  if (k === set.length) return [set];
  if (k === 1) return set.map(el => [el]);

  const combs: T[][] = [];
  for (let i = 0; i < set.length - k + 1; i++) {
    const head = set.slice(i, i + 1);
    const tailcombs = getKCombinations(set.slice(i + 1), k - 1);
    for (let j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]));
    }
  }
  return combs;
}

function generateDiscardPermutations(gems: ResourceMap, countNeeded: number): ResourceMap[] {
  const discards: ResourceMap[] = [];
  const available: { color: GemColor | 'gold'; count: number }[] = [];

  for (const res of ALL_RESOURCES) {
    if ((gems[res] || 0) > 0) {
      available.push({ color: res, count: gems[res] });
    }
  }

  // Recursive combinations generator
  function helper(index: number, currentDiscard: ResourceMap, remainingNeeded: number) {
    if (remainingNeeded === 0) {
      discards.push({ ...currentDiscard });
      return;
    }
    if (index >= available.length) return;

    const item = available[index];
    const maxTake = Math.min(item.count, remainingNeeded);

    for (let i = 0; i <= maxTake; i++) {
      currentDiscard[item.color] = i;
      helper(index + 1, currentDiscard, remainingNeeded - i);
    }
  }

  helper(0, { emerald: 0, diamond: 0, sapphire: 0, ruby: 0, onyx: 0, gold: 0 }, countNeeded);
  return discards.slice(0, 10);
}
