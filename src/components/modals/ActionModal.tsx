import React, { useState } from 'react';
import { GameState, GameAction, GemColor, ResourceMap } from '../../engine/types.js';
import { calculatePlayerDiscounts, getTotalGems } from '../../engine/gameEngine.js';

interface ActionModalProps {
  gameState: GameState;
  onConfirmDiscard: (tokens: ResourceMap) => void;
  onSelectNoble: (nobleId: string) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  gameState,
  onConfirmDiscard,
  onSelectNoble
}) => {
  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const totalTokens = getTotalGems(activePlayer.gems);
  const excessCount = Math.max(0, totalTokens - 10);

  const [discardGems, setDiscardGems] = useState<ResourceMap>({
    emerald: 0, diamond: 0, sapphire: 0, ruby: 0, onyx: 0, gold: 0
  });

  const selectedTotal = getTotalGems(discardGems);

  const handleAdjustDiscard = (col: keyof ResourceMap, delta: number) => {
    const currentHolding = activePlayer.gems[col] || 0;
    const currentDiscarded = discardGems[col] || 0;
    const nextVal = currentDiscarded + delta;

    if (nextVal < 0 || nextVal > currentHolding) return;
    if (delta > 0 && selectedTotal >= excessCount) return;

    setDiscardGems((prev) => ({ ...prev, [col]: nextVal }));
  };

  if (gameState.phase === 'PHASE_DISCARD') {
    return (
      <div className="modal-overlay">
        <div className="glass-panel modal-content" style={{ maxWidth: '440px' }}>
          <h2 className="cinzel-font" style={{ color: '#EF4444', marginBottom: '8px', textAlign: 'center' }}>
            Token Holding Limit Exceeded
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#CBD5E1', textAlign: 'center', marginBottom: '16px' }}>
            You hold <strong>{totalTokens}</strong> tokens (Max allowed: 10). Please select <strong>{excessCount}</strong> token(s) to return to the bank.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx', 'gold'] as const).map((col) => {
              const holding = activePlayer.gems[col] || 0;
              if (holding === 0) return null;

              return (
                <div key={col} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '8px' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{col} (Hold: {holding})</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="btn-secondary" style={{ padding: '2px 10px', minHeight: '32px' }} onClick={() => handleAdjustDiscard(col, -1)}>-</button>
                    <span style={{ fontWeight: 800, width: '20px', textAlign: 'center' }}>{discardGems[col] || 0}</span>
                    <button className="btn-secondary" style={{ padding: '2px 10px', minHeight: '32px' }} onClick={() => handleAdjustDiscard(col, 1)}>+</button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', opacity: selectedTotal === excessCount ? 1 : 0.5 }}
            disabled={selectedTotal !== excessCount}
            onClick={() => onConfirmDiscard(discardGems)}
          >
            Confirm Discard ({selectedTotal}/{excessCount})
          </button>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'PHASE_NOBLE_SELECTION') {
    const eligibleNobles = gameState.nobles.filter((n) => gameState.pendingNobleOptions.includes(n.id));

    return (
      <div className="modal-overlay">
        <div className="glass-panel modal-content" style={{ maxWidth: '500px' }}>
          <h2 className="cinzel-font" style={{ color: '#F59E0B', marginBottom: '8px', textAlign: 'center' }}>
            Choose a Visiting Noble
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#CBD5E1', textAlign: 'center', marginBottom: '16px' }}>
            Multiple nobles wish to visit your merchant house! Select which noble you wish to claim.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {eligibleNobles.map((noble) => (
              <div
                key={noble.id}
                className="noble-tile"
                style={{ width: '100%', height: '110px', cursor: 'pointer', border: '2px solid #F59E0B' }}
                onClick={() => onSelectNoble(noble.id)}
              >
                <div className="noble-points">+{noble.prestigePoints} PP</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>{noble.name}</div>
                <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '4px', minHeight: '30px' }}>
                  Select Noble
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
