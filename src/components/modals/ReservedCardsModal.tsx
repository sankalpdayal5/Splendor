import React from 'react';
import { Player, DevelopmentCard } from '../../engine/types.js';
import { canAffordCard } from '../../engine/gameEngine.js';
import { CardComponent } from '../game/CardComponent.js';

interface ReservedCardsModalProps {
  player: Player;
  colorblindMode: boolean;
  onBuyReservedCard: (card: DevelopmentCard) => void;
  onClose: () => void;
}

export const ReservedCardsModal: React.FC<ReservedCardsModalProps> = ({
  player,
  colorblindMode,
  onBuyReservedCard,
  onClose
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 className="cinzel-font" style={{ color: '#D4AF37' }}>
              Reserved Cards Hand ({player.reservedCards.length}/3)
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Cards stored in private hand. Buy directly when affordable.
            </span>
          </div>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>

        {player.reservedCards.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
            No reserved cards in hand. Click any development card or tier deck on the board to reserve (+1 Gold Token).
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            {player.reservedCards.map((card) => {
              const { canAfford } = canAffordCard(player, card);

              return (
                <div key={card.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                  <CardComponent
                    card={card}
                    canAfford={canAfford}
                    canReserve={false}
                    colorblindMode={colorblindMode}
                  />
                  <button
                    className="btn-primary"
                    style={{ width: '100%', fontSize: '0.78rem', padding: '6px', opacity: canAfford ? 1 : 0.4 }}
                    disabled={!canAfford}
                    onClick={() => onBuyReservedCard(card)}
                  >
                    {canAfford ? 'Buy Card' : 'Cannot Afford'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
