import React from 'react';
import { DevelopmentCard, Player, GemColor } from '../../engine/types.js';
import { CardComponent } from '../game/CardComponent.js';
import { soundManager } from '../../utils/SoundManager.js';
import { GEM_META } from '../../utils/gemMeta.js';

interface ReserveModalProps {
  card: DevelopmentCard | null;
  player: Player;
  onConfirmReserve: () => void;
  onCancel: () => void;
}

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
    <div className="modal-overlay" onClick={() => {
      soundManager.playButtonClick();
      onCancel();
    }}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', border: '1.5px solid #F59E0B', boxShadow: '0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(245,158,11,0.25)' }}>
        <h2 className="cinzel-font" style={{ color: '#F59E0B', marginBottom: '10px', textAlign: 'center', fontSize: '1.3rem' }}>
          Reserve Development Card
        </h2>

        {isFull ? (
          <div style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid #DC2626', padding: '10px 14px', borderRadius: '8px', color: '#EF4444', fontSize: '0.82rem', marginBottom: '14px', textAlign: 'center', fontWeight: 700 }}>
            Reserve Limit Reached (3/3 Cards). You must purchase a reserved card before reserving more.
          </div>
        ) : (
          <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', padding: '10px 14px', borderRadius: '8px', color: '#FDE047', fontSize: '0.82rem', marginBottom: '14px', textAlign: 'center' }}>
            Stores this card in your private hand and collects <strong>+1 Gold Wildcard Token</strong> from the bank.
          </div>
        )}

        {/* Card Showcase & Specs */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '18px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ flexShrink: 0, width: '96px' }}>
            <CardComponent
              card={card}
              canAfford={false}
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
              <span>Bonus Gem:</span>
              <span style={{ padding: '2px 8px', borderRadius: '6px', background: GEM_META[card.gemBonus].bg, color: GEM_META[card.gemBonus].text, fontWeight: 900, fontSize: '0.75rem' }}>
                {`+1 ${card.gemBonus.toUpperCase()}`}
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Reserved Hand Slots: <strong style={{ color: '#F59E0B' }}>{currentReservedCount} / 3</strong>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => {
            soundManager.playButtonClick();
            onCancel();
          }}>Cancel</button>
          <button
            className="btn-primary"
            style={{ flex: 1.3, opacity: isFull ? 0.4 : 1, background: 'linear-gradient(135deg, #F59E0B, #D4AF37)', color: '#000', border: 'none' }}
            disabled={isFull}
            onClick={() => {
              soundManager.playCardReserve();
              onConfirmReserve();
            }}
          >
            Confirm Reserve (+1 Gold)
          </button>
        </div>
      </div>
    </div>
  );
};
