import React from 'react';
import { ResourceColor, ResourceMap, GemColor } from '../engine/types.js';
import { soundManager } from '../utils/SoundManager.js';

interface GemBankProps {
  bank: ResourceMap;
  selectedGems: GemColor[];
  colorblindMode: boolean;
  recommendedGemColors?: GemColor[];
  onToggleGemSelection: (color: GemColor) => void;
}

const GEM_META: Record<ResourceColor, { name: string; bg: string; text: string; icon: string }> = {
  emerald: { name: 'Emerald', bg: '#10B981', text: '#000', icon: '🌿' },
  diamond: { name: 'Diamond', bg: '#F8FAFC', text: '#000', icon: '☀️' },
  sapphire: { name: 'Sapphire', bg: '#3B82F6', text: '#FFF', icon: '💧' },
  ruby: { name: 'Ruby', bg: '#EF4444', text: '#FFF', icon: '🔥' },
  onyx: { name: 'Onyx', bg: '#334155', text: '#FFF', icon: '🛡️' },
  gold: { name: 'Gold Wildcard', bg: '#F59E0B', text: '#000', icon: '⭐' }
};

export const GemBank: React.FC<GemBankProps> = ({
  bank,
  selectedGems,
  colorblindMode,
  recommendedGemColors,
  onToggleGemSelection
}) => {
  const handleGemClick = (color: GemColor) => {
    soundManager.playGemClick();
    onToggleGemSelection(color);
  };

  return (
    <div className="glass-panel gem-bank-panel" role="region" aria-label="Gem Token Supply Bank">
      <div className="bank-header">Gem Token Bank</div>
      <div className="gem-stack-list">
        {(['emerald', 'diamond', 'sapphire', 'ruby', 'onyx'] as GemColor[]).map((col) => {
          const count = bank[col] || 0;
          const meta = GEM_META[col];
          const isSelected = selectedGems.includes(col);
          const selectedCount = selectedGems.filter(c => c === col).length;
          const isRecommended = recommendedGemColors?.includes(col);

          return (
            <div
              key={col}
              className={`gem-stack-item ${isSelected ? 'selected' : ''}`}
              onClick={() => count > 0 && handleGemClick(col)}
              tabIndex={0}
              role="button"
              aria-label={`${meta.name} supply: ${count} remaining. ${selectedCount > 0 ? `Selected ${selectedCount}` : ''}`}
              style={{
                opacity: count === 0 ? 0.4 : 1,
                border: isRecommended ? '1px solid #F59E0B' : undefined,
                boxShadow: isRecommended ? '0 0 12px rgba(245, 158, 11, 0.4)' : undefined
              }}
            >
              <div className="gem-info">
                <div className="gem-token-icon" style={{ backgroundColor: meta.bg, color: meta.text }}>
                  {meta.icon}
                </div>
                <div>
                  <div className="gem-name">
                    {meta.name}
                    {isRecommended && <span style={{ fontSize: '0.65rem', color: '#F59E0B', marginLeft: '6px', fontWeight: 800 }}>💡 REC</span>}
                  </div>
                  {selectedCount > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 'bold' }}>
                      Staged: +{selectedCount}
                    </span>
                  )}
                </div>
              </div>
              <div className="gem-count">{count}</div>
            </div>
          );
        })}

        {/* Gold Wildcard Display */}
        <div className="gem-stack-item" style={{ cursor: 'default', opacity: bank.gold === 0 ? 0.4 : 1 }}>
          <div className="gem-info">
            <div className="gem-token-icon" style={{ backgroundColor: GEM_META.gold.bg, color: GEM_META.gold.text }}>
              {GEM_META.gold.icon}
            </div>
            <div className="gem-name">Gold (Wildcard)</div>
          </div>
          <div className="gem-count">{bank.gold || 0}</div>
        </div>
      </div>
    </div>
  );
};
