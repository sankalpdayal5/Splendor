import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../engine/types';
import { Trophy, RefreshCw } from 'lucide-react';
import { soundManager } from '../utils/SoundManager';

interface VictoryModalProps {
  gameState: GameState;
  onRematch: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ gameState, onRematch }) => {
  const winnerIds = gameState.winnerIds || [];
  const winners = gameState.players.filter(p => winnerIds.includes(p.id));

  useEffect(() => {
    soundManager.playVictoryFanfare();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore if canvas-confetti fallback
    }
  }, []);

  const getRowStyle = (isWinner: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: isWinner ? 'rgba(245, 158, 11, 0.15)' : 'rgba(0,0,0,0.4)',
    border: isWinner ? '1px solid var(--gem-gold)' : '1px solid rgba(255,255,255,0.08)',
    padding: '10px 16px',
    borderRadius: '10px'
  });

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '520px', textAlign: 'center' }}>
        <Trophy size={64} color="#F59E0B" style={{ margin: '0 auto 12px' }} />
        <h1 className="cinzel-font" style={{ color: '#F59E0B', fontSize: '2.2rem', marginBottom: '8px' }}>
          Game Over!
        </h1>
        <h2 style={{ fontSize: '1.4rem', color: '#F8FAFC', marginBottom: '16px' }}>
          {winners.map(w => w.name).join(' & ')} {winners.length > 1 ? 'Share Victory!' : 'Wins!'}
        </h2>

        {/* Final Scoreboard */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {gameState.players.map((player) => {
            const isWinner = winnerIds.includes(player.id);

            return (
              <div key={player.id} style={getRowStyle(isWinner)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: player.color }} />
                  {player.name}
                  {isWinner && <span style={{ color: '#F59E0B', fontSize: '0.85rem' }}>👑 Winner</span>}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem' }}>
                  <span>Cards: <strong>{player.cards.length}</strong></span>
                  <span style={{ color: '#F59E0B', fontWeight: 800 }}>{player.prestigePoints} pts</span>
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn-primary" style={{ width: '100%' }} onClick={onRematch}>
          <RefreshCw size={18} style={{ marginRight: '8px' }} /> Play Rematch
        </button>
      </div>
    </div>
  );
};
