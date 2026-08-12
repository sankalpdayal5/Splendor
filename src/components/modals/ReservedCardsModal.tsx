import React from 'react';
import { Player, DevelopmentCard } from '../../engine/types.js';
import { canAffordCard } from '../../engine/gameEngine.js';
import { CardComponent } from '../game/CardComponent.js';
import { soundManager } from '../../utils/SoundManager.js';

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
    <div className="modal-overlay" onClick={() => {
      soundManager.playButtonClick();
      onClose();
    }}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px', border: '1.5px solid #F59E0B', boxShadow: '0 10px 30px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(245,158,11,0.2)', paddingBottom: '10px' }}>
          <div>
            <h2 className="cinzel-font" style={{ color: '#F59E0B', fontSize: '1.25rem', margin: 0 }}>
              Reserved Hand ({player.reservedCards.length} / 3)
            </h2>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              Cards stored in private hand. Purchase directly on your turn when affordable.
            </span>
          </div>
          <button className="btn-secondary" onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}>Close</button>
        </div>

        {player.reservedCards.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B', fontSize: '0.88rem' }}>
            No reserved cards in hand. Click any development card or tier deck on the board to reserve (+1 Gold Token).
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '10px' }}>
            {player.reservedCards.map((card) => {
              const { canAfford } = canAffordCard(player, card);

              return (
                <div key={card.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ width: '100%', maxWidth: '108px' }}>
                    <CardComponent
                      card={card}
                      canAfford={canAfford}
                      canReserve={false}
                      colorblindMode={colorblindMode}
                    />
                  </div>
                  <button
                    className="btn-primary"
                    style={{
                      width: '100%',
                      fontSize: '0.78rem',
                      padding: '6px',
                      opacity: canAfford ? 1 : 0.45,
                      background: canAfford ? 'linear-gradient(135deg, #10B981, #047857)' : 'rgba(255,255,255,0.08)',
                      borderColor: canAfford ? '#34D399' : 'rgba(255,255,255,0.1)'
                    }}
                    disabled={!canAfford}
                    onClick={() => {
                      soundManager.playCardBuy(card.prestigePoints);
                      onBuyReservedCard(card);
                    }}
                  >
                    {canAfford ? 'Purchase Card' : 'Cannot Afford'}
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
