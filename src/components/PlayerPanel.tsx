import React from 'react';
import { Player, GemColor } from '../engine/types';
import { calculatePlayerDiscounts, getTotalGems } from '../engine/gameEngine';
import { Bookmark, Layers, Clock } from 'lucide-react';

interface PlayerPanelProps {
  player: Player;
  isActiveTurn: boolean;
  isSelf: boolean;
  lastAction?: string;
  onOpenReservedModal?: () => void;
  onOpenOwnedModal?: () => void;
}

const GEM_COLOR_MAP: Record<GemColor, { bg: string; text: string }> = {
  emerald: { bg: '#10B981', text: '#000' },
  diamond: { bg: '#F8FAFC', text: '#000' },
  sapphire: { bg: '#3B82F6', text: '#FFF' },
  ruby: { bg: '#EF4444', text: '#FFF' },
  onyx: { bg: '#334155', text: '#FFF' }
};

export const PlayerPanel: React.FC<PlayerPanelProps> = ({
  player,
  isActiveTurn,
  isSelf,
  lastAction,
  onOpenReservedModal,
  onOpenOwnedModal
}) => {
  const discounts = calculatePlayerDiscounts(player);
  const totalTokens = getTotalGems(player.gems);

  return (
    <div className={`player-card ${isActiveTurn ? 'active-turn' : ''}`}>
      <div className="player-header">
        <div className="player-name">
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: player.color }} />
          {player.name}
          {player.isBot && <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>(Bot)</span>}
        </div>
        <div className="player-score" title="Prestige Points">
          {player.prestigePoints} <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>pts</span>
        </div>
      </div>

      {/* Last Action Indicator */}
      <div
        style={{
          fontSize: '0.75rem',
          color: '#CBD5E1',
          background: 'rgba(0,0,0,0.3)',
          padding: '4px 8px',
          borderRadius: '6px',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
        title={lastAction || 'No actions taken yet'}
      >
        <Clock size={12} color="#F59E0B" />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {lastAction ? lastAction : 'Awaiting turn...'}
        </span>
      </div>

      <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Tokens: <strong style={{ color: totalTokens > 10 ? '#EF4444' : '#F8FAFC' }}>{totalTokens}/10</strong></span>
        <span>Cards: <strong>{player.cards.length}</strong></span>
        <span>Nobles: <strong>{player.nobles.length}</strong></span>
      </div>

      {/* Card Bonus & Token Grid */}
      <div className="player-resources-grid">
        {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
          const bonus = discounts[col] || 0;
          const tokens = player.gems[col] || 0;
          const meta = GEM_COLOR_MAP[col];

          return (
            <div key={col} className="res-box" style={{ borderTop: `2px solid ${meta.bg}` }}>
              <span className="res-bonus">+{bonus}</span>
              <span className="res-gems">{tokens}</span>
            </div>
          );
        })}

        {/* Gold Tokens */}
        <div className="res-box" style={{ borderTop: '2px solid #F59E0B' }}>
          <span className="res-bonus" style={{ color: '#F59E0B' }}>Gold</span>
          <span className="res-gems">{player.gems.gold || 0}</span>
        </div>
      </div>

      {/* Action Buttons for Card Modals */}
      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '6px' }}>
        <button
          className="btn-secondary"
          style={{ flex: 1, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px 4px' }}
          onClick={onOpenOwnedModal}
          title="View owned cards collection"
        >
          <Layers size={13} color="#10B981" />
          Owned ({player.cards.length})
        </button>

        <button
          className="btn-secondary"
          style={{ flex: 1, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px 4px' }}
          onClick={onOpenReservedModal}
          title="View reserved cards hand"
        >
          <Bookmark size={13} color="#F59E0B" />
          Reserved ({player.reservedCards.length}/3)
        </button>
      </div>
    </div>
  );
};
