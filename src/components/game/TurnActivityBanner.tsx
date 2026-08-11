import React, { useState } from 'react';
import { GameState, GameActionLog } from '../../engine/types.js';
import { History, ChevronDown, ChevronUp, Activity, User, Bot } from 'lucide-react';
import { soundManager } from '../../utils/SoundManager.js';

interface TurnActivityBannerProps {
  gameState: GameState;
}

export const TurnActivityBanner: React.FC<TurnActivityBannerProps> = React.memo(({ gameState }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const moveHistory = gameState.moveHistory || [];
  const latestMove: GameActionLog | undefined = moveHistory[moveHistory.length - 1];

  if (!latestMove && moveHistory.length === 0) {
    return (
      <div className="glass-panel turn-activity-banner" style={bannerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '0.8rem' }}>
          <Activity size={16} color="#D4AF37" />
          <span>Match Started — Awaiting Turn 1 actions...</span>
        </div>
      </div>
    );
  }

  const actingPlayer = gameState.players.find(p => p.id === latestMove?.playerId);
  const playerColor = actingPlayer?.color || '#D4AF37';

  return (
    <div
      className="glass-panel turn-activity-banner"
      style={{
        ...bannerStyle,
        borderLeft: `4px solid ${playerColor}`,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Top Main Banner Line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: `${playerColor}25`,
              color: playerColor,
              border: `1px solid ${playerColor}60`,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              flexShrink: 0
            }}
          >
            LAST MOVE
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {actingPlayer?.isBot ? (
              <Bot size={16} color={playerColor} style={{ flexShrink: 0 }} />
            ) : (
              <User size={16} color={playerColor} style={{ flexShrink: 0 }} />
            )}

            <strong style={{ color: '#F8FAFC', fontSize: '0.85rem', fontWeight: 800 }}>
              {latestMove?.playerName}:
            </strong>

            <span className="selectable-text" style={{ color: '#CBD5E1', fontSize: '0.83rem', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {latestMove?.description}
            </span>
          </div>
        </div>

        <button
          className="btn-secondary"
          style={{
            padding: '3px 10px',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            borderRadius: '6px',
            flexShrink: 0
          }}
          onClick={() => {
            soundManager.playButtonClick();
            setIsExpanded(!isExpanded);
          }}
          title="Toggle Match Action History Log"
        >
          <History size={14} color="#D4AF37" />
          <span>History ({moveHistory.length})</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Expandable History Drawer */}
      {isExpanded && (
        <div
          style={{
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            maxHeight: '180px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700, marginBottom: '2px', textTransform: 'uppercase' }}>
            Full Match Activity Log:
          </div>
          {moveHistory
            .slice()
            .reverse()
            .map((entry, idx) => {
              const p = gameState.players.find(pl => pl.id === entry.playerId);
              const col = p?.color || '#D4AF37';

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderLeft: `3px solid ${col}`,
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>
                      T{entry.turnNumber}
                    </span>
                    <strong style={{ color: col }}>{entry.playerName}</strong>
                    <span className="selectable-text" style={{ color: '#E2E8F0' }}>{entry.description}</span>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
});

const bannerStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 14px',
  borderRadius: '10px',
  marginBottom: '10px',
  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
  border: '1px solid rgba(212, 175, 55, 0.3)',
  transition: 'all 0.25s ease'
};
