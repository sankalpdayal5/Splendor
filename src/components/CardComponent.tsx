import React from 'react';
import { DevelopmentCard, GemColor } from '../engine/types.js';
import { soundManager } from '../utils/SoundManager.js';

interface CardComponentProps {
  card: DevelopmentCard | null;
  canAfford: boolean;
  canReserve: boolean;
  colorblindMode: boolean;
  recommendationBadge?: { rank: 1 | 2 | 3; color: string };
  onBuyCard?: () => void;
  onReserveCard?: () => void;
}

const GEM_COLOR_MAP: Record<GemColor, { bg: string; text: string; icon: string }> = {
  emerald: { bg: '#10B981', text: '#000', icon: '🌿' },
  diamond: { bg: '#F8FAFC', text: '#000', icon: '☀️' },
  sapphire: { bg: '#3B82F6', text: '#FFF', icon: '💧' },
  ruby: { bg: '#EF4444', text: '#FFF', icon: '🔥' },
  onyx: { bg: '#334155', text: '#FFF', icon: '🛡️' }
};

export const CardComponent: React.FC<CardComponentProps> = ({
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
      <div className="card-wrapper">
        <div className="card-item empty-slot" style={{ opacity: 0.25, border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>EMPTY</span>
        </div>
      </div>
    );
  }

  const bonusMeta = GEM_COLOR_MAP[card.gemBonus];

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canAfford && onBuyCard) {
      soundManager.playCardBuy();
      onBuyCard();
    } else if (canReserve && onReserveCard) {
      soundManager.playCardReserve();
      onReserveCard();
    }
  };

  return (
    <div className="card-wrapper" style={{ position: 'relative' }}>
      {/* AI Strategy Recommendation Chip Overlay */}
      {recommendationBadge && (
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            zIndex: 10,
            background: recommendationBadge.color,
            color: '#000',
            fontWeight: 800,
            fontSize: '0.7rem',
            padding: '2px 7px',
            borderRadius: '10px',
            boxShadow: `0 0 12px ${recommendationBadge.color}`,
            border: '1px solid #FFF'
          }}
        >
          #{recommendationBadge.rank}
        </div>
      )}

      <div
        className={`card-item ${canAfford ? 'affordable' : ''} ${!canAfford && canReserve ? 'reservable' : ''}`}
        style={recommendationBadge ? { borderColor: recommendationBadge.color, boxShadow: `0 0 16px ${recommendationBadge.color}` } : undefined}
        onClick={handleClick}
        tabIndex={0}
        role="button"
        aria-label={`Tier ${card.tier} card. Grants ${card.prestigePoints} Prestige Points and 1 ${card.gemBonus} bonus. Cost: ${Object.entries(card.cost).map(([c, v]) => `${v} ${c}`).join(', ')}.`}
      >
        <div className="card-top">
          <span className="card-points">{card.prestigePoints > 0 ? card.prestigePoints : ''}</span>
          <div
            className="card-bonus-gem"
            style={{ backgroundColor: bonusMeta.bg, color: bonusMeta.text }}
            title={`${card.gemBonus} bonus`}
          >
            {colorblindMode ? bonusMeta.icon : ''}
          </div>
        </div>

        <div className="card-cost-grid">
          {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
            const costVal = card.cost[col];
            if (!costVal) return null;
            const meta = GEM_COLOR_MAP[col];

            return (
              <div key={col} className="cost-badge" style={{ borderColor: meta.bg }}>
                <span className="cost-circle" style={{ backgroundColor: meta.bg, color: meta.text }}>
                  {costVal}
                </span>
                {colorblindMode && <span style={{ fontSize: '0.65rem' }}>{meta.icon}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
