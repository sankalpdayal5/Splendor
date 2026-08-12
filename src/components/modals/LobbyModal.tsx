import React, { useState, useEffect } from 'react';
import { GameConfig } from '../../engine/types.js';
import { Bot, Users, Globe, Play, Plus, ArrowRight, Share2 } from 'lucide-react';
import { socketService } from '../../services/socketService.js';
import { soundManager } from '../../utils/SoundManager.js';
import { shareRoomInvite, shareToWhatsAppDirect } from '../../utils/socialShare.js';

interface LobbyModalProps {
  onStartGame: (config: GameConfig, initialRoomState?: any) => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({ onStartGame }) => {
  const [activeTab, setActiveTab] = useState<'bot' | 'pass_play' | 'online'>('bot');
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(3);
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [playerName, setPlayerName] = useState('Merchant 1');
  const [passPlayNames, setPassPlayNames] = useState<string[]>(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [joinCode, setJoinCode] = useState('');
  const [inRoom, setInRoom] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [connStatus, setConnStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>(
    socketService.getConnectionStatus()
  );
  const [shareFeedback, setShareFeedback] = useState('');

  // Handle URL deep link room join parameter (e.g. ?room=XYZ123)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room') || params.get('code');
      if (roomParam) {
        setActiveTab('online');
        setJoinCode(roomParam.trim().toUpperCase());
      }
    }
  }, []);

  useEffect(() => {
    const unsubStatus = socketService.onConnectionStatusChange((status) => {
      setConnStatus(status);
    });

    const unsubRoom = socketService.onRoomUpdated((room) => {
      setInRoom(room);
      if (room.isStarted && room.gameState) {
        onStartGame(room.config, room.gameState);
      }
    });

    const unsubGameState = socketService.onGameStateUpdate((gameState) => {
      if (inRoom) {
        onStartGame(inRoom.config, gameState);
      }
    });

    return () => {
      unsubStatus();
      unsubRoom();
      unsubGameState();
    };
  }, [inRoom, onStartGame]);

  const handlePassPlayNameChange = (index: number, val: string) => {
    const next = [...passPlayNames];
    next[index] = val;
    setPassPlayNames(next);
  };

  const handleStartOffline = () => {
    soundManager.playButtonClick();
    if (activeTab === 'pass_play') {
      const selectedNames = passPlayNames.slice(0, playerCount).map((n, i) => n.trim() || `Player ${i + 1}`);
      const config: GameConfig = {
        mode: 'offline_pass_play',
        playerCount,
        botCount: 0,
        botDifficulty: 'medium',
        players: selectedNames.map((name) => ({ name, isBot: false }))
      };
      onStartGame(config);
    } else {
      const botCount = playerCount - 1;
      const players: Array<{ name: string; isBot: boolean; botDifficulty?: 'easy' | 'medium' | 'hard' }> = [
        { name: playerName.trim() || 'Player 1', isBot: false }
      ];
      for (let i = 1; i <= botCount; i++) {
        players.push({ name: `Bot ${i}`, isBot: true, botDifficulty });
      }
      const config: GameConfig = {
        mode: 'offline_bot',
        playerCount,
        botCount,
        botDifficulty,
        players
      };
      onStartGame(config);
    }
  };

  const handleCreateRoom = async () => {
    soundManager.playButtonClick();
    setErrorMsg('');
    const config: GameConfig = {
      mode: 'online_room',
      playerCount,
      botCount: 0,
      botDifficulty: 'medium',
      players: [{ name: playerName.trim() || 'Host', isBot: false }]
    };

    const res = await socketService.createRoom(playerName.trim() || 'Host', config);
    if (!res.success) {
      setErrorMsg(res.message || 'Failed to create room.');
    }
  };

  const handleJoinRoom = async () => {
    soundManager.playButtonClick();
    setErrorMsg('');
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode || cleanCode.length !== 6) {
      setErrorMsg('Please enter a valid 6-character room code.');
      return;
    }

    const res = await socketService.joinRoom(cleanCode, playerName.trim() || 'Guest');
    if (!res.success) {
      setErrorMsg(res.message || 'Failed to join room.');
    }
  };

  const handleShareInvite = async () => {
    soundManager.playButtonClick();
    if (!inRoom?.roomCode) return;
    const res = await shareRoomInvite(inRoom.roomCode);
    if (res.method === 'clipboard') {
      setShareFeedback('✅ Link & Code Copied to Clipboard!');
    } else {
      setShareFeedback('✅ Shared Successfully!');
    }
    setTimeout(() => setShareFeedback(''), 4000);
  };

  const handleShareWhatsAppGeneral = () => {
    soundManager.playButtonClick();
    const text = `💎 Play Splendor Board Game with me! Online & Offline Digital Renaissance Board Game: ${window.location.origin}`;
    shareToWhatsAppDirect(text);
  };

  if (inRoom) {
    const isHost = inRoom.hostId === socketService.getSocketId() || inRoom.hostId === socketService.getSessionPlayerId();
    const canStart = isHost && inRoom.players.length >= 2;

    return (
      <div className="modal-overlay" style={{ zIndex: 1100 }}>
        <div className="glass-panel modal-card text-amber-100" style={{ maxWidth: '440px', width: '90%' }}>
          <h2 className="cinzel-font text-amber-400" style={{ fontSize: '1.5rem', marginBottom: '8px', textAlign: 'center' }}>
            Room: <span style={{ letterSpacing: '2px', color: '#FFF' }}>{inRoom.roomCode}</span>
          </h2>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '16px' }}>
            Waiting for players ({inRoom.players.length}/{inRoom.config.playerCount})...
          </p>

          {/* WhatsApp / Social Share Invite Button */}
          <div style={{ marginBottom: '16px' }}>
            <button
              className="btn-secondary"
              onClick={handleShareInvite}
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
              <Share2 size={18} /> Invite Friends via WhatsApp / Social
            </button>
            {shareFeedback && (
              <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#10B981', marginTop: '6px', fontWeight: 700 }}>
                {shareFeedback}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {inRoom.players.map((p: any) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{p.isBot ? '🤖' : '👤'}</span>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                </div>
                {p.id === inRoom.hostId && (
                  <span style={{ fontSize: '0.75rem', background: '#D4AF37', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                    HOST
                  </span>
                )}
              </div>
            ))}
          </div>

          {isHost && (
            <button
              className="btn-primary"
              style={{ width: '100%', opacity: canStart ? 1 : 0.5, cursor: canStart ? 'pointer' : 'not-allowed' }}
              disabled={!canStart}
              onClick={() => socketService.startGame(inRoom.roomCode)}
            >
              Start Game Now
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="glass-panel modal-card text-amber-100" style={{ maxWidth: '440px', width: '90%' }}>
        <h2 className="cinzel-font text-amber-400" style={{ fontSize: '1.6rem', marginBottom: '4px', textAlign: 'center' }}>
          Splendor
        </h2>
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '20px' }}>
          Digital Renaissance Board Game
        </p>

        {/* Mode Selector Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px' }}>
          <button
            className={`btn-secondary ${activeTab === 'bot' ? 'active' : ''}`}
            style={{ flex: 1, fontSize: '0.8rem', padding: '8px 4px', background: activeTab === 'bot' ? '#D4AF37' : 'transparent', color: activeTab === 'bot' ? '#000' : '#FFF' }}
            onClick={() => { soundManager.playButtonClick(); setActiveTab('bot'); }}
          >
            <Bot size={16} style={{ marginRight: '4px' }} /> Offline AI
          </button>
          <button
            className={`btn-secondary ${activeTab === 'pass_play' ? 'active' : ''}`}
            style={{ flex: 1, fontSize: '0.8rem', padding: '8px 4px', background: activeTab === 'pass_play' ? '#D4AF37' : 'transparent', color: activeTab === 'pass_play' ? '#000' : '#FFF' }}
            onClick={() => { soundManager.playButtonClick(); setActiveTab('pass_play'); }}
          >
            <Users size={16} style={{ marginRight: '4px' }} /> Pass & Play
          </button>
          <button
            className={`btn-secondary ${activeTab === 'online' ? 'active' : ''}`}
            style={{ flex: 1, fontSize: '0.8rem', padding: '8px 4px', background: activeTab === 'online' ? '#D4AF37' : 'transparent', color: activeTab === 'online' ? '#000' : '#FFF' }}
            onClick={() => { soundManager.playButtonClick(); setActiveTab('online'); }}
          >
            <Globe size={16} style={{ marginRight: '4px' }} /> Online Room
          </button>
        </div>

        {activeTab === 'online' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: connStatus === 'connected' ? '#10B981' : connStatus === 'connecting' ? '#F59E0B' : '#EF4444',
                boxShadow: `0 0 6px ${connStatus === 'connected' ? '#10B981' : connStatus === 'connecting' ? '#F59E0B' : '#EF4444'}`
              }}
            />
            <span style={{ fontSize: '0.8rem', color: connStatus === 'connected' ? '#10B981' : connStatus === 'connecting' ? '#F59E0B' : '#EF4444', fontWeight: 700 }}>
              {connStatus === 'connected' ? 'Server Connected & Ready' : connStatus === 'connecting' ? 'Connecting to Server...' : 'Server Offline (Check Connection)'}
            </span>
          </div>
        )}

        {errorMsg && (
          <div style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid #DC2626', color: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
            {errorMsg}
          </div>
        )}

        {/* Player Count */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '6px' }}>Total Players:</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {([2, 3, 4] as const).map((num) => (
              <button
                key={num}
                className="btn-secondary"
                style={{ flex: 1, background: playerCount === num ? '#047857' : 'rgba(255,255,255,0.08)', color: '#FFF' }}
                onClick={() => setPlayerCount(num)}
              >
                {num} Players
              </button>
            ))}
          </div>
        </div>

        {/* Player Name(s) */}
        {activeTab === 'pass_play' ? (
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: '#CBD5E1', fontWeight: 600 }}>Pass & Play Player Names:</label>
            {Array.from({ length: playerCount }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 800, width: '65px', flexShrink: 0 }}>
                  Player {i + 1}:
                </span>
                <input
                  type="text"
                  className="glass-panel"
                  style={{ flex: 1, padding: '8px 12px', color: '#FFF', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '0.85rem' }}
                  placeholder={`Player ${i + 1}`}
                  value={passPlayNames[i] || `Player ${i + 1}`}
                  onChange={(e) => handlePassPlayNameChange(i, e.target.value)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '6px' }}>Player Name:</label>
            <input
              type="text"
              className="glass-panel"
              style={{ width: '100%', padding: '10px 14px', color: '#FFF', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            />
          </div>
        )}

        {/* AI Difficulty */}
        {activeTab === 'bot' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '6px' }}>AI Bot Difficulty:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  className="btn-secondary"
                  style={{ flex: 1, textTransform: 'capitalize', background: botDifficulty === diff ? '#047857' : 'rgba(255,255,255,0.08)', color: '#FFF' }}
                  onClick={() => setBotDifficulty(diff)}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Online Room Specific */}
        {activeTab === 'online' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div>
              <button className="btn-primary" style={{ width: '100%' }} onClick={handleCreateRoom}>
                <Plus size={18} style={{ marginRight: '6px' }} /> Create New Room
              </button>
            </div>
            <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748B' }}>- OR -</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="6-LETTER ROOM CODE"
                className="glass-panel"
                style={{ flex: 1, padding: '10px 14px', textTransform: 'uppercase', letterSpacing: '2px', color: '#FFF', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
              <button className="btn-secondary" onClick={handleJoinRoom}>
                Join Room <ArrowRight size={16} style={{ marginLeft: '4px' }} />
              </button>
            </div>
          </div>
        )}

        {/* Action Button for Offline */}
        {activeTab !== 'online' && (
          <button className="btn-primary" style={{ width: '100%', marginTop: '10px' }} onClick={handleStartOffline}>
            <Play size={18} style={{ marginRight: '6px' }} /> Start Match
          </button>
        )}

        {/* WhatsApp App Share Footnote */}
        <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
          <button
            onClick={handleShareWhatsAppGeneral}
            style={{
              background: 'none',
              border: 'none',
              color: '#25D366',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Share2 size={14} /> Share Splendor App via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
