import React from 'react';
import { DevelopmentCard, Player, GemColor } from '../../engine/types.js';
import { canAffordCard, calculatePlayerDiscounts } from '../../engine/gameEngine.js';
import { CardComponent } from '../game/CardComponent.js';
import { soundManager } from '../../utils/SoundManager.js';
import { GEM_META } from '../../utils/gemMeta.js';

interface BuyModalProps {
  card: DevelopmentCard | null;
  player: Player;
  onConfirmBuy: () => void;
  onCancel: () => void;
  onReserveCard?: () => void;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  card,
  player,
  onConfirmBuy,
  onCancel,
  onReserveCard
}) => {
  if (!card) return null;

  const { canAfford, goldNeeded } = canAffordCard(player, card);
  const playerDiscounts = calculatePlayerDiscounts(player);
  const canReserve = player.reservedCards.length < 3;

  return (
    <div className="modal-overlay" onClick={() => {
      soundManager.playButtonClick();
      onCancel();
    }}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', border: '1.5px solid #10B981', boxShadow: '0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(16,185,129,0.25)' }}>
        <h2 className="cinzel-font" style={{ color: '#10B981', marginBottom: '14px', textAlign: 'center', fontSize: '1.3rem' }}>
          Purchase Development Card
        </h2>

        {/* Card Showcase & Payment Layout */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ flexShrink: 0, width: '100px' }}>
            <CardComponent
              card={card}
              canAfford={canAfford}
              canReserve={false}
              colorblindMode={false}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 600 }}>Tier {card.tier} Card</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#F59E0B' }}>+{card.prestigePoints} PP</span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Permanent Bonus:</span>
              <span style={{ padding: '2px 8px', borderRadius: '6px', background: GEM_META[card.gemBonus].bg, color: GEM_META[card.gemBonus].text, fontWeight: 900, fontSize: '0.75rem' }}>
                +1 {card.gemBonus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Breakdown */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Payment Breakdown
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
              const req = card.cost[col] || 0;
              if (req === 0) return null;
              const disc = playerDiscounts[col] || 0;
              const netTokenCost = Math.max(0, req - disc);
              const meta = GEM_META[col];

              return (
                <div key={col} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: meta.bg }} />
                    <span style={{ textTransform: 'capitalize', fontWeight: 700, color: '#F8FAFC' }}>{col}</span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.78rem' }}>
                    <span>Req: <strong>{req}</strong></span>
                    {disc > 0 && <span style={{ color: '#10B981', fontWeight: 800 }}>Bonus: -{disc}</span>}
                    <span>Pay: <strong style={{ color: '#F59E0B' }}>{netTokenCost} Token(s)</strong></span>
                  </div>
                </div>
              );
            })}

            {goldNeeded > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(245,158,11,0.15)', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid rgba(245,158,11,0.4)' }}>
                <span style={{ fontWeight: 800, color: '#F59E0B' }}>★ Gold Wildcards Applied:</span>
                <strong style={{ color: '#F59E0B' }}>{goldNeeded} Gold Token(s)</strong>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => {
            soundManager.playButtonClick();
            onCancel();
          }}>Cancel</button>
          {canReserve && onReserveCard && (
            <button className="btn-secondary" style={{ flex: 1, borderColor: '#D4AF37', color: '#D4AF37' }} onClick={() => {
              soundManager.playCardReserve();
              onReserveCard();
            }}>
              Reserve (+1 Gold)
            </button>
          )}
          <button className="btn-primary" style={{ flex: 1.2, opacity: canAfford ? 1 : 0.4, background: 'linear-gradient(135deg, #10B981, #047857)', borderColor: '#34D399' }} disabled={!canAfford} onClick={() => {
            soundManager.playCardBuy(card.prestigePoints);
            onConfirmBuy();
          }}>
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
};
