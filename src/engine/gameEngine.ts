import {
  GameState,
  GameAction,
  Player,
  PlayerId,
  DevelopmentCard,
  Noble,
  GemColor,
  ResourceColor,
  GemMap,
  ResourceMap,
  GameConfig,
  GameActionLog
} from './types.js';
import { TIER_1_CARDS, TIER_2_CARDS, TIER_3_CARDS } from './cardsData.js';
import { NOBLES_DATA } from './noblesData.js';

export const GEM_COLORS: GemColor[] = ['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'];
export const ALL_RESOURCES: ResourceColor[] = [...GEM_COLORS, 'gold'];

export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    bank: { ...state.bank },
    tierDecks: {
      tier1: [...state.tierDecks.tier1],
      tier2: [...state.tierDecks.tier2],
      tier3: [...state.tierDecks.tier3]
    },
    tierGrid: {
      tier1: [...state.tierGrid.tier1],
      tier2: [...state.tierGrid.tier2],
      tier3: [...state.tierGrid.tier3]
    },
    nobles: [...state.nobles],
    players: state.players.map(p => ({
      ...p,
      gems: { ...p.gems },
      cards: [...p.cards],
      reservedCards: [...p.reservedCards],
      nobles: [...p.nobles]
    })),
    pendingNobleOptions: state.pendingNobleOptions ? [...state.pendingNobleOptions] : [],
    winnerIds: state.winnerIds ? [...state.winnerIds] : null,
    moveHistory: [...state.moveHistory]
  };
}

export function shuffleArray<T>(array: T[], seedRandom?: () => number): T[] {
  const arr = [...array];
  const rand = seedRandom || Math.random;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createInitialState(config: GameConfig): GameState {
  const playerCount = config.playerCount;
  
  // Gem supply scaling: 2P -> 4, 3P -> 5, 4P -> 7 (Gold is always 5)
  const gemCount = playerCount === 2 ? 4 : playerCount === 3 ? 5 : 7;
  const bank: ResourceMap = {
    emerald: gemCount,
    diamond: gemCount,
    sapphire: gemCount,
    ruby: gemCount,
    onyx: gemCount,
    gold: 5
  };

  // Shuffle decks
  const tier1Deck = shuffleArray(TIER_1_CARDS);
  const tier2Deck = shuffleArray(TIER_2_CARDS);
  const tier3Deck = shuffleArray(TIER_3_CARDS);

  // Pop 4 face-up cards for each tier
  const tier1Grid = [tier1Deck.pop() || null, tier1Deck.pop() || null, tier1Deck.pop() || null, tier1Deck.pop() || null];
  const tier2Grid = [tier2Deck.pop() || null, tier2Deck.pop() || null, tier2Deck.pop() || null, tier2Deck.pop() || null];
  const tier3Grid = [tier3Deck.pop() || null, tier3Deck.pop() || null, tier3Deck.pop() || null, tier3Deck.pop() || null];

  // Nobles scaling: playerCount + 1
  const nobleCount = playerCount + 1;
  const nobles = shuffleArray(NOBLES_DATA).slice(0, nobleCount);

  // Setup players
  const playerColors = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B'];
  const players: Player[] = config.players.map((pConfig, index) => ({
    id: `player_${index + 1}`,
    name: pConfig.name,
    isBot: pConfig.isBot,
    botDifficulty: pConfig.botDifficulty,
    gems: { emerald: 0, diamond: 0, sapphire: 0, ruby: 0, onyx: 0, gold: 0 },
    cards: [],
    reservedCards: [],
    nobles: [],
    prestigePoints: 0,
    color: playerColors[index % playerColors.length]
  }));

  return {
    gameId: `game_${Date.now()}`,
    playerCount,
    players,
    currentTurnIndex: 0,
    bank,
    tierDecks: {
      tier1: tier1Deck,
      tier2: tier2Deck,
      tier3: tier3Deck
    },
    tierGrid: {
      tier1: tier1Grid,
      tier2: tier2Grid,
      tier3: tier3Grid
    },
    nobles,
    phase: 'PHASE_ACTION',
    pendingNobleOptions: [],
    finalRoundTriggered: false,
    winnerIds: null,
    moveHistory: [],
    turnNumber: 1
  };
}

export function calculatePlayerDiscounts(player: Player): GemMap {
  const discounts: GemMap = { emerald: 0, diamond: 0, sapphire: 0, ruby: 0, onyx: 0 };
  for (const card of player.cards) {
    discounts[card.gemBonus] += 1;
  }
  return discounts;
}

export function getTotalGems(gems: ResourceMap): number {
  return Object.values(gems).reduce((sum, val) => sum + val, 0);
}

export function canAffordCard(player: Player, card: DevelopmentCard): { canAfford: boolean; goldNeeded: number; tokensToPay: ResourceMap } {
  const discounts = calculatePlayerDiscounts(player);
  let goldNeeded = 0;
  const tokensToPay: ResourceMap = { emerald: 0, diamond: 0, sapphire: 0, ruby: 0, onyx: 0, gold: 0 };

  for (const color of GEM_COLORS) {
    const cost = card.cost[color] || 0;
    const discount = discounts[color] || 0;
    const netRequired = Math.max(0, cost - discount);
    
    const availableColorTokens = player.gems[color] || 0;
    const paidColor = Math.min(availableColorTokens, netRequired);
    tokensToPay[color] = paidColor;

    const deficit = netRequired - paidColor;
    goldNeeded += deficit;
  }

  const canAfford = (player.gems.gold || 0) >= goldNeeded;
  tokensToPay.gold = goldNeeded;

  return { canAfford, goldNeeded, tokensToPay };
}

export function validateAction(state: GameState, action: GameAction): { valid: boolean; reason?: string } {
  if (state.phase === 'FINISHED') {
    return { valid: false, reason: 'Game has already finished.' };
  }

  const activePlayer = state.players[state.currentTurnIndex];

  // Phase specific validations
  if (state.phase === 'PHASE_DISCARD') {
    if (action.type !== 'DISCARD_TOKENS') {
      return { valid: false, reason: 'Must discard excess tokens down to 10.' };
    }
    const currentTotal = getTotalGems(activePlayer.gems);
    const discardTotal = getTotalGems(action.tokens);
    if (currentTotal - discardTotal !== 10) {
      return { valid: false, reason: 'Must discard tokens down to exactly 10.' };
    }
    for (const color of ALL_RESOURCES) {
      if ((action.tokens[color] || 0) > (activePlayer.gems[color] || 0)) {
        return { valid: false, reason: `Cannot discard more ${color} gems than you hold.` };
      }
    }
    return { valid: true };
  }

  if (state.phase === 'PHASE_NOBLE_SELECTION') {
    if (action.type !== 'SELECT_NOBLE') {
      return { valid: false, reason: 'Must select a noble tile.' };
    }
    if (!state.pendingNobleOptions.includes(action.nobleId)) {
      return { valid: false, reason: 'Selected noble is not eligible.' };
    }
    return { valid: true };
  }

  // MAIN ACTION PHASE VALIDATIONS
  if (action.type === 'TAKE_3_DISTINCT') {
    const availableBankColors = GEM_COLORS.filter(c => (state.bank[c] || 0) > 0);
    const expectedCount = Math.min(3, availableBankColors.length);

    if (expectedCount > 0 && action.colors.length === 0) {
      return { valid: false, reason: 'Must select between 1 and 3 distinct colors.' };
    }
    if (action.colors.length > 3) {
      return { valid: false, reason: 'Cannot select more than 3 colors.' };
    }
    const uniqueColors = new Set(action.colors);
    if (uniqueColors.size !== action.colors.length) {
      return { valid: false, reason: 'Colors must be distinct.' };
    }
    
    if (action.colors.length !== expectedCount) {
      return { valid: false, reason: `Must select exactly ${expectedCount} distinct colors based on bank supply.` };
    }

    for (const color of action.colors) {
      if ((state.bank[color] || 0) < 1) {
        return { valid: false, reason: `No ${color} gems left in bank.` };
      }
    }
    return { valid: true };
  }

  if (action.type === 'TAKE_2_SAME') {
    const color = action.color;
    if ((state.bank[color] || 0) < 4) {
      return { valid: false, reason: `Requires at least 4 ${color} gems in bank to take 2.` };
    }
    return { valid: true };
  }

  if (action.type === 'RESERVE_GRID') {
    if (activePlayer.reservedCards.length >= 3) {
      return { valid: false, reason: 'Cannot hold more than 3 reserved cards.' };
    }
    const tierKey = `tier${action.tier}` as keyof typeof state.tierGrid;
    const card = state.tierGrid[tierKey][action.slotIdx];
    if (!card) {
      return { valid: false, reason: 'No card at specified grid slot.' };
    }
    return { valid: true };
  }

  if (action.type === 'RESERVE_DECK') {
    if (activePlayer.reservedCards.length >= 3) {
      return { valid: false, reason: 'Cannot hold more than 3 reserved cards.' };
    }
    const deckKey = `tier${action.tier}` as keyof typeof state.tierDecks;
    if (state.tierDecks[deckKey].length === 0) {
      return { valid: false, reason: 'Tier deck is empty.' };
    }
    return { valid: true };
  }

  if (action.type === 'BUY_GRID') {
    const tierKey = `tier${action.tier}` as keyof typeof state.tierGrid;
    const card = state.tierGrid[tierKey][action.slotIdx];
    if (!card) {
      return { valid: false, reason: 'No card at specified grid slot.' };
    }
    const { canAfford } = canAffordCard(activePlayer, card);
    if (!canAfford) {
      return { valid: false, reason: 'Cannot afford card with current gems & discounts.' };
    }
    return { valid: true };
  }

  if (action.type === 'BUY_RESERVED') {
    const card = activePlayer.reservedCards[action.reservedIndex];
    if (!card) {
      return { valid: false, reason: 'No reserved card at index.' };
    }
    const { canAfford } = canAffordCard(activePlayer, card);
    if (!canAfford) {
      return { valid: false, reason: 'Cannot afford reserved card.' };
    }
    return { valid: true };
  }

  return { valid: false, reason: 'Unknown action type.' };
}

export function applyAction(state: GameState, action: GameAction): GameState {
  const validation = validateAction(state, action);
  if (!validation.valid) {
    throw new Error(`Invalid action: ${validation.reason}`);
  }

  // Deep copy state to ensure pure state transition
  const nextState: GameState = JSON.parse(JSON.stringify(state));
  const activePlayer = nextState.players[nextState.currentTurnIndex];

  let actionDescription = '';

  // 1. DISCARD PHASE ACTION
  if (action.type === 'DISCARD_TOKENS') {
    for (const color of ALL_RESOURCES) {
      const count = action.tokens[color] || 0;
      activePlayer.gems[color] -= count;
      nextState.bank[color] += count;
    }
    actionDescription = `Returned excess tokens to bank.`;
    return finalizeTurnPhase(nextState, actionDescription, action);
  }

  // 2. NOBLE SELECTION ACTION
  if (action.type === 'SELECT_NOBLE') {
    const nobleIndex = nextState.nobles.findIndex(n => n.id === action.nobleId);
    if (nobleIndex !== -1) {
      const [claimedNoble] = nextState.nobles.splice(nobleIndex, 1);
      activePlayer.nobles.push(claimedNoble);
      activePlayer.prestigePoints += claimedNoble.prestigePoints;
      actionDescription = `Claimed Noble ${claimedNoble.name} (+3 pts).`;
    }
    nextState.pendingNobleOptions = [];
    return advanceTurn(nextState, actionDescription, action);
  }

  // 3. MAIN ACTIONS
  if (action.type === 'TAKE_3_DISTINCT') {
    for (const color of action.colors) {
      nextState.bank[color] -= 1;
      activePlayer.gems[color] += 1;
    }
    actionDescription = `Took 1 ${action.colors.join(', ')} gem.`;
  } else if (action.type === 'TAKE_2_SAME') {
    nextState.bank[action.color] -= 2;
    activePlayer.gems[action.color] += 2;
    actionDescription = `Took 2 ${action.color} gems.`;
  } else if (action.type === 'RESERVE_GRID') {
    const tierKey = `tier${action.tier}` as keyof typeof nextState.tierGrid;
    const deckKey = `tier${action.tier}` as keyof typeof nextState.tierDecks;
    
    const card = nextState.tierGrid[tierKey][action.slotIdx]!;
    activePlayer.reservedCards.push(card);
    
    // Refill grid slot from deck or null
    nextState.tierGrid[tierKey][action.slotIdx] = nextState.tierDecks[deckKey].pop() || null;

    // Allocate 1 gold if available in bank
    if (nextState.bank.gold > 0) {
      nextState.bank.gold -= 1;
      activePlayer.gems.gold += 1;
      actionDescription = `Reserved Tier ${action.tier} card & took 1 Gold.`;
    } else {
      actionDescription = `Reserved Tier ${action.tier} card (0 Gold left in bank).`;
    }
  } else if (action.type === 'RESERVE_DECK') {
    const deckKey = `tier${action.tier}` as keyof typeof nextState.tierDecks;
    const card = nextState.tierDecks[deckKey].pop()!;
    activePlayer.reservedCards.push(card);

    if (nextState.bank.gold > 0) {
      nextState.bank.gold -= 1;
      activePlayer.gems.gold += 1;
      actionDescription = `Reserved Tier ${action.tier} card from deck & took 1 Gold.`;
    } else {
      actionDescription = `Reserved Tier ${action.tier} card from deck.`;
    }
  } else if (action.type === 'BUY_GRID' || action.type === 'BUY_RESERVED') {
    let card: DevelopmentCard;
    if (action.type === 'BUY_GRID') {
      const tierKey = `tier${action.tier}` as keyof typeof nextState.tierGrid;
      const deckKey = `tier${action.tier}` as keyof typeof nextState.tierDecks;
      card = nextState.tierGrid[tierKey][action.slotIdx]!;
      nextState.tierGrid[tierKey][action.slotIdx] = nextState.tierDecks[deckKey].pop() || null;
    } else {
      [card] = activePlayer.reservedCards.splice(action.reservedIndex, 1);
    }

    const { tokensToPay } = canAffordCard(activePlayer, card);
    for (const res of ALL_RESOURCES) {
      const payCount = tokensToPay[res] || 0;
      activePlayer.gems[res] -= payCount;
      nextState.bank[res] += payCount;
    }

    activePlayer.cards.push(card);
    activePlayer.prestigePoints += card.prestigePoints;
    actionDescription = `Bought ${card.gemBonus} card (${card.prestigePoints} pts).`;
  }

  return finalizeTurnPhase(nextState, actionDescription, action);
}

function finalizeTurnPhase(state: GameState, actionDescription: string, action: GameAction): GameState {
  const activePlayer = state.players[state.currentTurnIndex];

  // 1. Check 10-gem holding limit
  const totalGems = getTotalGems(activePlayer.gems);
  if (totalGems > 10) {
    state.phase = 'PHASE_DISCARD';
    logAction(state, actionDescription, action);
    return state;
  }

  // 2. Check Noble qualification
  const discounts = calculatePlayerDiscounts(activePlayer);
  const eligibleNobles = state.nobles.filter(noble => {
    return GEM_COLORS.every(color => (discounts[color] || 0) >= (noble.reqs[color] || 0));
  });

  if (eligibleNobles.length === 1) {
    // Auto-claim single eligible noble
    const noble = eligibleNobles[0];
    const nobleIdx = state.nobles.findIndex(n => n.id === noble.id);
    state.nobles.splice(nobleIdx, 1);
    activePlayer.nobles.push(noble);
    activePlayer.prestigePoints += noble.prestigePoints;
    actionDescription += ` Claimed Noble ${noble.name} (+3 pts).`;
    return advanceTurn(state, actionDescription, action);
  } else if (eligibleNobles.length > 1) {
    state.phase = 'PHASE_NOBLE_SELECTION';
    state.pendingNobleOptions = eligibleNobles.map(n => n.id);
    logAction(state, actionDescription, action);
    return state;
  }

  return advanceTurn(state, actionDescription, action);
}

function advanceTurn(state: GameState, actionDescription: string, action: GameAction): GameState {
  const activePlayer = state.players[state.currentTurnIndex];

  // Check 15 Prestige points victory trigger
  if (activePlayer.prestigePoints >= 15) {
    state.finalRoundTriggered = true;
  }

  logAction(state, actionDescription, action);

  // Check end of round (last player completed turn)
  const isLastPlayerInRound = state.currentTurnIndex === state.players.length - 1;
  if (isLastPlayerInRound) {
    if (state.finalRoundTriggered) {
      state.phase = 'FINISHED';
      state.winnerIds = resolveWinners(state.players);
      return state;
    }
  }

  // Pass turn to next player
  state.currentTurnIndex = (state.currentTurnIndex + 1) % state.players.length;
  state.phase = 'PHASE_ACTION';
  state.turnNumber += 1;

  return state;
}

function logAction(state: GameState, description: string, action: GameAction): void {
  const activePlayer = state.players[state.currentTurnIndex];
  state.moveHistory.push({
    turnNumber: state.turnNumber,
    playerId: activePlayer.id,
    playerName: activePlayer.name,
    action,
    description,
    timestamp: Date.now()
  });
}

export function resolveWinners(players: Player[]): PlayerId[] {
  let highestScore = -1;
  let fewestCards = Infinity;
  let winners: PlayerId[] = [];

  for (const player of players) {
    const points = player.prestigePoints;
    const cardsCount = player.cards.length; // Excludes reservedCards!

    if (points > highestScore) {
      highestScore = points;
      fewestCards = cardsCount;
      winners = [player.id];
    } else if (points === highestScore) {
      if (cardsCount < fewestCards) {
        fewestCards = cardsCount;
        winners = [player.id];
      } else if (cardsCount === fewestCards) {
        winners.push(player.id); // Shared victory
      }
    }
  }

  return winners;
}
