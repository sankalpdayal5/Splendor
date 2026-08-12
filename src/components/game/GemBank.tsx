import React from 'react';
import { ResourceMap, GemColor } from '../../engine/types.js';
import { soundManager } from '../../utils/SoundManager.js';
import { GEM_META } from '../../utils/gemMeta.js';

interface GemBankProps {
  bank: ResourceMap;
  selectedTokens: GemColor[];
  colorblindMode: boolean;
  onSelectToken: (color: GemColor) => void;
}

export const GemBank: React.FC<GemBankProps> = React.memo(({
  bank,
  selectedTokens,
  colorblindMode,
  onSelectToken
}) => {
  return (
    <div className="glass-panel gem-bank-panel" style={{ padding: '8px 10px', borderRadius: '14px', maxWidth: '100%', overflow: 'visible' }}>
      <h4 className="cinzel-font" style={{ fontSize: '0.78rem', color: '#D4AF37', marginBottom: '6px', textAlign: 'center', letterSpacing: '0.5px' }}>
        GEM BANK
      </h4>

      <div
        className="gem-bank-tokens-container"
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '6px',
          overflowX: 'auto',
          maxWidth: '100%',
          padding: '6px 6px 8px 6px',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
          const count = bank[col] || 0;
          const isSelected = selectedTokens.includes(col);
          const meta = GEM_META[col];

          return (
            <div key={col} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
              <button
                className={`gem-token-icon ${isSelected ? 'selected' : ''}`}
                style={{
                  width: 'clamp(36px, 8vw, 42px)',
                  height: 'clamp(36px, 8vw, 42px)',
                  minHeight: 'unset',
                  minWidth: 'unset',
                  aspectRatio: '1 / 1',
                  padding: 0,
                  margin: 0,
                  borderRadius: '50%',
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  background: meta.gradient,
                  color: meta.text,
                  border: isSelected ? '3px solid #FDE047' : `1.5px solid ${meta.border}A0`,
                  fontSize: '0.9rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: count > 0 ? 'pointer' : 'not-allowed',
                  opacity: count > 0 ? 1 : 0.35,
                  boxShadow: isSelected
                    ? `0 0 12px #F59E0B, inset 0 0 0 2px #F59E0B, inset 0 2px 4px rgba(255,255,255,0.8)`
                    : '0 3px 8px rgba(0,0,0,0.5)',
                  transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.15s ease'
                }}
                disabled={count === 0}
                onClick={() => {
                  soundManager.playGemClick();
                  onSelectToken(col);
                }}
                title={`Select ${meta.name} Token (${count} left)`}
              >
                {count}
              </button>
              {colorblindMode && <span style={{ fontSize: '0.62rem', fontWeight: 800, color: meta.border }}>{meta.icon}</span>}
            </div>
          );
        })}

        {/* Gold Wildcard Stack - Uniform Single Row Alignment */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <div
            className="gem-token-icon"
            style={{
              width: 'clamp(36px, 8vw, 42px)',
              height: 'clamp(36px, 8vw, 42px)',
              minHeight: 'unset',
              minWidth: 'unset',
              aspectRatio: '1 / 1',
              padding: 0,
              margin: 0,
              borderRadius: '50%',
              flexShrink: 0,
              boxSizing: 'border-box',
              background: 'radial-gradient(circle at 35% 35%, #FDE047 0%, #F59E0B 60%, #78350F 100%)',
              color: '#000',
              border: '1.5px solid #FFF',
              fontSize: '0.9rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(245,158,11,0.5)'
            }}
            title={`Gold Wildcard Tokens (${bank.gold || 0} left in bank)`}
          >
            {bank.gold || 0}
          </div>
          {colorblindMode && <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#F59E0B' }}>G</span>}
        </div>
      </div>
    </div>
  );
});
