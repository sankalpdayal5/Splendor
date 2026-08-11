export type GemColor = 'emerald' | 'diamond' | 'sapphire' | 'ruby' | 'onyx';
export type ResourceColor = GemColor | 'gold';

export type GemMap = Record<GemColor, number>;
export type ResourceMap = Record<ResourceColor, number>;

export type PlayerId = string;
export type CardId = string;
export type NobleId = string;

export interface DevelopmentCard {
  id: CardId;
  tier: 1 | 2 | 3;
  gemBonus: GemColor;
  prestigePoints: number;
  cost: Partial<GemMap>;
}

export interface Noble {
  id: NobleId;
  name: string;
  prestigePoints: number;
  reqs: Partial<Record<GemColor, number>>;
  imageUrl?: string;
}

export interface Player {
  id: PlayerId;
  name: string;
  isBot: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard';
  gems: ResourceMap;
  cards: DevelopmentCard[];
  reservedCards: DevelopmentCard[];
  nobles: Noble[];
  prestigePoints: number;
  color: string;
  isOnline?: boolean;
}

export type TurnPhase = 
  | 'PHASE_ACTION'
  | 'PHASE_DISCARD'
  | 'PHASE_NOBLE_SELECTION'
  | 'FINISHED';

export interface GameState {
  gameId: string;
  playerCount: 2 | 3 | 4;
  players: Player[];
  currentTurnIndex: number;
  bank: ResourceMap;
  tierDecks: {
    tier1: DevelopmentCard[];
    tier2: DevelopmentCard[];
    tier3: DevelopmentCard[];
  };
  tierGrid: {
    tier1: (DevelopmentCard | null)[];
    tier2: (DevelopmentCard | null)[];
    tier3: (DevelopmentCard | null)[];
  };
  nobles: Noble[];
  phase: TurnPhase;
  pendingNobleOptions: NobleId[];
  finalRoundTriggered: boolean;
  winnerIds: PlayerId[] | null;
  moveHistory: GameActionLog[];
  turnNumber: number;
}

export type GameAction =
  | { type: 'TAKE_3_DISTINCT'; colors: GemColor[] }
  | { type: 'TAKE_2_SAME'; color: GemColor }
  | { type: 'RESERVE_GRID'; tier: 1 | 2 | 3; slotIdx: number }
  | { type: 'RESERVE_DECK'; tier: 1 | 2 | 3 }
  | { type: 'BUY_GRID'; tier: 1 | 2 | 3; slotIdx: number }
  | { type: 'BUY_RESERVED'; reservedIndex: number }
  | { type: 'DISCARD_TOKENS'; tokens: ResourceMap }
  | { type: 'SELECT_NOBLE'; nobleId: NobleId };

export interface GameActionLog {
  turnNumber: number;
  playerId: PlayerId;
  playerName: string;
  action: GameAction;
  description: string;
  timestamp: number;
}

export interface GameConfig {
  playerCount: 2 | 3 | 4;
  mode: 'offline_bot' | 'offline_pass_play' | 'online_room';
  botCount?: number;
  botDifficulty?: 'easy' | 'medium' | 'hard';
  players: { name: string; isBot: boolean; botDifficulty?: 'easy' | 'medium' | 'hard' }[];
}

export interface RoomInfo {
  roomCode: string;
  hostId: string;
  players: { id: string; name: string; isBot: boolean; botDifficulty?: 'easy' | 'medium' | 'hard'; isReady: boolean }[];
  config: GameConfig;
  isStarted: boolean;
  gameState: GameState | null;
}
