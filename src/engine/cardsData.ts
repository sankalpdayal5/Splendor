import { DevelopmentCard, GemColor } from './types';

// Complete dataset for Splendor Development Cards across Tier 1, Tier 2, Tier 3

export const TIER_1_CARDS: DevelopmentCard[] = [
  // Emerald (Green) Bonus
  { id: 't1_g1', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: { onyx: 1, ruby: 1, sapphire: 1, diamond: 1 } },
  { id: 't1_g2', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: { diamond: 2, blue: 1 } as any },
  { id: 't1_g2_fixed', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: { diamond: 2, sapphire: 1 } },
  { id: 't1_g3', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: { onyx: 2, ruby: 1 } },
  { id: 't1_g4', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: { sapphire: 3 } },
  { id: 't1_g5', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: { diamond: 1, sapphire: 3, onyx: 1 } },
  { id: 't1_g6', tier: 1, gemBonus: 'emerald', prestigePoints: 1, cost: { ruby: 4 } },
  { id: 't1_g7', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: { diamond: 1, ruby: 2 } },
  { id: 't1_g8', tier: 1, gemBonus: 'emerald', prestigePoints: 0, cost: { onyx: 3 } },

  // Diamond (White) Bonus
  { id: 't1_w1', tier: 1, gemBonus: 'diamond', prestigePoints: 0, cost: { emerald: 1, sapphire: 1, ruby: 1, onyx: 1 } },
  { id: 't1_w2', tier: 1, gemBonus: 'diamond', prestigePoints: 0, cost: { sapphire: 2, emerald: 1 } },
  { id: 't1_w3', tier: 1, gemBonus: 'diamond', prestigePoints: 0, cost: { onyx: 2, emerald: 1 } },
  { id: 't1_w4', tier: 1, gemBonus: 'diamond', prestigePoints: 0, cost: { onyx: 3 } },
  { id: 't1_w5', tier: 1, gemBonus: 'diamond', prestigePoints: 0, cost: { emerald: 3, ruby: 1, onyx: 1 } },
  { id: 't1_w6', tier: 1, gemBonus: 'diamond', prestigePoints: 1, cost: { sapphire: 4 } },
  { id: 't1_w7', tier: 1, gemBonus: 'diamond', prestigePoints: 0, cost: { ruby: 2, onyx: 1 } },
  { id: 't1_w8', tier: 1, gemBonus: 'diamond', prestigePoints: 0, cost: { sapphire: 1, emerald: 2, ruby: 1, onyx: 1 } },

  // Sapphire (Blue) Bonus
  { id: 't1_b1', tier: 1, gemBonus: 'sapphire', prestigePoints: 0, cost: { diamond: 1, emerald: 1, ruby: 1, onyx: 1 } },
  { id: 't1_b2', tier: 1, gemBonus: 'sapphire', prestigePoints: 0, cost: { diamond: 1, ruby: 2 } },
  { id: 't1_b3', tier: 1, gemBonus: 'sapphire', prestigePoints: 0, cost: { onyx: 2, diamond: 1 } },
  { id: 't1_b4', tier: 1, gemBonus: 'sapphire', prestigePoints: 0, cost: { diamond: 3 } },
  { id: 't1_b5', tier: 1, gemBonus: 'sapphire', prestigePoints: 0, cost: { diamond: 1, emerald: 1, ruby: 2, onyx: 1 } },
  { id: 't1_b6', tier: 1, gemBonus: 'sapphire', prestigePoints: 1, cost: { me: 4 } as any },
  { id: 't1_b6_fixed', tier: 1, gemBonus: 'sapphire', prestigePoints: 1, cost: { ruby: 4 } },
  { id: 't1_b7', tier: 1, gemBonus: 'sapphire', prestigePoints: 0, cost: { emerald: 2, onyx: 2 } },
  { id: 't1_b8', tier: 1, gemBonus: 'sapphire', prestigePoints: 0, cost: { diamond: 2, emerald: 1 } },

  // Ruby (Red) Bonus
  { id: 't1_r1', tier: 1, gemBonus: 'ruby', prestigePoints: 0, cost: { diamond: 1, emerald: 1, sapphire: 1, onyx: 1 } },
  { id: 't1_r2', tier: 1, gemBonus: 'ruby', prestigePoints: 0, cost: { emerald: 2, sapphire: 1 } },
  { id: 't1_r3', tier: 1, gemBonus: 'ruby', prestigePoints: 0, cost: { diamond: 2, onyx: 1 } },
  { id: 't1_r4', tier: 1, gemBonus: 'ruby', prestigePoints: 0, cost: { emerald: 3 } },
  { id: 't1_r5', tier: 1, gemBonus: 'ruby', prestigePoints: 0, cost: { diamond: 2, sapphire: 1, emerald: 1, onyx: 1 } },
  { id: 't1_r6', tier: 1, gemBonus: 'ruby', prestigePoints: 1, cost: { diamond: 4 } },
  { id: 't1_r7', tier: 1, gemBonus: 'ruby', prestigePoints: 0, cost: { sapphire: 2, onyx: 1 } },
  { id: 't1_r8', tier: 1, gemBonus: 'ruby', prestigePoints: 0, cost: { diamond: 1, sapphire: 2 } },

  // Onyx (Black) Bonus
  { id: 't1_k1', tier: 1, gemBonus: 'onyx', prestigePoints: 0, cost: { diamond: 1, emerald: 1, sapphire: 1, ruby: 1 } },
  { id: 't1_k2', tier: 1, gemBonus: 'onyx', prestigePoints: 0, cost: { ruby: 2, emerald: 1 } },
  { id: 't1_k3', tier: 1, gemBonus: 'onyx', prestigePoints: 0, cost: { sapphire: 2, diamond: 1 } },
  { id: 't1_k4', tier: 1, gemBonus: 'onyx', prestigePoints: 0, cost: { ruby: 3 } },
  { id: 't1_k5', tier: 1, gemBonus: 'onyx', prestigePoints: 0, cost: { diamond: 1, sapphire: 1, emerald: 2, ruby: 1 } },
  { id: 't1_k6', tier: 1, gemBonus: 'onyx', prestigePoints: 1, cost: { emerald: 4 } },
  { id: 't1_k7', tier: 1, gemBonus: 'onyx', prestigePoints: 0, cost: { emerald: 1, ruby: 2 } },
  { id: 't1_k8', tier: 1, gemBonus: 'onyx', prestigePoints: 0, cost: { diamond: 2, sapphire: 2 } }
];

export const TIER_2_CARDS: DevelopmentCard[] = [
  // Emerald (Green) Bonus
  { id: 't2_g1', tier: 2, gemBonus: 'emerald', prestigePoints: 1, cost: { diamond: 2, sapphire: 3, onyx: 2 } },
  { id: 't2_g2', tier: 2, gemBonus: 'emerald', prestigePoints: 2, cost: { ruby: 4, onyx: 2, diamond: 1 } },
  { id: 't2_g3', tier: 2, gemBonus: 'emerald', prestigePoints: 2, cost: { sapphire: 5 } },
  { id: 't2_g4', tier: 2, gemBonus: 'emerald', prestigePoints: 3, cost: { emerald: 6 } },
  { id: 't2_g5', tier: 2, gemBonus: 'emerald', prestigePoints: 1, cost: { diamond: 3, emerald: 2, ruby: 3 } },
  { id: 't2_g6', tier: 2, gemBonus: 'emerald', prestigePoints: 2, cost: { sapphire: 2, emerald: 3, ruby: 2 } },

  // Diamond (White) Bonus
  { id: 't2_w1', tier: 2, gemBonus: 'diamond', prestigePoints: 1, cost: { emerald: 3, ruby: 2, onyx: 2 } },
  { id: 't2_w2', tier: 2, gemBonus: 'diamond', prestigePoints: 2, cost: { ruby: 5 } },
  { id: 't2_w3', tier: 2, gemBonus: 'diamond', prestigePoints: 2, cost: { diamond: 2, emerald: 2, onyx: 3 } },
  { id: 't2_w4', tier: 2, gemBonus: 'diamond', prestigePoints: 3, cost: { diamond: 6 } },
  { id: 't2_w5', tier: 2, gemBonus: 'diamond', prestigePoints: 1, cost: { sapphire: 2, ruby: 3, onyx: 3 } },
  { id: 't2_w6', tier: 2, gemBonus: 'diamond', prestigePoints: 2, cost: { emerald: 4, ruby: 2, diamond: 1 } },

  // Sapphire (Blue) Bonus
  { id: 't2_b1', tier: 2, gemBonus: 'sapphire', prestigePoints: 1, cost: { diamond: 2, ruby: 3, onyx: 2 } },
  { id: 't2_b2', tier: 2, gemBonus: 'sapphire', prestigePoints: 2, cost: { diamond: 5 } },
  { id: 't2_b3', tier: 2, gemBonus: 'sapphire', prestigePoints: 2, cost: { sapphire: 2, emerald: 2, ruby: 3 } },
  { id: 't2_b4', tier: 2, gemBonus: 'sapphire', prestigePoints: 3, cost: { sapphire: 6 } },
  { id: 't2_b5', tier: 2, gemBonus: 'sapphire', prestigePoints: 1, cost: { diamond: 3, sapphire: 2, emerald: 2 } },
  { id: 't2_b6', tier: 2, gemBonus: 'sapphire', prestigePoints: 2, cost: { diamond: 4, sapphire: 2, onyx: 1 } },

  // Ruby (Red) Bonus
  { id: 't2_r1', tier: 2, gemBonus: 'ruby', prestigePoints: 1, cost: { diamond: 2, emerald: 2, onyx: 3 } },
  { id: 't2_r2', tier: 2, gemBonus: 'ruby', prestigePoints: 2, cost: { onyx: 5 } },
  { id: 't2_r3', tier: 2, gemBonus: 'ruby', prestigePoints: 2, cost: { diamond: 3, sapphire: 2, ruby: 2 } },
  { id: 't2_r4', tier: 2, gemBonus: 'ruby', prestigePoints: 3, cost: { ruby: 6 } },
  { id: 't2_r5', tier: 2, gemBonus: 'ruby', prestigePoints: 1, cost: { sapphire: 3, emerald: 3, onyx: 2 } },
  { id: 't2_r6', tier: 2, gemBonus: 'ruby', prestigePoints: 2, cost: { emerald: 5, diamond: 1 } },

  // Onyx (Black) Bonus
  { id: 't2_k1', tier: 2, gemBonus: 'onyx', prestigePoints: 1, cost: { diamond: 3, sapphire: 2, emerald: 2 } },
  { id: 't2_k2', tier: 2, gemBonus: 'onyx', prestigePoints: 2, cost: { emerald: 5 } },
  { id: 't2_k3', tier: 2, gemBonus: 'onyx', prestigePoints: 2, cost: { sapphire: 3, ruby: 2, onyx: 2 } },
  { id: 't2_k4', tier: 2, gemBonus: 'onyx', prestigePoints: 3, cost: { onyx: 6 } },
  { id: 't2_k5', tier: 2, gemBonus: 'onyx', prestigePoints: 1, cost: { diamond: 2, emerald: 3, ruby: 2 } },
  { id: 't2_k6', tier: 2, gemBonus: 'onyx', prestigePoints: 2, cost: { ruby: 4, onyx: 2, sapphire: 1 } }
];

export const TIER_3_CARDS: DevelopmentCard[] = [
  // High Prestige Cards
  { id: 't3_g1', tier: 3, gemBonus: 'emerald', prestigePoints: 3, cost: { diamond: 3, sapphire: 3, ruby: 5, onyx: 3 } },
  { id: 't3_g2', tier: 3, gemBonus: 'emerald', prestigePoints: 4, cost: { ruby: 7 } },
  { id: 't3_g3', tier: 3, gemBonus: 'emerald', prestigePoints: 5, cost: { sapphire: 7, emerald: 3 } },

  { id: 't3_w1', tier: 3, gemBonus: 'diamond', prestigePoints: 3, cost: { sapphire: 3, emerald: 3, ruby: 3, onyx: 5 } },
  { id: 't3_w2', tier: 3, gemBonus: 'diamond', prestigePoints: 4, cost: { onyx: 7 } },
  { id: 't3_w3', tier: 3, gemBonus: 'diamond', prestigePoints: 5, cost: { onyx: 7, diamond: 3 } },

  { id: 't3_b1', tier: 3, gemBonus: 'sapphire', prestigePoints: 3, cost: { diamond: 3, emerald: 5, ruby: 3, onyx: 3 } },
  { id: 't3_b2', tier: 3, gemBonus: 'sapphire', prestigePoints: 4, cost: { diamond: 7 } },
  { id: 't3_b3', tier: 3, gemBonus: 'sapphire', prestigePoints: 5, cost: { diamond: 7, sapphire: 3 } },

  { id: 't3_r1', tier: 3, gemBonus: 'ruby', prestigePoints: 3, cost: { diamond: 5, sapphire: 3, emerald: 3, onyx: 3 } },
  { id: 't3_r2', tier: 3, gemBonus: 'ruby', prestigePoints: 4, cost: { emerald: 7 } },
  { id: 't3_r3', tier: 3, gemBonus: 'ruby', prestigePoints: 5, cost: { emerald: 7, ruby: 3 } },

  { id: 't3_k1', tier: 3, gemBonus: 'onyx', prestigePoints: 3, cost: { diamond: 3, sapphire: 5, emerald: 3, ruby: 3 } },
  { id: 't3_k2', tier: 3, gemBonus: 'onyx', prestigePoints: 4, cost: { sapphire: 7 } },
  { id: 't3_k3', tier: 3, gemBonus: 'onyx', prestigePoints: 5, cost: { ruby: 7, onyx: 3 } },

  { id: 't3_mix1', tier: 3, gemBonus: 'emerald', prestigePoints: 4, cost: { diamond: 3, ruby: 6, onyx: 3 } },
  { id: 't3_mix2', tier: 3, gemBonus: 'diamond', prestigePoints: 4, cost: { sapphire: 6, emerald: 3, ruby: 3 } },
  { id: 't3_mix3', tier: 3, gemBonus: 'sapphire', prestigePoints: 4, cost: { diamond: 6, emerald: 3, onyx: 3 } },
  { id: 't3_mix4', tier: 3, gemBonus: 'ruby', prestigePoints: 4, cost: { sapphire: 3, emerald: 6, onyx: 3 } },
  { id: 't3_mix5', tier: 3, gemBonus: 'onyx', prestigePoints: 4, cost: { diamond: 3, sapphire: 3, ruby: 6 } }
];
