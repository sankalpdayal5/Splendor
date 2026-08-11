import React, { useState } from 'react';
import { GameState, GemColor, ResourceColor, ResourceMap, Noble } from '../engine/types';
import { getTotalGems } from '../engine/gameEngine';

interface ActionModalProps {
  gameState: GameState;
  onConfirmDiscard: (discardTokens: ResourceMap) => void;
  onSelectNoble: (nobleId: string) => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  gameState,
  onConfirmDiscard,
  onSelectNoble
}) => {
  const activePlayer = gameState.players[gameState.currentTurnIndex];
  const [discardMap, setDiscardMap] = useState<ResourceMap>({
    emerald: 0,
    diamond: 0,
    sapphire: 0,
    ruby: 0,
    onyx: 0,
    gold: 0
  });

  if (gameState.phase === 'PHASE_DISCARD') {
    const totalGems = getTotalGems(activePlayer.gems);
    const totalDiscarded = getTotalGems(discardMap);
    const remainingTotal = totalGems - totalDiscarded;
    const isValid = remainingTotal === 10;

    const handleIncrement = (res: ResourceColor) => {
      if ((discardMap[res] || 0) < (activePlayer.gems[res] || 0)) {
        setDiscardMap(prev => ({ ...prev, [res]: (prev[res] || 0) + 1 }));
      }
    };

    const handleDecrement = (res: ResourceColor) => {
      if ((discardMap[res] || 0) > 0) {
        setDiscardMap(prev => ({ ...prev, [res]: (prev[res] || 0) - 1 }));
      }
    };

    return (
      <div className="modal-overlay">
        <div className="glass-panel modal-content">
          <h2 className="cinzel-font" style={{ color: '#EF4444', marginBottom: '12px' }}>
            Token Limit Exceeded!
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginBottom: '16px' }}>
            You hold <strong>{totalGems}</strong> tokens. You must return <strong>{totalGems - 10}</strong> tokens back to the bank to reach 10 tokens.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx', 'gold'] as ResourceColor[]).map((res) => {
              const held = activePlayer.gems[res] || 0;
              if (held === 0) return null;
              const disc = discardMap[res] || 0;

              return (
                <div key={res} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '8px' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{res} (Held: {held})</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button className="btn-secondary" style={{ padding: '2px 10px' }} onClick={() => handleDecrement(res)}>-</button>
                    <span style={{ fontWeight: 800, color: '#F59E0B' }}>{disc}</span>
                    <button className="btn-secondary" style={{ padding: '2px 10px' }} onClick={() => handleIncrement(res)}>+</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: isValid ? '#10B981' : '#EF4444' }}>
              Final Count: <strong>{remainingTotal}/10</strong>
            </span>
            <button
              className="btn-primary"
              disabled={!isValid}
              onClick={() => onConfirmDiscard(discardMap)}
            >
              Confirm Discard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'PHASE_NOBLE_SELECTION') {
    const eligibleNobles = gameState.nobles.filter(n => gameState.pendingNobleOptions.includes(n.id));

    return (
      <div className="modal-overlay">
        <div className="glass-panel modal-content" style={{ maxWidth: '600px' }}>
          <h2 className="cinzel-font" style={{ color: '#F59E0B', marginBottom: '12px' }}>
            Multiple Nobles Offer Audience!
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginBottom: '16px' }}>
            Your gem bonuses qualify you for multiple Noble visits. Select <strong>1 Noble</strong> to receive this turn (+3 pts).
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
            {eligibleNobles.map((noble) => (
              <div
                key={noble.id}
                className="noble-card"
                style={{ cursor: 'pointer' }}
                onClick={() => onSelectNoble(noble.id)}
              >
                <div className="noble-points">+3</div>
                <div className="noble-name">{noble.name}</div>
                <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '4px 8px', marginTop: '6px' }}>
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
