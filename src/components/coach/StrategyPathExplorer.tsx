import React from 'react';
import { GameState } from '../../engine/types.js';
import { Target, Zap, ShieldAlert } from 'lucide-react';

interface StrategyPathExplorerProps {
  gameState: GameState;
  onClose: () => void;
}

export const StrategyPathExplorer: React.FC<StrategyPathExplorerProps> = ({
  gameState,
  onClose
}) => {
  const activePlayer = gameState.players[gameState.currentTurnIndex];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 className="cinzel-font" style={{ color: '#D4AF37' }}>
              Strategy Path Explorer
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              Long-term engine building & noble attraction breakdown for {activePlayer.name}
            </span>
          </div>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Noble Distance Strategy */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Target size={18} color="#D4AF37" />
              <strong style={{ color: '#D4AF37', fontSize: '0.9rem' }}>Closest Noble Requirements</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {gameState.nobles.map((noble) => (
                <div key={noble.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', background: 'rgba(255,255,255,0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                  <span>{noble.name} (+3 PP)</span>
                  <span style={{ color: '#047857', fontWeight: 700 }}>Available for visit</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engine Power Breakdown */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Zap size={18} color="#047857" />
              <strong style={{ color: '#047857', fontSize: '0.9rem' }}>Permanent Engine Power</strong>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#CBD5E1', margin: 0 }}>
              You currently own {activePlayer.cards.length} development cards granting permanent discounts every single turn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
