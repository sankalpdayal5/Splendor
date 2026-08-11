import React, { useState } from 'react';
import { Volume2, VolumeX, BookOpen, Sparkles, LogOut } from 'lucide-react';
import { soundManager } from '../../utils/SoundManager.js';
import { speechAnnouncer } from '../../utils/SpeechAnnouncer.js';
import { Haptics } from '../../utils/haptics.js';

interface NavbarProps {
  onOpenRules: () => void;
  colorblindMode?: boolean;
  onToggleColorblind?: () => void;
  roomCode?: string;
  isOfflineBotMode?: boolean;
  learnMode?: boolean;
  onToggleLearnMode?: () => void;
  onExitGame?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRules,
  colorblindMode,
  onToggleColorblind,
  roomCode,
  isOfflineBotMode,
  learnMode,
  onToggleLearnMode,
  onExitGame
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Intercept Hardware & Browser Back Button to display Exit Confirmation Modal
  React.useEffect(() => {
    if (!onExitGame) return;

    // Push dummy history entry so back button navigation can be intercepted
    try {
      window.history.pushState({ inGame: true }, '', window.location.href);
    } catch {
      // Ignore if pushState fails
    }

    const handleHardwareBack = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      Haptics.warning();
      soundManager.playButtonClick();
      setShowExitConfirm(true);
    };

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      try {
        window.history.pushState({ inGame: true }, '', window.location.href);
      } catch {
        // Ignore
      }
      Haptics.warning();
      soundManager.playButtonClick();
      setShowExitConfirm(true);
    };

    document.addEventListener('backbutton', handleHardwareBack, false);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('backbutton', handleHardwareBack, false);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onExitGame]);

  const handleToggleSound = () => {
    Haptics.gemPick();
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    speechAnnouncer.announcePolite(muted ? 'Sound muted.' : 'Sound unmuted.');
  };

  return (
    <header className="navbar">
      <div className="brand-title cinzel-font" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span className="brand-text">Splendor</span>
        {roomCode && (
          <span className="room-code-tag" style={{ fontSize: '0.8rem', color: '#94A3B8', marginLeft: '6px', background: 'rgba(255,255,255,0.08)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <strong style={{ color: '#D4AF37' }}>{roomCode}</strong>
          </span>
        )}
      </div>

      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
        {/* Learn Mode Toggle */}
        {isOfflineBotMode && onToggleLearnMode && (
          <button
            className={`btn-secondary ${learnMode ? 'active' : ''}`}
            style={{
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              minHeight: '44px',
              background: learnMode ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255,255,255,0.08)',
              border: learnMode ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
              color: learnMode ? '#D4AF37' : '#F8FAFC'
            }}
            onClick={() => {
              Haptics.gemPick();
              onToggleLearnMode();
              speechAnnouncer.announcePolite(learnMode ? 'Learn mode disabled.' : 'Learn mode AI Coach enabled.');
            }}
            title="Toggle AI Strategy Coach (Learn Mode)"
          >
            <Sparkles size={16} color={learnMode ? '#D4AF37' : '#94A3B8'} />
            <span className="learn-mode-label">{learnMode ? 'Coach ON' : 'Coach OFF'}</span>
          </button>
        )}

        <button
          className="btn-icon"
          style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          onClick={handleToggleSound}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX size={18} color="#DC2626" /> : <Volume2 size={18} color="#047857" />}
        </button>

        <button
          className="btn-icon"
          style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          onClick={() => {
            Haptics.gemPick();
            soundManager.playButtonClick();
            onOpenRules();
          }}
          title="Open Rulebook"
          aria-label="Open Rulebook"
        >
          <BookOpen size={18} color="#1D4ED8" />
        </button>

        {onExitGame && (
          <button
            className="btn-icon"
            style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(220,38,38,0.18)', border: '1px solid rgba(220,38,38,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onClick={() => {
              Haptics.warning();
              soundManager.playButtonClick();
              setShowExitConfirm(true);
            }}
            title="Exit Game to Main Menu"
            aria-label="Exit Game to Main Menu"
          >
            <LogOut size={18} color="#EF4444" />
          </button>
        )}
      </div>

      {/* Exit Game Confirmation Modal */}
      {showExitConfirm && (
        <div className="modal-overlay" onClick={() => setShowExitConfirm(false)}>
          <div
            className="glass-panel modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '380px', textAlign: 'center', border: '1.5px solid #DC2626' }}
          >
            <h3 className="cinzel-font" style={{ color: '#EF4444', marginBottom: '8px', fontSize: '1.2rem' }}>
              Exit Game?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#CBD5E1', marginBottom: '20px' }}>
              Are you sure you want to exit to the Main Menu? Current match progress will be lost.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn-secondary"
                style={{ flex: 1, minHeight: '40px' }}
                onClick={() => {
                  soundManager.playButtonClick();
                  setShowExitConfirm(false);
                }}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                style={{ flex: 1, minHeight: '40px', background: '#DC2626', borderColor: '#EF4444' }}
                onClick={() => {
                  soundManager.playButtonClick();
                  setShowExitConfirm(false);
                  onExitGame?.();
                }}
              >
                Exit Game
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
