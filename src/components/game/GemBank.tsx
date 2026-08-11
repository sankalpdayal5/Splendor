import React from 'react';
import { ResourceMap, GemColor } from '../../engine/types.js';
import { soundManager } from '../../utils/SoundManager.js';

interface GemBankProps {
  bank: ResourceMap;
  selectedTokens: GemColor[];
  colorblindMode: boolean;
  onSelectToken: (color: GemColor) => void;
}

const GEM_META: Record<GemColor, { bg: string; text: string; gradient: string; border: string; icon: string; name: string }> = {
  emerald: { bg: '#047857', text: '#FFF', gradient: 'radial-gradient(circle at 35% 35%, #10B981 0%, #047857 60%, #064E3B 100%)', border: '#34D399', icon: 'E', name: 'Emerald' },
  diamond: { bg: '#E2E8F0', text: '#0F172A', gradient: 'radial-gradient(circle at 35% 35%, #FFFFFF 0%, #E2E8F0 60%, #94A3B8 100%)', border: '#F8FAFC', icon: 'D', name: 'Diamond' },
  sapphire: { bg: '#1D4ED8', text: '#FFF', gradient: 'radial-gradient(circle at 35% 35%, #3B82F6 0%, #1D4ED8 60%, #1E3A8A 100%)', border: '#60A5FA', icon: 'S', name: 'Sapphire' },
  ruby: { bg: '#DC2626', text: '#FFF', gradient: 'radial-gradient(circle at 35% 35%, #EF4444 0%, #DC2626 60%, #7F1D1D 100%)', border: '#F87171', icon: 'R', name: 'Ruby' },
  onyx: { bg: '#334155', text: '#FFF', gradient: 'radial-gradient(circle at 35% 35%, #64748B 0%, #334155 60%, #0F172A 100%)', border: '#94A3B8', icon: 'O', name: 'Onyx' }
};

export const GemBank: React.FC<GemBankProps> = React.memo(({
  bank,
  selectedTokens,
  colorblindMode,
  onSelectToken
}) => {
  return (
    <div className="glass-panel gem-bank-panel" style={{ padding: '12px 14px', borderRadius: '14px', maxWidth: '100%', overflowX: 'hidden' }}>
      <h4 className="cinzel-font" style={{ fontSize: '0.85rem', color: '#D4AF37', marginBottom: '10px', textAlign: 'center' }}>
        GEM BANK SUPPLY
      </h4>

      <div
        className="gem-bank-tokens-container"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          overflowX: 'auto',
          maxWidth: '100%',
          paddingBottom: '6px',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
          const count = bank[col] || 0;
          const isSelected = selectedTokens.includes(col);
          const meta = GEM_META[col];

          return (
            <div key={col} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              <button
                className={`gem-token-icon ${isSelected ? 'selected' : ''}`}
                style={{
                  width: 'clamp(38px, 8.5vw, 44px)',
                  height: 'clamp(38px, 8.5vw, 44px)',
                  borderRadius: '50%',
                  background: meta.gradient,
                  color: meta.text,
                  border: isSelected ? '3px solid #F59E0B' : `1.5px solid ${meta.border}80`,
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: count > 0 ? 'pointer' : 'not-allowed',
                  opacity: count > 0 ? 1 : 0.35,
                  boxShadow: isSelected ? `0 0 16px #F59E0B, inset 0 2px 4px rgba(255,255,255,0.6)` : '0 4px 10px rgba(0,0,0,0.5)',
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
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
              {colorblindMode && <span style={{ fontSize: '0.65rem' }}>{meta.icon}</span>}
            </div>
          );
        })}

        {/* Gold Wildcard Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <div
            className="gem-token-icon"
            style={{
              width: 'clamp(38px, 8.5vw, 44px)',
              height: 'clamp(38px, 8.5vw, 44px)',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #FDE047 0%, #F59E0B 60%, #78350F 100%)',
              color: '#000',
              border: '1.5px solid #FFF',
              fontSize: '0.95rem',
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(245,158,11,0.5)'
            }}
            title={`Gold Wildcard Tokens (${bank.gold || 0} left in bank)`}
          >
            {bank.gold || 0}
          </div>
          <span style={{ fontSize: '0.65rem', color: '#D4AF37', fontWeight: 800 }}>GOLD</span>
        </div>
      </div>
    </div>
  );
});
