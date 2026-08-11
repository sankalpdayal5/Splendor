import React, { useState } from 'react';
import { Volume2, VolumeX, BookOpen, Eye, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/SoundManager';
import { speechAnnouncer } from '../utils/SpeechAnnouncer';

interface NavbarProps {
  onOpenRules: () => void;
  colorblindMode: boolean;
  onToggleColorblind: () => void;
  roomCode?: string;
  isOfflineBotMode?: boolean;
  learnMode?: boolean;
  onToggleLearnMode?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRules,
  colorblindMode,
  onToggleColorblind,
  roomCode,
  isOfflineBotMode,
  learnMode,
  onToggleLearnMode
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    speechAnnouncer.announcePolite(muted ? 'Sound muted.' : 'Sound unmuted.');
  };

  return (
    <header className="navbar">
      <div className="brand-title cinzel-font">
        <span style={{ fontSize: '1.8rem', color: '#F59E0B' }}>💎</span>
        Splendor
        {roomCode && (
          <span style={{ fontSize: '0.85rem', color: '#94A3B8', marginLeft: '12px', background: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
            ROOM: <strong style={{ color: '#F59E0B' }}>{roomCode}</strong>
          </span>
        )}
      </div>

      <div className="nav-actions">
        {/* Learn Mode Toggle (Only visible in vs Bot Offline Mode) */}
        {isOfflineBotMode && onToggleLearnMode && (
          <button
            className={`btn-secondary ${learnMode ? 'active' : ''}`}
            style={{
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: learnMode ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.08)',
              border: learnMode ? '1px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)',
              color: learnMode ? '#F59E0B' : '#F8FAFC'
            }}
            onClick={() => {
              onToggleLearnMode();
              speechAnnouncer.announcePolite(learnMode ? 'Learn mode disabled.' : 'Learn mode AI Coach enabled.');
            }}
            title="Toggle AI Strategy Coach (Learn Mode)"
          >
            <Sparkles size={16} color={learnMode ? '#F59E0B' : '#94A3B8'} />
            Learn Mode {learnMode ? 'ON' : 'OFF'}
          </button>
        )}

        <button
          className={`btn-icon ${colorblindMode ? 'active' : ''}`}
          onClick={onToggleColorblind}
          title="Toggle Colorblind Pattern Overlays"
          aria-label="Toggle Colorblind Accessibility Pattern Overlays"
        >
          <Eye size={20} color={colorblindMode ? '#F59E0B' : '#F8FAFC'} />
        </button>

        <button
          className="btn-icon"
          onClick={handleToggleSound}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX size={20} color="#EF4444" /> : <Volume2 size={20} color="#10B981" />}
        </button>

        <button
          className="btn-icon"
          onClick={onOpenRules}
          title="Open Rulebook"
          aria-label="Open Rulebook"
        >
          <BookOpen size={20} color="#3B82F6" />
        </button>
      </div>
    </header>
  );
};
