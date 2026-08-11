import React from 'react';
import { DevelopmentCard, GemColor } from '../../engine/types.js';
import { soundManager } from '../../utils/SoundManager.js';

interface CardComponentProps {
  card: DevelopmentCard | null;
  canAfford: boolean;
  canReserve: boolean;
  colorblindMode: boolean;
  recommendationBadge?: { rank: 1 | 2 | 3; color: string };
  onBuyCard?: () => void;
  onReserveCard?: () => void;
}

const GEM_COLOR_MAP: Record<GemColor, { bg: string; text: string; border: string; glow: string; headerGradient: string; icon: string; name: string }> = {
  emerald: {
    bg: '#047857',
    text: '#FFF',
    border: '#10B981',
    glow: 'rgba(16, 185, 129, 0.4)',
    headerGradient: 'linear-gradient(135deg, #065F46, #047857)',
    icon: 'E',
    name: 'Emerald'
  },
  diamond: {
    bg: '#E2E8F0',
    text: '#0F172A',
    border: '#F8FAFC',
    glow: 'rgba(248, 250, 252, 0.4)',
    headerGradient: 'linear-gradient(135deg, #CBD5E1, #94A3B8)',
    icon: 'D',
    name: 'Diamond'
  },
  sapphire: {
    bg: '#1D4ED8',
    text: '#FFF',
    border: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.4)',
    headerGradient: 'linear-gradient(135deg, #1E40AF, #1D4ED8)',
    icon: 'S',
    name: 'Sapphire'
  },
  ruby: {
    bg: '#DC2626',
    text: '#FFF',
    border: '#EF4444',
    glow: 'rgba(239, 68, 68, 0.4)',
    headerGradient: 'linear-gradient(135deg, #991B1B, #DC2626)',
    icon: 'R',
    name: 'Ruby'
  },
  onyx: {
    bg: '#334155',
    text: '#FFF',
    border: '#64748B',
    glow: 'rgba(100, 116, 139, 0.4)',
    headerGradient: 'linear-gradient(135deg, #1E293B, #334155)',
    icon: 'O',
    name: 'Onyx'
  }
};

export const CardComponent: React.FC<CardComponentProps> = React.memo(({
  card,
  canAfford,
  canReserve,
  colorblindMode,
  recommendationBadge,
  onBuyCard,
  onReserveCard
}) => {
  if (!card) {
    return (
      <div className="card-container">
        <div className="splendor-card empty-slot">
          <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>EMPTY</span>
        </div>
      </div>
    );
  }

  const bonusMeta = GEM_COLOR_MAP[card.gemBonus];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canAfford && onBuyCard) {
      soundManager.playCardBuy(card.prestigePoints);
      onBuyCard();
    } else if (canReserve && onReserveCard) {
      soundManager.playCardReserve();
      onReserveCard();
    }
  };

  const dynamicCardStyle: React.CSSProperties = {
    background: `linear-gradient(160deg, ${bonusMeta.bg}22 0%, rgba(15, 23, 42, 0.96) 65%, rgba(2, 6, 23, 0.99) 100%)`,
    borderColor: recommendationBadge ? recommendationBadge.color : canAfford ? '#10B981' : bonusMeta.border + '60',
    boxShadow: recommendationBadge
      ? `0 0 16px ${recommendationBadge.color}`
      : canAfford
        ? `0 0 14px rgba(16, 185, 129, 0.45), inset 0 0 8px rgba(16, 185, 129, 0.2)`
        : `0 4px 12px rgba(0, 0, 0, 0.5)`
  };

  return (
    <div className="card-container">
      {/* AI Strategy Recommendation Chip */}
      {recommendationBadge && (
        <div
          className="rec-badge"
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            zIndex: 15,
            background: recommendationBadge.color,
            color: '#000',
            fontWeight: 900,
            fontSize: '0.68rem',
            padding: '2px 6px',
            borderRadius: '10px',
            boxShadow: `0 0 10px ${recommendationBadge.color}`,
            border: '1.5px solid #FFF'
          }}
        >
          #{recommendationBadge.rank}
        </div>
      )}

      <div
        className={`splendor-card tier-${card.tier} ${canAfford ? 'affordable' : ''} ${!canAfford && canReserve ? 'reservable' : ''}`}
        style={dynamicCardStyle}
        onClick={handleClick}
        tabIndex={0}
        role="button"
        aria-label={`Tier ${card.tier} card. Grants ${card.prestigePoints} Prestige Points and 1 ${card.gemBonus} bonus. Cost: ${Object.entries(card.cost).map(([c, v]) => `${v} ${c}`).join(', ')}.`}
      >
        {/* Color-Coded Gem Bonus Top Band */}
        <div
          style={{
            background: bonusMeta.headerGradient,
            padding: '4px 6px',
            borderRadius: '6px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '4px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            border: `1px solid ${bonusMeta.border}60`
          }}
        >
          <span className="card-points" style={{ color: card.prestigePoints > 0 ? '#F59E0B' : 'transparent', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            {card.prestigePoints > 0 ? card.prestigePoints : '•'}
          </span>
          <div
            className="card-gem-bonus"
            style={{
              backgroundColor: bonusMeta.bg,
              color: bonusMeta.text,
              border: `1.5px solid ${bonusMeta.border}`,
              fontWeight: 900,
              fontSize: '0.75rem',
              boxShadow: `0 0 6px ${bonusMeta.glow}`
            }}
            title={`${bonusMeta.name} Gem Bonus`}
          >
            {bonusMeta.icon}
          </div>
        </div>

        {/* Bottom Cost List: Gem Costs (Flex Wrap to prevent 4+ item overflow) */}
        <div className="card-cost-list">
          {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
            const costVal = card.cost[col];
            if (!costVal) return null;
            const meta = GEM_COLOR_MAP[col];

            return (
              <div key={col} className="cost-row-item">
                <span
                  className="cost-badge"
                  style={{
                    backgroundColor: meta.bg,
                    color: meta.text,
                    border: `1px solid ${meta.border}80`,
                    boxShadow: `0 2px 4px rgba(0,0,0,0.4)`
                  }}
                >
                  {costVal}
                </span>
                {colorblindMode && <span className="cost-icon" style={{ fontWeight: 800 }}>{meta.icon}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
