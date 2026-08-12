import {
  GameState,
  GameAction,
  Player,
  DevelopmentCard,
  GemColor,
  ResourceMap
} from './types.js';
import {
  canAffordCard,
  calculatePlayerDiscounts,
  getTotalGems,
  GEM_COLORS,
  ALL_RESOURCES
} from './gameEngine.js';

/**
 * Focused target card deficit calculator.
 * Scans reserved cards, near-affordable market cards (deficit <= 3), and noble requirements
 * to identify precise gem colors needed for near-term purchases.
 */
export function getTargetCardDeficits(state: GameState, player: Player): Set<GemColor> {
  const targetColors = new Set<GemColor>();
  const discounts = calculatePlayerDiscounts(player);

  // 1. Reserved cards in hand represent explicit purchase intent
  for (const card of player.reservedCards) {
    for (const col of GEM_COLORS) {
      const req = card.cost[col] || 0;
      const disc = discounts[col] || 0;
      if (req > disc) {
        targetColors.add(col);
      }
    }
  }

  // 2. Scan market grid cards that are near-affordable (total gem deficit <= 3)
  (['tier1', 'tier2', 'tier3'] as const).forEach(tierKey => {
    state.tierGrid[tierKey].forEach(card => {
      if (card) {
        let totalDeficit = 0;
        const cardDeficits: GemColor[] = [];

        for (const col of GEM_COLORS) {
          const req = card.cost[col] || 0;
          const disc = discounts[col] || 0;
          const held = player.gems[col] || 0;
          const deficit = Math.max(0, req - disc - held);
          totalDeficit += deficit;
          if (req > disc) {
            cardDeficits.push(col);
          }
        }

        // Only add if card is near-affordable (total deficit <= 3) or grants high PP
        if (totalDeficit <= 3 || card.prestigePoints >= 3) {
          cardDeficits.forEach(col => targetColors.add(col));
        }
      }
    });
  });

  return targetColors;
}

/**
 * Calculates recommended token discards when a player exceeds 10 tokens.
 * Strictly protects Gold wildcards and target card gem deficits while discarding unneeded surplus tokens.
 */
export function getRecommendedDiscardTokens(state: GameState, player: Player, discardCount: number): ResourceMap {
  const targetCardCosts = getTargetCardDeficits(state, player);
  const result: ResourceMap = { emerald: 0, diamond: 0, sapphire: 0, ruby: 0, onyx: 0, gold: 0 };
  let countRemaining = discardCount;

  // 1. Discard non-Gold surplus gems not needed for target cards
  for (const col of GEM_COLORS) {
    if (countRemaining <= 0) break;
    if (!targetCardCosts.has(col)) {
      const avail = (player.gems[col] || 0);
      if (avail > 0) {
        const toTake = Math.min(avail, countRemaining);
        result[col] = (result[col] || 0) + toTake;
        countRemaining -= toTake;
      }
    }
  }

  // 2. If still need discards, pick non-Gold gems even if in target list
  for (const col of GEM_COLORS) {
    if (countRemaining <= 0) break;
    const currentHolding = (player.gems[col] || 0) - (result[col] || 0);
    if (currentHolding > 0) {
      const toTake = Math.min(currentHolding, countRemaining);
      result[col] = (result[col] || 0) + toTake;
      countRemaining -= toTake;
    }
  }

  // 3. Gold is absolute last resort
  if (countRemaining > 0 && player.gems.gold) {
    const currentHolding = (player.gems.gold || 0) - (result.gold || 0);
    if (currentHolding > 0) {
      result.gold = Math.min(currentHolding, countRemaining);
    }
  }

  return result;
}

export function formatResourceMap(res: ResourceMap): string {
  const parts: string[] = [];
  for (const k of ALL_RESOURCES) {
    if (res[k] && res[k]! > 0) {
      parts.push(`${res[k]} ${k.toUpperCase()}`);
    }
  }
  return parts.join(', ');
}

export function isOpponentTargetingCard(state: GameState, card: DevelopmentCard): boolean {
  for (let i = 0; i < state.players.length; i++) {
    if (i !== state.currentTurnIndex) {
      const opponent = state.players[i];
      const { canAfford } = canAffordCard(opponent, card);
      if (canAfford || (opponent.prestigePoints >= 12 && card.prestigePoints >= 3)) {
        return true;
      }
    }
  }
  return false;
}

export function evaluateActionScore(state: GameState, action: GameAction, difficulty: 'medium' | 'hard'): number {
  const activePlayer = state.players[state.currentTurnIndex];
  let score = 0;

  // 0. Discard Tokens Action
  if (action.type === 'DISCARD_TOKENS') {
    let discardScore = 100;
    const targetCardCosts = getTargetCardDeficits(state, activePlayer);

    if (action.tokens.gold && action.tokens.gold > 0) {
      discardScore -= 200;
    }

    for (const col of GEM_COLORS) {
      const discardAmount = action.tokens[col] || 0;
      if (discardAmount > 0) {
        if (targetCardCosts.has(col)) {
          discardScore -= discardAmount * 30;
        } else {
          discardScore += discardAmount * 20;
        }
      }
    }
    return discardScore;
  }

  // 1. Buy Card Action
  if (action.type === 'BUY_GRID' || action.type === 'BUY_RESERVED') {
    let card: DevelopmentCard | null = null;
    if (action.type === 'BUY_GRID') {
      const tierKey = `tier${action.tier}` as keyof typeof state.tierGrid;
      card = state.tierGrid[tierKey][action.slotIdx];
    } else {
      card = activePlayer.reservedCards[action.reservedIndex];
    }

    if (card) {
      score += 100;
      score += card.prestigePoints * 45;

      if (activePlayer.prestigePoints + card.prestigePoints >= 15) {
        score += 1000;
      }

      const playerDiscounts = calculatePlayerDiscounts(activePlayer);
      const nextDiscounts = { ...playerDiscounts, [card.gemBonus]: (playerDiscounts[card.gemBonus] || 0) + 1 };

      for (const noble of state.nobles) {
        const reqMet = GEM_COLORS.every(col => (nextDiscounts[col] || 0) >= (noble.reqs[col] || 0));
        if (reqMet) {
          score += 300;
        }
      }

      if (isOpponentTargetingCard(state, card)) {
        score += 50;
      }

      return score;
    }
  }

  // 2. Reserve Action
  if (action.type === 'RESERVE_GRID' || action.type === 'RESERVE_DECK') {
    score += 30;
    if (state.bank.gold > 0) score += 10;

    if (action.type === 'RESERVE_GRID') {
      const tierKey = `tier${action.tier}` as keyof typeof state.tierGrid;
      const card = state.tierGrid[tierKey][action.slotIdx];
      if (card) {
        if (card.prestigePoints >= 3) score += card.prestigePoints * 15;
        if (isOpponentTargetingCard(state, card)) score += 60;
      }
    }
    return score;
  }

  // 3. Take Gems Action
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

export function generateMoveRationale(state: GameState, action: GameAction, score: number): { title: string; rationale: string } {
  const activePlayer = state.players[state.currentTurnIndex];
  const playerDiscounts = calculatePlayerDiscounts(activePlayer);
  const currentGemsTotal = getTotalGems(activePlayer.gems);

  if (action.type === 'DISCARD_TOKENS') {
    const discardStr = formatResourceMap(action.tokens);
    return {
      title: `Discard Tokens (${discardStr})`,
      rationale: `Token Limit Exceeded: Discarding ${discardStr} (surplus tokens) to preserve your Gold wildcards and target card gems.`
    };
  }

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
          title: `Buy Tier ${card.tier} ${card.gemBonus.toUpperCase()} Card (+${card.prestigePoints} pts)`,
          rationale: `Game Winning Move: Purchasing this card reaches 15+ prestige points to trigger match victory!`
        };
      }

      const nextDiscounts = { ...playerDiscounts, [card.gemBonus]: (playerDiscounts[card.gemBonus] || 0) + 1 };
      const matchedNoble = state.nobles.find(n => {
        return GEM_COLORS.every(c => (nextDiscounts[c] || 0) >= (n.reqs[c] || 0));
      });

      if (matchedNoble) {
        return {
          title: `Buy Tier ${card.tier} ${card.gemBonus.toUpperCase()} Card (+${card.prestigePoints} pts)`,
          rationale: `Noble Attraction: Grants +${card.prestigePoints} pts AND attracts visiting noble ${matchedNoble.name} (+3 pts)!`
        };
      }

      if (card.prestigePoints > 0) {
        return {
          title: `Buy Tier ${card.tier} ${card.gemBonus.toUpperCase()} Card (+${card.prestigePoints} pts)`,
          rationale: `High Value Buy: Direct +${card.prestigePoints} prestige points boost plus a permanent +1 ${card.gemBonus} gem discount.`
        };
      }
      return {
        title: `Buy Tier ${card.tier} ${card.gemBonus.toUpperCase()} Card`,
        rationale: `Engine Builder: Grants a permanent +1 ${card.gemBonus} discount, reducing the cost of higher-tier cards on future turns.`
      };
    }
  }

  if (action.type === 'TAKE_3_DISTINCT') {
    const formattedColors = action.colors.map(c => c.toUpperCase()).join(', ');
    let rationale = `Resource Gathering: Collects ${formattedColors} tokens to build purchasing power for target development cards.`;

    const projectedTotal = currentGemsTotal + action.colors.length;
    if (projectedTotal > 10) {
      const overage = projectedTotal - 10;
      const tempGems = { ...activePlayer.gems };
      action.colors.forEach(c => tempGems[c] = (tempGems[c] || 0) + 1);
      const tempPlayer = { ...activePlayer, gems: tempGems };
      const recDiscards = getRecommendedDiscardTokens(state, tempPlayer, overage);
      const discardStr = formatResourceMap(recDiscards);
      rationale += `\n\nDiscard Suggestion: Discard ${discardStr} (surplus tokens) to stay within 10-gem limit.`;
    }

    return {
      title: `Take 3 Gems (${formattedColors})`,
      rationale
    };
  }

  if (action.type === 'TAKE_2_SAME') {
    let rationale = `Heavy Gem Pickup: Secures 2 ${action.color.toUpperCase()} tokens to quickly afford an expensive Tier 2 or Tier 3 card.`;

    const projectedTotal = currentGemsTotal + 2;
    if (projectedTotal > 10) {
      const overage = projectedTotal - 10;
      const tempGems = { ...activePlayer.gems, [action.color]: (activePlayer.gems[action.color] || 0) + 2 };
      const tempPlayer = { ...activePlayer, gems: tempGems };
      const recDiscards = getRecommendedDiscardTokens(state, tempPlayer, overage);
      const discardStr = formatResourceMap(recDiscards);
      rationale += `\n\nDiscard Suggestion: Discard ${discardStr} (surplus tokens) to stay within 10-gem limit.`;
    }

    return {
      title: `Take 2 ${action.color.toUpperCase()} Gems`,
      rationale
    };
  }

  if (action.type === 'RESERVE_GRID' || action.type === 'RESERVE_DECK') {
    let cardName = `Tier ${action.tier} Card`;
    if (action.type === 'RESERVE_GRID') {
      const tierKey = `tier${action.tier}` as keyof typeof state.tierGrid;
      const card = state.tierGrid[tierKey][action.slotIdx];
      if (card) {
        cardName = `Tier ${card.tier} ${card.gemBonus.toUpperCase()} Card (${card.prestigePoints} pts)`;
      }
    }

    let rationale = `Tactical Reserve: Stores ${cardName} in your hand, denies it from opponents, and awards +1 Gold wildcard token.`;

    if (state.bank.gold > 0) {
      const projectedTotal = currentGemsTotal + 1;
      if (projectedTotal > 10) {
        const overage = projectedTotal - 10;
        const tempGems = { ...activePlayer.gems, gold: (activePlayer.gems.gold || 0) + 1 };
        const tempPlayer = { ...activePlayer, gems: tempGems };
        const recDiscards = getRecommendedDiscardTokens(state, tempPlayer, overage);
        const discardStr = formatResourceMap(recDiscards);
        rationale += `\n\nDiscard Suggestion: Discard ${discardStr} to satisfy 10-gem limit.`;
      }
    }

    return {
      title: `Reserve ${cardName} (+1 Gold)`,
      rationale
    };
  }

  return {
    title: `Perform Action`,
    rationale: `Strategic move evaluated by the AI engine.`
  };
}
