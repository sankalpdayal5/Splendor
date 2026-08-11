import React from 'react';
import { Player, GemColor } from '../../engine/types.js';
import { calculatePlayerDiscounts, getTotalGems } from '../../engine/gameEngine.js';
import { soundManager } from '../../utils/SoundManager.js';
import { GEM_META } from '../../utils/gemMeta.js';

interface PlayerPanelProps {
  player: Player;
  isActive: boolean;
  colorblindMode: boolean;
  lastActionDescription?: string;
  onOpenReservedModal: () => void;
  onOpenOwnedCardsModal: () => void;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = React.memo(({
  player,
  isActive,
  colorblindMode,
  lastActionDescription,
  onOpenReservedModal,
  onOpenOwnedCardsModal
}) => {
  const discounts = calculatePlayerDiscounts(player);
  const totalTokens = getTotalGems(player.gems);

  return (
    <div className={`glass-panel player-panel ${isActive ? 'active' : ''}`} style={{ padding: '12px 14px', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: player.color }} />
          <strong style={{ fontSize: '0.95rem', color: '#F8FAFC' }}>
            {player.name} {player.isBot && <small style={{ color: '#94A3B8' }}>(Bot)</small>}
          </strong>
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D4AF37' }}>
          {player.prestigePoints} PP
        </div>
      </div>

      {/* Last Move Sub-Badge */}
      {lastActionDescription && (
        <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#D4AF37', fontWeight: 700 }}>Last:</span> {lastActionDescription}
        </div>
      )}

      {/* Holdings Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', marginBottom: '8px' }}>
        {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
          const gemCount = player.gems[col] || 0;
          const discCount = discounts[col] || 0;
          const meta = GEM_META[col];

          return (
            <div key={col} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '4px 2px', borderRadius: '6px', fontSize: '0.72rem' }}>
              <span style={{ color: meta.bg, fontWeight: 800 }}>+{discCount}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#FFF' }}>{gemCount}</span>
            </div>
          );
        })}

        {/* Gold Wildcards */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'rgba(245,158,11,0.15)', padding: '4px 2px', borderRadius: '6px', fontSize: '0.72rem', border: '1px solid rgba(245,158,11,0.3)' }}>
          <span style={{ color: '#D4AF37', fontWeight: 900 }}>G</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#D4AF37' }}>{player.gems.gold || 0}</span>
        </div>
      </div>

      {/* Buttons for Reserved & Owned Cards */}
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          className="btn-secondary"
          style={{ flex: 1, padding: '4px 6px', fontSize: '0.75rem', minHeight: '36px' }}
          onClick={() => {
            soundManager.playButtonClick();
            onOpenReservedModal();
          }}
        >
          Reserved ({player.reservedCards.length}/3)
        </button>

        <button
          className="btn-secondary"
          style={{ flex: 1, padding: '4px 6px', fontSize: '0.75rem', minHeight: '36px' }}
          onClick={() => {
            soundManager.playButtonClick();
            onOpenOwnedCardsModal();
          }}
        >
          Cards Owned ({player.cards.length})
        </button>
      </div>
    </div>
  );
});
