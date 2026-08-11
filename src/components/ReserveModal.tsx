import React from 'react';
import { DevelopmentCard, GemColor } from '../engine/types';
import { CardComponent } from './CardComponent';
import { Bookmark, AlertCircle } from 'lucide-react';

interface ReserveModalProps {
  pendingReserve: {
    type: 'grid' | 'deck';
    tier: 1 | 2 | 3;
    slotIdx?: number;
    card?: DevelopmentCard | null;
  } | null;
  goldAvailable: boolean;
  colorblindMode: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  pendingReserve,
  goldAvailable,
  colorblindMode,
  onConfirm,
  onCancel
}) => {
  if (!pendingReserve) return null;

  const isDeck = pendingReserve.type === 'deck';
  const card = pendingReserve.card;

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#F59E0B', marginBottom: '8px' }}>
          <Bookmark size={24} />
          <h2 className="cinzel-font" style={{ fontSize: '1.4rem' }}>Confirm Reserve Action</h2>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#CBD5E1', marginBottom: '16px' }}>
          Are you sure you want to reserve this Tier {pendingReserve.tier} card?
        </p>

        {/* Card Preview */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          {isDeck ? (
            <div className={`tier-deck tier-${pendingReserve.tier}`} style={{ cursor: 'default' }}>
              <span>TIER {pendingReserve.tier}</span>
              <span style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.8 }}>Face Down</span>
            </div>
          ) : (
            <CardComponent
              card={card || null}
              canAfford={false}
              canReserve={false}
              colorblindMode={colorblindMode}
            />
          )}
        </div>

        {/* Gold Reward Notice */}
        <div style={{
          background: goldAvailable ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)',
          border: goldAvailable ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)',
          padding: '10px 14px',
          borderRadius: '10px',
          fontSize: '0.85rem',
          color: '#F8FAFC',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={18} color="#F59E0B" />
          <span>
            {goldAvailable
              ? 'You will receive +1 Gold wildcard token from the bank.'
              : 'Bank has 0 Gold tokens remaining (0 Gold awarded).'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={onConfirm}>
            Confirm Reserve
          </button>
        </div>
      </div>
    </div>
  );
};
