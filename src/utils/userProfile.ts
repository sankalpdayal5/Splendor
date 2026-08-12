/**
 * User Profile, Elo Rating & Career Statistics System
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // Emoji / SVG avatar identifier
  title: string;
  level: number;
  xp: number;
  elo: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  totalPrestigePoints: number;
  highestSingleGameScore: number;
  fastestWinTurns: number;
  gemStats: {
    emerald: number;
    diamond: number;
    sapphire: number;
    ruby: number;
    onyx: number;
  };
  achievements: Achievement[];
}

export const AVATAR_OPTIONS = [
  { id: 'merchant_male_1', label: 'Renaissance Merchant', icon: '👨‍💼' },
  { id: 'merchant_female_1', label: 'Jewel Trader', icon: '👩‍💼' },
  { id: 'gem_king', label: 'Gem King', icon: '👑' },
  { id: 'diamond_artisan', label: 'Diamond Artisan', icon: '💎' },
  { id: 'ruby_sculptor', label: 'Ruby Sculptor', icon: '🔴' },
  { id: 'emerald_collector', label: 'Emerald Baron', icon: '🟢' },
  { id: 'sapphire_duke', label: 'Sapphire Duke', icon: '🔵' },
  { id: 'onyx_master', label: 'Onyx Master', icon: '⚫' },
  { id: 'gold_alchemist', label: 'Gold Alchemist', icon: '🟡' },
  { id: 'noble_lady', label: 'Noble Duchess', icon: '👸' },
  { id: 'noble_lord', label: 'Grand Archduke', icon: '🤴' },
  { id: 'mystic_sculptor', label: 'Master Sculptor', icon: '🧙‍♂️' }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_win', title: 'First Victory', description: 'Win your first Splendor match.', icon: '🏆', unlocked: false },
  { id: 'gem_baron', title: 'Gem Baron', description: 'Win 10 matches.', icon: '👑', unlocked: false },
  { id: 'speed_merchant', title: 'Speed Merchant', description: 'Win a match in under 15 turns.', icon: '⚡', unlocked: false },
  { id: 'noble_favor', title: 'Noble Favor', description: 'Claim 2 nobles in a single match.', icon: '📜', unlocked: false },
  { id: 'pure_strategy', title: 'Pure Strategy', description: 'Win a match without reserving any cards.', icon: '💎', unlocked: false },
  { id: 'high_scorer', title: 'Master of Prestige', description: 'Score 18 or more Prestige Points in a single match.', icon: '🌟', unlocked: false }
];

const PROFILE_KEY = 'splendor_user_profile_v1';

export function getOrCreateUserProfile(): UserProfile {
  if (typeof localStorage === 'undefined') return createDefaultProfile();

  const stored = localStorage.getItem(PROFILE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure all fields exist
      return {
        ...createDefaultProfile(),
        ...parsed,
        gemStats: { ...createDefaultProfile().gemStats, ...parsed.gemStats }
      };
    } catch (e) {
      console.warn('Failed to parse user profile from localStorage', e);
    }
  }

  const defaultProfile = createDefaultProfile();
  saveUserProfile(defaultProfile);
  return defaultProfile;
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function createDefaultProfile(): UserProfile {
  return {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name: 'Renaissance Merchant',
    avatar: '👨‍💼',
    title: 'Jewel Merchant',
    level: 1,
    xp: 0,
    elo: 1200,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    totalPrestigePoints: 0,
    highestSingleGameScore: 0,
    fastestWinTurns: 999,
    gemStats: { emerald: 0, diamond: 0, sapphire: 0, ruby: 0, onyx: 0 },
    achievements: INITIAL_ACHIEVEMENTS
  };
}

export function recordMatchResult(
  won: boolean,
  prestigePoints: number,
  totalTurns: number,
  purchasedCardsGems: { emerald: number; diamond: number; sapphire: number; ruby: number; onyx: number },
  noblesClaimedCount: number,
  reservedCardsCount: number
): UserProfile {
  const profile = getOrCreateUserProfile();

  profile.matchesPlayed += 1;
  profile.totalPrestigePoints += prestigePoints;
  if (prestigePoints > profile.highestSingleGameScore) {
    profile.highestSingleGameScore = prestigePoints;
  }

  if (won) {
    profile.wins += 1;
    profile.elo = Math.min(3000, profile.elo + 25);
    profile.xp += 150;
    if (totalTurns < profile.fastestWinTurns) {
      profile.fastestWinTurns = totalTurns;
    }
  } else {
    profile.losses += 1;
    profile.elo = Math.max(800, profile.elo - 15);
    profile.xp += 40;
  }

  // Level up threshold: 300 XP per level
  profile.level = 1 + Math.floor(profile.xp / 300);

  // Update gem stats
  profile.gemStats.emerald += purchasedCardsGems.emerald || 0;
  profile.gemStats.diamond += purchasedCardsGems.diamond || 0;
  profile.gemStats.sapphire += purchasedCardsGems.sapphire || 0;
  profile.gemStats.ruby += purchasedCardsGems.ruby || 0;
  profile.gemStats.onyx += purchasedCardsGems.onyx || 0;

  // Evaluate achievements
  profile.achievements = profile.achievements.map((ach) => {
    if (ach.unlocked) return ach;
    let unlocked = false;

    if (ach.id === 'first_win' && won) unlocked = true;
    if (ach.id === 'gem_baron' && profile.wins >= 10) unlocked = true;
    if (ach.id === 'speed_merchant' && won && totalTurns <= 15) unlocked = true;
    if (ach.id === 'noble_favor' && noblesClaimedCount >= 2) unlocked = true;
    if (ach.id === 'pure_strategy' && won && reservedCardsCount === 0) unlocked = true;
    if (ach.id === 'high_scorer' && prestigePoints >= 18) unlocked = true;

    if (unlocked) {
      return { ...ach, unlocked: true, unlockedAt: Date.now() };
    }
    return ach;
  });

  // Dynamic Title Assignment
  if (profile.wins >= 25) profile.title = 'Grand Archduke';
  else if (profile.wins >= 15) profile.title = 'Gem King';
  else if (profile.wins >= 5) profile.title = 'Master Sculptor';
  else if (profile.wins >= 1) profile.title = 'Jewel Trader';

  saveUserProfile(profile);
  return profile;
}
