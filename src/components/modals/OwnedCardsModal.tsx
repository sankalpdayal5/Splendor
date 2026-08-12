import React, { useState } from 'react';
import { Player, GemColor } from '../../engine/types.js';
import { CardComponent } from '../game/CardComponent.js';
import { soundManager } from '../../utils/SoundManager.js';
import { GEM_META } from '../../utils/gemMeta.js';

interface OwnedCardsModalProps {
  player: Player;
  colorblindMode: boolean;
  onClose: () => void;
}

export const OwnedCardsModal: React.FC<OwnedCardsModalProps> = ({
  player,
  colorblindMode,
  onClose
}) => {
  const [selectedFilter, setSelectedFilter] = useState<GemColor | 'all'>('all');

  const filteredCards = selectedFilter === 'all'
    ? player.cards
    : player.cards.filter((c) => c.gemBonus === selectedFilter);

  return (
    <div className="modal-overlay" onClick={() => {
      soundManager.playButtonClick();
      onClose();
    }}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px', maxHeight: '85vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '10px' }}>
          <div>
            <h2 className="cinzel-font" style={{ color: '#D4AF37', fontSize: '1.3rem', margin: 0 }}>
              {player.name}'s Purchased Gallery
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Total Cards: {player.cards.length} | Prestige Points: <strong style={{ color: '#F59E0B' }}>{player.prestigePoints} PP</strong>
            </span>
          </div>
          <button className="btn-secondary" onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}>Close</button>
        </div>

        {/* Gem Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            className={`btn-secondary ${selectedFilter === 'all' ? 'active' : ''}`}
            style={{ fontSize: '0.75rem', padding: '4px 10px', background: selectedFilter === 'all' ? '#D4AF37' : 'rgba(255,255,255,0.08)', color: selectedFilter === 'all' ? '#000' : '#FFF' }}
            onClick={() => {
              soundManager.playButtonClick();
              setSelectedFilter('all');
            }}
          >
            All ({player.cards.length})
          </button>
          {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
            const count = player.cards.filter((c) => c.gemBonus === col).length;
            const meta = GEM_META[col];
            return (
              <button
                key={col}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '4px 10px', background: selectedFilter === col ? meta.bg : 'rgba(255,255,255,0.08)', color: selectedFilter === col ? meta.text : '#FFF' }}
                onClick={() => {
                  soundManager.playButtonClick();
                  setSelectedFilter(col);
                }}
              >
                {meta.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Cards Grid Showcase - Identical Layout & Card Container Size (108px) as ReservedCardsModal */}
        {filteredCards.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
            No development cards purchased under this bonus type.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredCards.map((card) => (
              <div key={card.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '100%', maxWidth: '108px' }}>
                  <CardComponent
                    card={card}
                    canAfford={false}
                    canReserve={false}
                    colorblindMode={colorblindMode}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
