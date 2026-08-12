import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../../engine/types.js';
import { Trophy, RefreshCw, LogOut } from 'lucide-react';
import { Haptics } from '../../utils/haptics.js';
import { soundManager } from '../../utils/SoundManager.js';

interface VictoryModalProps {
  gameState: GameState;
  onRematch: () => void;
  onExitGame: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ gameState, onRematch, onExitGame }) => {
  useEffect(() => {
    Haptics.victoryFanfare();
    soundManager.playVictoryFanfare();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  }, []);

  const winner = gameState.players.find((p) => gameState.winnerIds?.includes(p.id)) || gameState.players[0];

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '480px', textAlign: 'center' }}>
        <Trophy size={48} color="#D4AF37" style={{ margin: '0 auto 12px' }} />
        <h1 className="cinzel-font" style={{ color: '#D4AF37', fontSize: '2rem', marginBottom: '4px' }}>
          VICTORY!
        </h1>
        <h2 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '16px' }}>
          {winner.name} Wins The Match!
        </h2>

        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '10px' }}>FINAL SCOREBOARD</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {gameState.players.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D4AF37' }}>{p.prestigePoints} PP ({p.cards.length} cards)</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button className="btn-secondary" style={{ flex: 1, padding: '12px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={onExitGame}>
            <LogOut size={18} /> Exit to Main Menu
          </button>
          <button className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={onRematch}>
            <RefreshCw size={18} /> Play Rematch
          </button>
        </div>
      </div>
    </div>
  );
};
