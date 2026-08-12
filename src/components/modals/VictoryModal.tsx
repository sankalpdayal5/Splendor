import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../../engine/types.js';
import { Trophy, RefreshCw, LogOut, Share2 } from 'lucide-react';
import { Haptics } from '../../utils/haptics.js';
import { soundManager } from '../../utils/SoundManager.js';
import { generateVictoryCardDataUrl } from '../../utils/VictoryShareCard.js';
import { recordMatchResult, getOrCreateUserProfile } from '../../utils/userProfile.js';
import { shareToWhatsAppDirect } from '../../utils/socialShare.js';

interface VictoryModalProps {
  gameState: GameState;
  onRematch: () => void;
  onExitGame: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ gameState, onRematch, onExitGame }) => {
  const [shareStatus, setShareStatus] = useState('');

  const winner = gameState.players.find((p) => gameState.winnerIds?.includes(p.id)) || gameState.players[0];
  const userProfile = getOrCreateUserProfile();
  const isHumanWinner = winner.name === userProfile.name || !winner.isBot;

  useEffect(() => {
    Haptics.victoryFanfare();
    soundManager.playVictoryFanfare();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

    // Record career stats & achievements
    const humanPlayer = gameState.players.find((p) => !p.isBot) || gameState.players[0];
    const won = gameState.winnerIds?.includes(humanPlayer.id) || false;

    // Count gem bonuses
    const gemCounts = { emerald: 0, diamond: 0, sapphire: 0, ruby: 0, onyx: 0 };
    humanPlayer.cards.forEach((c) => {
      if (c.gemBonus && gemCounts[c.gemBonus] !== undefined) {
        gemCounts[c.gemBonus] += 1;
      }
    });

    recordMatchResult(
      won,
      humanPlayer.prestigePoints,
      gameState.turnNumber || 15,
      gemCounts,
      humanPlayer.nobles.length,
      humanPlayer.reservedCards.length
    );
  }, [gameState]);

  const handleShareVictoryCard = () => {
    soundManager.playButtonClick();
    const gemCounts = { emerald: 0, diamond: 0, sapphire: 0, ruby: 0, onyx: 0 };
    winner.cards.forEach((c) => {
      if (c.gemBonus && gemCounts[c.gemBonus] !== undefined) {
        gemCounts[c.gemBonus] += 1;
      }
    });

    const dataUrl = generateVictoryCardDataUrl({
      winnerName: winner.name,
      prestigePoints: winner.prestigePoints,
      totalTurns: gameState.turnNumber || 15,
      gemsOwned: gemCounts,
      cardsCount: winner.cards.length,
      noblesCount: winner.nobles.length
    });

    const text = `🏆 I won a Splendor Match with ${winner.prestigePoints} Prestige Points in ${gameState.turnNumber || 15} turns! Play Splendor: ${window.location.origin}`;
    shareToWhatsAppDirect(text);

    setShareStatus('✅ Shared Victory to WhatsApp!');
    setTimeout(() => setShareStatus(''), 4000);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="glass-panel modal-content" style={{ maxWidth: '480px', textAlign: 'center' }}>
        <Trophy size={48} color="#D4AF37" style={{ margin: '0 auto 12px' }} />
        <h1 className="cinzel-font" style={{ color: '#D4AF37', fontSize: '2rem', marginBottom: '4px' }}>
          VICTORY!
        </h1>
        <h2 style={{ fontSize: '1.2rem', color: '#F8FAFC', marginBottom: '16px' }}>
          {winner.name} Wins The Match!
        </h2>

        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '10px' }}>FINAL SCOREBOARD</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {gameState.players.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '8px 12px', borderRadius: '8px' }}>
                <span style={{ fontWeight: 600 }}>{p.name}</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#D4AF37' }}>{p.prestigePoints} PP ({p.cards.length} cards)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Share Victory Card via WhatsApp Button */}
        <div style={{ marginBottom: '20px' }}>
          <button
            className="btn-secondary"
            onClick={handleShareVictoryCard}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #25D366, #128C7E)',
              color: '#FFF',
              fontWeight: 800,
              border: 'none',
              padding: '10px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
            }}
          >
            <Share2 size={18} /> Share Victory Card via WhatsApp
          </button>
          {shareStatus && (
            <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '6px', fontWeight: 700 }}>
              {shareStatus}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button className="btn-secondary" style={{ flex: 1, padding: '12px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={onExitGame}>
            <LogOut size={18} /> Main Menu
          </button>
          <button className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={onRematch}>
            <RefreshCw size={18} /> Rematch
          </button>
        </div>
      </div>
    </div>
  );
};
