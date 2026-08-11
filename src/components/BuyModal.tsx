import React from 'react';
import { DevelopmentCard, Player, ResourceColor, GemColor } from '../engine/types.js';
import { canAffordCard, calculatePlayerDiscounts } from '../engine/gameEngine.js';
import { CardComponent } from './CardComponent.js';
import { ShoppingBag, Check, Sparkles } from 'lucide-react';

interface BuyModalProps {
  pendingBuy: {
    source: 'grid' | 'reserved';
    tier?: 1 | 2 | 3;
    slotIdx?: number;
    reservedIndex?: number;
    card: DevelopmentCard;
  } | null;
  player: Player;
  colorblindMode: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const BuyModal: React.FC<BuyModalProps> = ({
  pendingBuy,
  player,
  colorblindMode,
  onConfirm,
  onCancel
}) => {
  if (!pendingBuy) return null;

  const card = pendingBuy.card;
  const { tokensToPay } = canAffordCard(player, card);
  const discounts = calculatePlayerDiscounts(player);

  // Compute actual tokens spent vs discounts applied
  const tokenPayments: { resource: ResourceColor; count: number }[] = [];
  const discountSavings: { color: GemColor; count: number }[] = [];

  (['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
    const cost = card.cost[col] || 0;
    if (cost > 0) {
      const disc = Math.min(cost, discounts[col] || 0);
      if (disc > 0) {
        discountSavings.push({ color: col, count: disc });
      }
      const paid = tokensToPay[col] || 0;
      if (paid > 0) {
        tokenPayments.push({ resource: col, count: paid });
      }
    }
  });

  if ((tokensToPay.gold || 0) > 0) {
    tokenPayments.push({ resource: 'gold', count: tokensToPay.gold });
  }

  const isFree = tokenPayments.length === 0;

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '460px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#10B981', marginBottom: '8px' }}>
          <ShoppingBag size={24} />
          <h2 className="cinzel-font" style={{ fontSize: '1.4rem' }}>Confirm Card Purchase</h2>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginBottom: '16px' }}>
          Are you sure you want to purchase this development card?
        </p>

        {/* Card Preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <CardComponent
            card={card}
            canAfford={true}
            canReserve={false}
            colorblindMode={colorblindMode}
          />
        </div>

        {/* Payment & Savings Summary */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10B981',
          padding: '12px 16px',
          borderRadius: '12px',
          fontSize: '0.85rem',
          color: '#F8FAFC',
          marginBottom: '20px',
          textAlign: 'left'
        }}>
          <div style={{ fontWeight: 700, color: '#10B981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Check size={16} /> Token Payment Breakdown:
          </div>

          {isFree ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F59E0B', fontWeight: 700, background: 'rgba(245, 158, 11, 0.15)', padding: '6px 10px', borderRadius: '8px' }}>
              <Sparkles size={16} /> FREE! (Covered 100% by permanent discounts)
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem', marginBottom: discountSavings.length > 0 ? '8px' : 0 }}>
              {tokenPayments.map((item) => (
                <span key={item.resource} style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '6px', textTransform: 'capitalize', fontWeight: 600 }}>
                  {item.count} {item.resource} {item.resource === 'gold' ? '(Wildcard)' : 'token(s)'}
                </span>
              ))}
            </div>
          )}

          {discountSavings.length > 0 && !isFree && (
            <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span>Discounts Applied:</span>
              {discountSavings.map((d) => (
                <span key={d.color} style={{ color: '#10B981', fontWeight: 600, textTransform: 'capitalize' }}>
                  -{d.count} {d.color}
                </span>
              ))}
            </div>
          )}

          {card.prestigePoints > 0 && (
            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700 }}>
              ★ Grants +{card.prestigePoints} Prestige Points upon purchase!
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={onConfirm}>
            Confirm Purchase
          </button>
        </div>
      </div>
    </div>
  );
};
