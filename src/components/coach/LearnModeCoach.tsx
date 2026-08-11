import React, { useState } from 'react';
import { GameState, GameAction } from '../../engine/types.js';
import { RecommendedMove } from '../../engine/aiEngine.js';
import { Sparkles, Brain, Lightbulb, ChevronRight, Volume2 } from 'lucide-react';
import { speechAnnouncer } from '../../utils/SpeechAnnouncer.js';
import { soundManager } from '../../utils/SoundManager.js';
import { Haptics } from '../../utils/haptics.js';

interface LearnModeCoachProps {
  gameState: GameState;
  isSelfTurn?: boolean;
  recommendations: RecommendedMove[];
  onExecuteRecommendation: (action: GameAction) => void;
}

export const LearnModeCoach: React.FC<LearnModeCoachProps> = ({
  gameState,
  recommendations,
  onExecuteRecommendation
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!recommendations || recommendations.length === 0) return null;

  const topRec = recommendations[0];

  const handleAnnounceHint = () => {
    Haptics.gemPick();
    soundManager.playButtonClick();
    speechAnnouncer.announcePolite(`AI Strategy Coach Suggestion: ${topRec.rationale}`);
  };

  return (
    <aside
      className="glass-panel"
      style={{
        position: 'fixed',
        bottom: '96px',
        right: '20px',
        zIndex: 50,
        width: isExpanded ? '340px' : '56px',
        height: isExpanded ? 'auto' : '56px',
        borderRadius: '16px',
        padding: isExpanded ? '14px 16px' : '0',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        border: '1.5px solid #D4AF37',
        boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(212,175,55,0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {!isExpanded ? (
        <button
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#D4AF37'
          }}
          onClick={() => {
            soundManager.playButtonClick();
            setIsExpanded(true);
          }}
          title="Expand AI Strategy Coach"
        >
          <Sparkles size={24} />
        </button>
      ) : (
        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Brain size={20} color="#D4AF37" />
              <strong className="cinzel-font" style={{ color: '#D4AF37', fontSize: '0.95rem' }}>
                AI STRATEGY COACH
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                className="btn-icon"
                style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={handleAnnounceHint}
                title="Speak AI Coach Hint"
              >
                <Volume2 size={14} color="#D4AF37" />
              </button>
              <button
                className="btn-icon"
                style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}
                onClick={() => {
                  soundManager.playButtonClick();
                  setIsExpanded(false);
                }}
                title="Minimize Coach"
              >
                ×
              </button>
            </div>
          </div>

          {/* Top 3 Suggestions List with Title & Reason for Every Move */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
            {recommendations.slice(0, 3).map((rec, idx) => {
              const isTop = idx === 0;
              const badgeBg = isTop ? 'rgba(212,175,55,0.15)' : idx === 1 ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)';
              const badgeBorder = isTop ? '#D4AF37' : idx === 1 ? '#10B981' : '#3B82F6';
              const badgeText = isTop ? '#D4AF37' : idx === 1 ? '#10B981' : '#60A5FA';

              return (
                <div
                  key={idx}
                  style={{
                    background: badgeBg,
                    border: `1px solid ${badgeBorder}`,
                    borderRadius: '10px',
                    padding: '10px',
                    boxShadow: isTop ? '0 2px 8px rgba(212,175,55,0.2)' : 'none'
                  }}
                >
                  {/* Badge & Title Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 900, color: badgeText, letterSpacing: '0.5px' }}>
                      #{idx + 1} {rec.badge}
                    </span>
                    {rec.winExpectancy > 0 && (
                      <span style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700 }}>
                        Win Prob: {Math.round(rec.winExpectancy)}%
                      </span>
                    )}
                  </div>

                  {/* Move Title */}
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#F8FAFC', marginBottom: '4px' }}>
                    {rec.title}
                  </div>

                  {/* Strategic Rationale / Reason */}
                  <p className="selectable-text" style={{ fontSize: '0.78rem', color: '#CBD5E1', margin: 0, lineHeight: 1.35 }}>
                    {rec.rationale}
                  </p>

                  {/* Play Action Button */}
                  <button
                    className="btn-primary"
                    style={{
                      width: '100%',
                      marginTop: '8px',
                      fontSize: '0.75rem',
                      padding: '5px 8px',
                      minHeight: '28px',
                      background: isTop ? 'linear-gradient(135deg, #F59E0B, #D4AF37)' : 'rgba(255,255,255,0.1)',
                      color: isTop ? '#000' : '#FFF',
                      border: isTop ? 'none' : `1px solid ${badgeBorder}`
                    }}
                    onClick={() => {
                      Haptics.gemPick();
                      soundManager.playAICoachSelect();
                      onExecuteRecommendation(rec.action);
                    }}
                  >
                    Play Option #{idx + 1} <ChevronRight size={14} style={{ marginLeft: '4px' }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
};
