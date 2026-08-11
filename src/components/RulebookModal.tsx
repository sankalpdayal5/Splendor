import React from 'react';
import { X } from 'lucide-react';

interface RulebookModalProps {
  onClose: () => void;
}

export const RulebookModal: React.FC<RulebookModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 className="cinzel-font" style={{ color: '#F59E0B' }}>Official Splendor Rulebook</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close rulebook"><X size={20} /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.6 }}>
          <section>
            <h3 style={{ color: '#3B82F6', marginBottom: '4px' }}>🎯 Goal of the Game</h3>
            <p>
              Be the first player to reach <strong>15 Prestige Points</strong> by acquiring development cards and earning visits from wealthy renaissance Nobles.
            </p>
          </section>

          <section>
            <h3 style={{ color: '#10B981', marginBottom: '4px' }}>⚡ Turn Actions (Choose Exactly 1)</h3>
            <ul style={{ paddingLeft: '20px' }}>
              <li><strong>Take 3 Gem Tokens</strong> of 3 DIFFERENT colors from the bank supply.</li>
              <li><strong>Take 2 Gem Tokens</strong> of the SAME color (only allowed if there are at least 4 tokens remaining of that color in the bank).</li>
              <li><strong>Reserve 1 Card</strong> from the board or top deck + take 1 Gold wildcard token. Maximum 3 reserved cards held at any time.</li>
              <li><strong>Buy 1 Development Card</strong> from the face-up grid or your reserved hand by paying its gem cost minus your permanent card discounts.</li>
            </ul>
          </section>

          <section>
            <h3 style={{ color: '#F59E0B', marginBottom: '4px' }}>💎 Development Cards & Discounts</h3>
            <p>
              Each purchased card provides a permanent gem bonus of a specific color. Future card purchases receive a 1 gem discount for each matching card bonus you own. Gold tokens act as wildcards.
            </p>
          </section>

          <section>
            <h3 style={{ color: '#EF4444', marginBottom: '4px' }}>👑 Noble Visits</h3>
            <p>
              At the end of your turn, if your development card bonuses satisfy the requirements of a face-up Noble tile, that Noble automatically visits you, granting <strong>+3 Prestige Points</strong>. Max 1 noble per turn.
            </p>
          </section>

          <section>
            <h3 style={{ color: '#A855F7', marginBottom: '4px' }}>🏆 End of Game & Tie-Breaker</h3>
            <p>
              Reaching 15+ points triggers the final round so all players get equal turns. The player with the highest prestige points wins! Tie-breaker: Player who purchased the <strong>fewest development cards</strong> wins.
            </p>
          </section>
        </div>

        <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={onClose}>
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
