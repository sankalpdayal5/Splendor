import React from 'react';
import { BookOpen } from 'lucide-react';
import { soundManager } from '../../utils/SoundManager.js';

interface RulebookModalProps {
  onClose: () => void;
}

export const RulebookModal: React.FC<RulebookModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={() => {
      soundManager.playButtonClick();
      onClose();
    }}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '85vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(212,175,55,0.2)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={22} color="#D4AF37" />
            <h2 className="cinzel-font" style={{ color: '#D4AF37', fontSize: '1.4rem' }}>
              Splendor Official Rulebook
            </h2>
          </div>
          <button className="btn-secondary" onClick={() => {
            soundManager.playButtonClick();
            onClose();
          }}>Close</button>
        </div>

        <div style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <section>
            <h3 className="cinzel-font" style={{ color: '#F8FAFC', marginBottom: '6px' }}>Game Overview & Goal</h3>
            <p>
              You are a wealthy Renaissance merchant. Collect raw gem tokens, acquire development cards to build your supply chain, and gain prestige points to earn visits from noble patrons. The first player to reach <strong>15 Prestige Points</strong> triggers the final round!
            </p>
          </section>

          <section>
            <h3 className="cinzel-font" style={{ color: '#F8FAFC', marginBottom: '6px' }}>Gem Colors & Resource Reference Guide</h3>
            <p style={{ marginBottom: '8px' }}>
              Splendor features <strong>5 Standard Gem Types</strong> and <strong>1 Special Wildcard Resource</strong>:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '8px', margin: '8px 0' }}>
              <div style={{ background: 'rgba(4, 120, 87, 0.25)', border: '1px solid #047857', padding: '8px 10px', borderRadius: '8px' }}>
                <strong style={{ color: '#34D399', fontSize: '0.9rem' }}>Emerald (Green)</strong>
                <div style={{ fontSize: '0.78rem', color: '#E2E8F0', marginTop: '2px' }}>Grants permanent Green card discounts & Emerald tokens.</div>
              </div>

              <div style={{ background: 'rgba(248, 250, 252, 0.15)', border: '1px solid #CBD5E1', padding: '8px 10px', borderRadius: '8px' }}>
                <strong style={{ color: '#F8FAFC', fontSize: '0.9rem' }}>Diamond (White)</strong>
                <div style={{ fontSize: '0.78rem', color: '#E2E8F0', marginTop: '2px' }}>Grants permanent White card discounts & Diamond tokens.</div>
              </div>

              <div style={{ background: 'rgba(29, 78, 216, 0.25)', border: '1px solid #1D4ED8', padding: '8px 10px', borderRadius: '8px' }}>
                <strong style={{ color: '#60A5FA', fontSize: '0.9rem' }}>Sapphire (Blue)</strong>
                <div style={{ fontSize: '0.78rem', color: '#E2E8F0', marginTop: '2px' }}>Grants permanent Blue card discounts & Sapphire tokens.</div>
              </div>

              <div style={{ background: 'rgba(220, 38, 38, 0.25)', border: '1px solid #DC2626', padding: '8px 10px', borderRadius: '8px' }}>
                <strong style={{ color: '#F87171', fontSize: '0.9rem' }}>Ruby (Red)</strong>
                <div style={{ fontSize: '0.78rem', color: '#E2E8F0', marginTop: '2px' }}>Grants permanent Red card discounts & Ruby tokens.</div>
              </div>

              <div style={{ background: 'rgba(51, 65, 85, 0.4)', border: '1px solid #475569', padding: '8px 10px', borderRadius: '8px' }}>
                <strong style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Onyx (Black)</strong>
                <div style={{ fontSize: '0.78rem', color: '#E2E8F0', marginTop: '2px' }}>Grants permanent Black card discounts & Onyx tokens.</div>
              </div>

              <div style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #D4AF37', padding: '8px 10px', borderRadius: '8px' }}>
                <strong style={{ color: '#F59E0B', fontSize: '0.9rem' }}>Gold (Wildcard)</strong>
                <div style={{ fontSize: '0.78rem', color: '#E2E8F0', marginTop: '2px' }}>Obtained via Reservation. Acts as any gem color to buy cards.</div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="cinzel-font" style={{ color: '#F8FAFC', marginBottom: '6px' }}>Actions On Your Turn</h3>
            <p>On your turn, you MUST take exactly <strong>ONE</strong> of the following 4 actions:</p>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
              <li><strong>1. Take 3 Distinct Gem Tokens:</strong> Select 3 different colored gems from the bank (Emerald, Diamond, Sapphire, Ruby, Onyx).</li>
              <li><strong>2. Take 2 Same Gem Tokens:</strong> Select 2 gems of the same color (only allowed if that stack has at least 4 tokens remaining).</li>
              <li><strong>3. Reserve 1 Development Card:</strong> Take 1 face-up card from the market grid or top of a tier deck into your hand and receive <strong>+1 Gold Wildcard Token</strong>.</li>
              <li><strong>4. Purchase 1 Development Card:</strong> Pay the gem cost to buy a face-up card or a reserved card from your hand.</li>
            </ul>
          </section>

          <section>
            <h3 className="cinzel-font" style={{ color: '#F8FAFC', marginBottom: '6px' }}>Token Holding Limit (Max 10)</h3>
            <p>
              At the end of your turn, if you hold more than 10 total tokens (including Gold), you must return excess tokens down to <strong>exactly 10</strong>.
            </p>
          </section>

          <section>
            <h3 className="cinzel-font" style={{ color: '#F8FAFC', marginBottom: '6px' }}>Noble Visits & Victory</h3>
            <p>
              At the end of your turn, if your permanent card bonuses satisfy a noble's requirement, that noble visits your merchant house (+3 Prestige Points). The first player to 15 points wins!
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
