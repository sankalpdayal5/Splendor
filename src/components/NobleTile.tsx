import React from 'react';
import { Noble, GemColor } from '../engine/types';

interface NobleTileProps {
  noble: Noble;
  colorblindMode: boolean;
}

const GEM_COLOR_MAP: Record<GemColor, { bg: string; text: string }> = {
  emerald: { bg: '#10B981', text: '#000' },
  diamond: { bg: '#F8FAFC', text: '#000' },
  sapphire: { bg: '#3B82F6', text: '#FFF' },
  ruby: { bg: '#EF4444', text: '#FFF' },
  onyx: { bg: '#334155', text: '#FFF' }
};

export const NobleTile: React.FC<NobleTileProps> = ({ noble, colorblindMode }) => {
  return (
    <div
      className="noble-card"
      tabIndex={0}
      role="listitem"
      aria-label={`Noble ${noble.name}. Worth 3 Prestige points. Requirement: ${Object.entries(noble.reqs).map(([c, v]) => `${v} ${c} cards`).join(', ')}.`}
    >
      <div className="noble-points">+3</div>
      <div className="noble-name">{noble.name}</div>
      <div className="noble-reqs">
        {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
          const reqVal = noble.reqs[col];
          if (!reqVal) return null;
          const meta = GEM_COLOR_MAP[col];

          return (
            <div
              key={col}
              className="req-badge"
              style={{ backgroundColor: meta.bg, color: meta.text }}
              title={`Requires ${reqVal} ${col} cards`}
            >
              {reqVal}
            </div>
          );
        })}
      </div>
    </div>
  );
};
