import React from 'react';
import { Noble, GemColor } from '../../engine/types.js';

interface NobleTileProps {
  noble: Noble;
  colorblindMode: boolean;
}

const GEM_COLOR_MAP: Record<GemColor, { bg: string; text: string; icon: string }> = {
  emerald: { bg: '#047857', text: '#FFF', icon: 'E' },
  diamond: { bg: '#F8FAFC', text: '#000', icon: 'D' },
  sapphire: { bg: '#1D4ED8', text: '#FFF', icon: 'S' },
  ruby: { bg: '#DC2626', text: '#FFF', icon: 'R' },
  onyx: { bg: '#334155', text: '#FFF', icon: 'O' }
};

export const NobleTile: React.FC<NobleTileProps> = React.memo(({ noble, colorblindMode }) => {
  return (
    <div
      className="noble-tile glass-panel"
      style={{
        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1.5px solid #D4AF37',
        borderRadius: '10px',
        padding: '6px 8px',
        boxShadow: '0 4px 14px rgba(212, 175, 55, 0.25), inset 0 0 10px rgba(212, 175, 55, 0.1)'
      }}
      title={`${noble.name}: Grants +3 Prestige Points. Requires ${Object.entries(noble.reqs)
        .map(([c, v]) => `${v} ${c}`)
        .join(', ')}`}
    >
      {/* Top Header: Prestige Points Crest & Noble Title */}
      <div className="noble-tile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span
          className="noble-points-badge"
          style={{
            fontSize: '0.85rem',
            fontWeight: 900,
            color: '#F59E0B',
            background: 'rgba(245, 158, 11, 0.2)',
            padding: '1px 6px',
            borderRadius: '6px',
            border: '1px solid #D4AF37'
          }}
        >
          +{noble.prestigePoints}
        </span>
        <span className="noble-name" style={{ fontSize: '0.75rem', fontWeight: 800, color: '#F8FAFC' }}>
          {noble.name}
        </span>
      </div>

      {/* Bottom Requirements Bar */}
      <div className="noble-reqs-grid" style={{ display: 'flex', gap: '4px', justifyContent: 'flex-start' }}>
        {Object.entries(noble.reqs).map(([col, count]) => {
          if (!count) return null;
          const meta = GEM_COLOR_MAP[col as GemColor];
          return (
            <div
              key={col}
              className="noble-req-item"
              style={{
                backgroundColor: meta.bg,
                color: meta.text,
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 900,
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
              title={`${count} ${col} card bonuses required`}
            >
              <span className="req-count">{count}</span>
              {colorblindMode && <span className="req-icon" style={{ fontSize: '0.65rem' }}>{meta.icon}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
});
