import React from 'react';
import { DevelopmentCard, Player, GemColor } from '../../engine/types.js';
import { canAffordCard, calculatePlayerDiscounts } from '../../engine/gameEngine.js';

interface BuyModalProps {
  card: DevelopmentCard | null;
  player: Player;
  onConfirmBuy: () => void;
  onCancel: () => void;
  onReserveCard?: () => void;
}

const GEM_COLOR_MAP: Record<GemColor, { bg: string; text: string; icon: string }> = {
  emerald: { bg: '#047857', text: '#FFF', icon: 'E' },
  diamond: { bg: '#F8FAFC', text: '#000', icon: 'D' },
  sapphire: { bg: '#1D4ED8', text: '#FFF', icon: 'S' },
  ruby: { bg: '#DC2626', text: '#FFF', icon: 'R' },
  onyx: { bg: '#334155', text: '#FFF', icon: 'O' }
};

export const BuyModal: React.FC<BuyModalProps> = ({
  card,
  player,
  onConfirmBuy,
  onCancel,
  onReserveCard
}) => {
  if (!card) return null;

  const { canAfford, goldNeeded, tokensToPay } = canAffordCard(player, card);
  const playerDiscounts = calculatePlayerDiscounts(player);
  const canReserve = player.reservedCards.length < 3;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <h2 className="cinzel-font" style={{ color: '#D4AF37', marginBottom: '4px', textAlign: 'center' }}>
          Purchase Development Card
        </h2>

        {/* Card Specs */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Tier {card.tier} Card</span>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#D4AF37' }}>+{card.prestigePoints} Prestige Points</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span>Permanent Discount Granted:</span>
            <span style={{ padding: '3px 8px', borderRadius: '6px', background: GEM_COLOR_MAP[card.gemBonus].bg, color: GEM_COLOR_MAP[card.gemBonus].text, fontWeight: 800 }}>
              +1 {card.gemBonus.toUpperCase()} {GEM_COLOR_MAP[card.gemBonus].icon}
            </span>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '8px' }}>Payment Breakdown:</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
              const req = card.cost[col] || 0;
              if (req === 0) return null;
              const disc = playerDiscounts[col] || 0;
              const netTokenCost = Math.max(0, req - disc);
              const tokensPaid = tokensToPay[col] || 0;

              return (
                <div key={col} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{col}:</span>
                  <span>
                    Req: {req} | Covered by Discounts: <strong style={{ color: '#047857' }}>-{disc}</strong> | Pay Tokens: <strong style={{ color: '#D4AF37' }}>{netTokenCost}</strong>
                  </span>
                </div>
              );
            })}

            {goldNeeded > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,158,11,0.15)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.8rem', border: '1px solid rgba(245,158,11,0.3)' }}>
                <span style={{ fontWeight: 700, color: '#D4AF37' }}>Gold Wildcard Tokens Needed:</span>
                <strong style={{ color: '#D4AF37' }}>{goldNeeded} Gold Token(s)</strong>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
          {canReserve && onReserveCard && (
            <button className="btn-secondary" style={{ flex: 1, borderColor: '#D4AF37', color: '#D4AF37' }} onClick={onReserveCard}>
              Reserve Card (+1 Gold)
            </button>
          )}
          <button className="btn-primary" style={{ flex: 1.2, opacity: canAfford ? 1 : 0.4 }} disabled={!canAfford} onClick={onConfirmBuy}>
            Confirm Buy Card
          </button>
        </div>
      </div>
    </div>
  );
};
