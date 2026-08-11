import React, { useState } from 'react';
import { Player, GemColor } from '../engine/types';
import { CardComponent } from './CardComponent';
import { Layers, X, Award } from 'lucide-react';
import { calculatePlayerDiscounts } from '../engine/gameEngine';

interface OwnedCardsModalProps {
  player: Player;
  colorblindMode: boolean;
  onClose: () => void;
}

const GEM_META: Record<GemColor, { name: string; bg: string; text: string; icon: string }> = {
  emerald: { name: 'Emerald', bg: '#10B981', text: '#000', icon: '🌿' },
  diamond: { name: 'Diamond', bg: '#F8FAFC', text: '#000', icon: '☀️' },
  sapphire: { name: 'Sapphire', bg: '#3B82F6', text: '#FFF', icon: '💧' },
  ruby: { name: 'Ruby', bg: '#EF4444', text: '#FFF', icon: '🔥' },
  onyx: { name: 'Onyx', bg: '#334155', text: '#FFF', icon: '🛡️' }
};

export const OwnedCardsModal: React.FC<OwnedCardsModalProps> = ({
  player,
  colorblindMode,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<GemColor | 'all'>('all');
  const discounts = calculatePlayerDiscounts(player);

  const filteredCards = selectedCategory === 'all'
    ? player.cards
    : player.cards.filter(c => c.gemBonus === selectedCategory);

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F59E0B' }}>
            <Layers size={24} />
            <h2 className="cinzel-font" style={{ fontSize: '1.4rem' }}>
              {player.name}'s Card Collection ({player.cards.length} Cards)
            </h2>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close Modal"><X size={20} /></button>
        </div>

        {/* Bonus Summary Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '12px' }}>
          <button
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '4px 10px', background: selectedCategory === 'all' ? '#F59E0B' : 'rgba(255,255,255,0.08)', color: selectedCategory === 'all' ? '#000' : '#FFF' }}
            onClick={() => setSelectedCategory('all')}
          >
            All Cards ({player.cards.length})
          </button>
          {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
            const count = discounts[col] || 0;
            const meta = GEM_META[col];
            const isSelected = selectedCategory === col;

            return (
              <button
                key={col}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '4px 10px', background: isSelected ? meta.bg : 'rgba(255,255,255,0.08)', color: isSelected ? meta.text : '#FFF' }}
                onClick={() => setSelectedCategory(col)}
              >
                +{count} {meta.name}
              </button>
            );
          })}
        </div>

        {/* Card Grid */}
        {filteredCards.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: '#94A3B8' }}>
            No cards owned in this category yet.
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '20px' }}>
            {filteredCards.map((card, idx) => (
              <CardComponent
                key={card.id || idx}
                card={card}
                canAfford={false}
                canReserve={false}
                colorblindMode={colorblindMode}
              />
            ))}
          </div>
        )}

        <button className="btn-secondary" style={{ width: '100%' }} onClick={onClose}>
          Close Collection
        </button>
      </div>
    </div>
  );
};
