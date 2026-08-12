import React from 'react';
import { Route, Sparkles, Trophy } from 'lucide-react';

interface ProjectedStep {
  turnOffset: number;
  actionDescription: string;
  projectedPP: number;
}

interface StrategyPathExplorerProps {
  projectedPath: ProjectedStep[];
  winExpectancy: number;
  badgeColor: string;
}

export const StrategyPathExplorer: React.FC<StrategyPathExplorerProps> = ({
  projectedPath,
  winExpectancy,
  badgeColor
}) => {
  if (!projectedPath || projectedPath.length === 0) return null;

  return (
    <div
      style={{
        marginTop: '10px',
        padding: '10px 14px',
        background: 'rgba(0, 0, 0, 0.45)',
        borderLeft: `3px solid ${badgeColor}`,
        borderRadius: '8px',
        fontSize: '0.8rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: badgeColor, fontWeight: 700 }}>
          <Route size={15} />
          <span>Projected 3-Turn Strategy Roadmap</span>
        </div>
        <span
          style={{
            background: 'rgba(245, 158, 11, 0.18)',
            border: '1px solid #F59E0B',
            color: '#F59E0B',
            padding: '2px 8px',
            borderRadius: '10px',
            fontSize: '0.75rem',
            fontWeight: 800
          }}
        >
          {winExpectancy}% Win EV
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {projectedPath.map((step) => (
          <div
            key={step.turnOffset}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '6px 10px',
              borderRadius: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 700, minWidth: '42px' }}>
                Turn +{step.turnOffset}:
              </span>
              <span style={{ color: '#F8FAFC' }}>{step.actionDescription}</span>
            </div>
            {step.projectedPP > 0 && (
              <span style={{ color: '#F59E0B', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Trophy size={12} /> {step.projectedPP} pts
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
