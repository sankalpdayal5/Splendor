import React, { useState } from 'react';
import { Player, GemColor } from '../../engine/types.js';

interface OwnedCardsModalProps {
  player: Player;
  colorblindMode: boolean;
  onClose: () => void;
}

const GEM_COLOR_MAP: Record<GemColor, { bg: string; text: string; icon: string; name: string }> = {
  emerald: { bg: '#047857', text: '#FFF', icon: 'E', name: 'Emerald' },
  diamond: { bg: '#F8FAFC', text: '#000', icon: 'D', name: 'Diamond' },
  sapphire: { bg: '#1D4ED8', text: '#FFF', icon: 'S', name: 'Sapphire' },
  ruby: { bg: '#DC2626', text: '#FFF', icon: 'R', name: 'Ruby' },
  onyx: { bg: '#334155', text: '#FFF', icon: 'O', name: 'Onyx' }
};

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
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 className="cinzel-font" style={{ color: '#D4AF37' }}>
              {player.name}'s Purchased Cards
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Total Owned Cards: {player.cards.length} | Prestige Points: {player.prestigePoints}
            </span>
          </div>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>

        {/* Gem Filter Bar */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            className={`btn-secondary ${selectedFilter === 'all' ? 'active' : ''}`}
            style={{ fontSize: '0.75rem', background: selectedFilter === 'all' ? '#D4AF37' : 'rgba(255,255,255,0.08)', color: selectedFilter === 'all' ? '#000' : '#FFF' }}
            onClick={() => setSelectedFilter('all')}
          >
            All ({player.cards.length})
          </button>
          {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
            const count = player.cards.filter((c) => c.gemBonus === col).length;
            const meta = GEM_COLOR_MAP[col];
            return (
              <button
                key={col}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', background: selectedFilter === col ? meta.bg : 'rgba(255,255,255,0.08)', color: selectedFilter === col ? meta.text : '#FFF' }}
                onClick={() => setSelectedFilter(col)}
              >
                {meta.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Cards Grid Display */}
        {filteredCards.length === 0 ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '0.9rem' }}>
            No development cards owned under this gem bonus.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
            {filteredCards.map((card) => {
              const meta = GEM_COLOR_MAP[card.gemBonus];
              return (
                <div
                  key={card.id}
                  className="splendor-card"
                  style={{ height: '120px', padding: '6px', border: '1px solid rgba(255,255,255,0.15)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D4AF37' }}>{card.prestigePoints > 0 ? card.prestigePoints : ''}</span>
                    <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: meta.bg, color: meta.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
                      {meta.icon}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '1px' }}>
                    {Object.entries(card.cost).map(([col, val]) => (
                      <span key={col} style={{ textTransform: 'capitalize' }}>{col}: {val}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
