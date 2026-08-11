import React from 'react';
import { DevelopmentCard, Player } from '../engine/types';
import { canAffordCard } from '../engine/gameEngine';
import { CardComponent } from './CardComponent';
import { Bookmark, X, ShoppingBag } from 'lucide-react';

interface ReservedCardsModalProps {
  player: Player;
  isActiveTurn: boolean;
  colorblindMode: boolean;
  onBuyReservedCard: (index: number) => void;
  onClose: () => void;
}

export const ReservedCardsModal: React.FC<ReservedCardsModalProps> = ({
  player,
  isActiveTurn,
  colorblindMode,
  onBuyReservedCard,
  onClose
}) => {
  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B' }}>
            <Bookmark size={24} />
            <h2 className="cinzel-font" style={{ fontSize: '1.4rem' }}>
              Reserved Cards ({player.reservedCards.length}/3)
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close Modal"><X size={20} /></button>
        </div>

        {player.reservedCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#94A3B8' }}>
            You have no reserved cards in hand.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            {player.reservedCards.map((card, idx) => {
              const afford = canAffordCard(player, card).canAfford;

              return (
                <div key={card.id || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <CardComponent
                    card={card}
                    canAfford={isActiveTurn && afford}
                    canReserve={false}
                    colorblindMode={colorblindMode}
                  />

                  {isActiveTurn && (
                    <button
                      className="btn-primary"
                      disabled={!afford}
                      style={{ fontSize: '0.8rem', padding: '6px 12px', width: '100%' }}
                      onClick={() => {
                        onBuyReservedCard(idx);
                        onClose();
                      }}
                    >
                      <ShoppingBag size={14} style={{ marginRight: '4px' }} />
                      {afford ? 'Buy Card' : 'Cannot Afford'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button className="btn-secondary" style={{ width: '100%' }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
