import React, { useState } from 'react';
import { GameState, GameAction } from '../engine/types.js';
import { getTopRecommendedMoves, RecommendedMove } from '../engine/aiEngine.js';
import { StrategyPathExplorer } from './StrategyPathExplorer.js';
import { Sparkles, Play, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { soundManager } from '../utils/SoundManager.js';

interface LearnModeCoachProps {
  gameState: GameState;
  isSelfTurn: boolean;
  onExecuteAction: (action: GameAction) => void;
}

export const LearnModeCoach: React.FC<LearnModeCoachProps> = ({
  gameState,
  isSelfTurn,
  onExecuteAction
}) => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [expandedPathIndex, setExpandedPathIndex] = useState<number | null>(0); // Default #1 expanded

  const activePlayer = gameState.players[gameState.currentTurnIndex];

  if (!isSelfTurn || activePlayer.isBot || gameState.phase === 'FINISHED') {
    return null;
  }

  const recommendations: RecommendedMove[] = getTopRecommendedMoves(gameState, 3);

  if (recommendations.length === 0) return null;

  return (
    <div
      className="glass-panel"
      style={{
        margin: '0 0 16px 0',
        padding: '14px 18px',
        border: '1px solid var(--gem-gold)',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(11, 14, 20, 0.85) 100%)',
        boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15)',
        borderRadius: '14px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: collapsed ? 0 : '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={22} color="#F59E0B" className="pulse-animation" />
          <h3 className="cinzel-font" style={{ color: '#F59E0B', fontSize: '1.15rem', margin: 0 }}>
            AI Strategy Coach (ISMCTS Engine)
          </h3>
          <span style={{ fontSize: '0.75rem', background: 'rgba(245, 158, 11, 0.2)', color: '#F59E0B', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
            3-Turn Lookahead Simulation
          </span>
        </div>

        <button
          className="btn-icon"
          style={{ padding: '4px' }}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand AI Coach' : 'Collapse AI Coach'}
        >
          {collapsed ? <ChevronDown size={20} color="#F59E0B" /> : <ChevronUp size={20} color="#F59E0B" />}
        </button>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recommendations.map((rec, index) => {
            const isPathExpanded = expandedPathIndex === index;

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: `1px solid ${rec.badgeColor}`,
                  borderRadius: '10px',
                  padding: '12px 14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          background: rec.badgeColor,
                          color: '#000',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          letterSpacing: '0.5px'
                        }}
                      >
                        #{index + 1} {rec.badge}
                      </span>

                      <span
                        style={{
                          fontSize: '0.75rem',
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#F59E0B',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700
                        }}
                      >
                        {rec.winExpectancy}% Win EV
                      </span>

                      <strong style={{ fontSize: '0.95rem', color: '#F8FAFC' }}>{rec.title}</strong>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#CBD5E1', lineHeight: '1.3' }}>
                      {rec.rationale}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      className="btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => setExpandedPathIndex(isPathExpanded ? null : index)}
                      title="Inspect 3-turn strategy roadmap"
                    >
                      <MapPin size={13} color="#F59E0B" />
                      {isPathExpanded ? 'Hide Path' : 'Strategy Path'}
                    </button>

                    <button
                      className="btn-primary"
                      style={{
                        fontSize: '0.8rem',
                        padding: '6px 14px',
                        whiteSpace: 'nowrap',
                        background: `linear-gradient(135deg, ${rec.badgeColor} 0%, #D97706 100%)`
                      }}
                      onClick={() => {
                        soundManager.playGemClick();
                        onExecuteAction(rec.action);
                      }}
                    >
                      <Play size={14} style={{ marginRight: '4px' }} /> Execute
                    </button>
                  </div>
                </div>

                {/* Multi-Turn Strategy Roadmap Explorer */}
                {isPathExpanded && (
                  <StrategyPathExplorer
                    projectedPath={rec.projectedPath}
                    winExpectancy={rec.winExpectancy}
                    badgeColor={rec.badgeColor}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
