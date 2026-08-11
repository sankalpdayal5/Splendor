import React from 'react';
import { DevelopmentCard, Player, GemColor } from '../../engine/types.js';

interface ReserveModalProps {
  card: DevelopmentCard | null;
  player: Player;
  onConfirmReserve: () => void;
  onCancel: () => void;
}

const GEM_COLOR_MAP: Record<GemColor, { bg: string; text: string; icon: string }> = {
  emerald: { bg: '#047857', text: '#FFF', icon: 'E' },
  diamond: { bg: '#F8FAFC', text: '#000', icon: 'D' },
  sapphire: { bg: '#1D4ED8', text: '#FFF', icon: 'S' },
  ruby: { bg: '#DC2626', text: '#FFF', icon: 'R' },
  onyx: { bg: '#334155', text: '#FFF', icon: 'O' }
};

export const ReserveModal: React.FC<ReserveModalProps> = ({
  card,
  player,
  onConfirmReserve,
  onCancel
}) => {
  if (!card) return null;

  const currentReservedCount = player.reservedCards.length;
  const isFull = currentReservedCount >= 3;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
        <h2 className="cinzel-font" style={{ color: '#D4AF37', marginBottom: '6px', textAlign: 'center' }}>
          Reserve Development Card
        </h2>

        {isFull ? (
          <div style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid #DC2626', padding: '12px', borderRadius: '8px', color: '#FFF', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>
            Reserve Holding Limit Reached (Max 3 Cards Allowed). You cannot reserve more cards until you buy one from your hand.
          </div>
        ) : (
          <p style={{ fontSize: '0.85rem', color: '#CBD5E1', textAlign: 'center', marginBottom: '16px' }}>
            Reserving this card stores it in your private hand and collects <strong>+1 Gold Wildcard Token</strong> from the bank (if available).
          </p>
        )}

        {/* Card Specs */}
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '12px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: '#94A3B8' }}>Tier {card.tier} Card</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#D4AF37' }}>+{card.prestigePoints} Prestige Points</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span>Bonus Gem Type:</span>
            <span style={{ padding: '3px 8px', borderRadius: '6px', background: GEM_COLOR_MAP[card.gemBonus].bg, color: GEM_COLOR_MAP[card.gemBonus].text, fontWeight: 800 }}>
              +1 {card.gemBonus.toUpperCase()} {GEM_COLOR_MAP[card.gemBonus].icon}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancel}>Cancel</button>
          <button
            className="btn-primary"
            style={{ flex: 1.2, opacity: isFull ? 0.4 : 1 }}
            disabled={isFull}
            onClick={onConfirmReserve}
          >
            Confirm Reserve (+1 Gold)
          </button>
        </div>
      </div>
    </div>
  );
};
