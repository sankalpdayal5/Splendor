import React from 'react';
import { Player } from '../../engine/types.js';
import { Smartphone, Play } from 'lucide-react';
import { Haptics } from '../../utils/haptics.js';

interface PassAndPlayModalProps {
  player: Player;
  turnNumber: number;
  onStartTurn: () => void;
}

export const PassAndPlayModal: React.FC<PassAndPlayModalProps> = ({
  player,
  turnNumber,
  onStartTurn
}) => {
  return (
    <div className="modal-overlay" style={{ zIndex: 3000 }}>
      <div
        className="glass-panel modal-content"
        style={{
          maxWidth: '420px',
          textAlign: 'center',
          border: `2px solid ${player.color}`,
          boxShadow: `0 0 30px ${player.color}40, 0 10px 40px rgba(0,0,0,0.8)`,
          padding: '32px 24px',
          animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: `${player.color}20`,
            border: `2px solid ${player.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}
        >
          <Smartphone size={32} color={player.color} />
        </div>

        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#94A3B8',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          TURN {turnNumber} — PASS & PLAY
        </span>

        <h2
          className="cinzel-font"
          style={{ color: player.color, fontSize: '1.6rem', marginTop: '6px', marginBottom: '8px' }}
        >
          {player.name}'s Turn
        </h2>

        <p style={{ color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5 }}>
          Please hand the device to <strong>{player.name}</strong> to make their move.
        </p>

        <button
          className="btn-primary"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '1rem',
            background: `linear-gradient(135deg, ${player.color}, ${player.color}DD)`,
            border: 'none',
            color: '#FFF',
            boxShadow: `0 4px 14px ${player.color}60`
          }}
          onClick={() => {
            Haptics.cardAction();
            onStartTurn();
          }}
        >
          I am {player.name} — Start Turn <Play size={18} style={{ marginLeft: '6px' }} />
        </button>
      </div>
    </div>
  );
};
