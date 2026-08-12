import React, { useState, useEffect } from 'react';
import { GameConfig, RoomInfo } from '../../engine/types.js';
import { Bot, Users, Globe, Play, Plus, ArrowRight, Wifi } from 'lucide-react';
import { socketService } from '../../services/socketService.js';

interface LobbyModalProps {
  onStartOfflineMatch: (config: GameConfig) => void;
  onCreateOnlineRoom: (playerName: string, config: GameConfig) => Promise<{ success: boolean; roomCode?: string; message?: string }>;
  onJoinOnlineRoom: (roomCode: string, playerName: string) => Promise<{ success: boolean; message?: string }>;
  roomInfo?: RoomInfo | null;
  onAddBotToRoom?: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onStartOnlineRoom?: () => void;
}

export const LobbyModal: React.FC<LobbyModalProps> = ({
  onStartOfflineMatch,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  roomInfo,
  onAddBotToRoom,
  onStartOnlineRoom
}) => {
  const [activeTab, setActiveTab] = useState<'bot' | 'pass_play' | 'online'>('bot');
  const [playerName, setPlayerName] = useState('Player 1');
  const [passPlayNames, setPassPlayNames] = useState<string[]>(['Player 1', 'Player 2', 'Player 3', 'Player 4']);
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(3);
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [joinCode, setJoinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [connStatus, setConnStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>(socketService.getConnectionStatus());

  useEffect(() => {
    socketService.onConnectionStatusChange((status) => {
      setConnStatus(status);
    });
  }, []);

  const handlePassPlayNameChange = (index: number, val: string) => {
    const updated = [...passPlayNames];
    updated[index] = val;
    setPassPlayNames(updated);
  };

  if (roomInfo && !roomInfo.isStarted) {
    return (
      <div className="modal-overlay">
        <div className="glass-panel modal-content" style={{ maxWidth: '580px' }}>
          <h2 className="cinzel-font" style={{ color: '#D4AF37', marginBottom: '8px', textAlign: 'center' }}>
            Multiplayer Room
          </h2>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>SHARE ROOM CODE:</span>
            <div className="selectable-text" style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '4px', color: '#1D4ED8', marginTop: '4px' }}>
              {roomInfo.roomCode}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '8px' }}>
              Players in Room ({roomInfo.players.length}/{roomInfo.config.playerCount}):
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {roomInfo.players.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '10px' }}>
                  <span style={{ fontWeight: 600 }}>{p.name} {p.isBot && <small style={{ color: '#94A3B8' }}>(Bot)</small>}</span>
                  <span style={{ fontSize: '0.75rem', color: '#047857', background: 'rgba(4,120,87,0.15)', padding: '2px 8px', borderRadius: '4px' }}>Ready</span>
                </div>
              ))}
            </div>
          </div>

          {roomInfo.players.length < roomInfo.config.playerCount && onAddBotToRoom && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => onAddBotToRoom('easy')}>+ Add Easy Bot</button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => onAddBotToRoom('medium')}>+ Add Medium Bot</button>
              <button className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem' }} onClick={() => onAddBotToRoom('hard')}>+ Add Hard Bot</button>
            </div>
          )}

          {onStartOnlineRoom && (
            <button
              className="btn-primary"
              style={{ width: '100%', fontSize: '1rem', padding: '12px' }}
              disabled={roomInfo.players.length < 2}
              onClick={onStartOnlineRoom}
            >
              Start Online Match ({roomInfo.players.length}/{roomInfo.config.playerCount})
            </button>
          )}
        </div>
      </div>
    );
  }

  const handleStartOffline = () => {
    let mode: 'offline_bot' | 'offline_pass_play' = 'offline_bot';
    let botCount = 0;

    if (activeTab === 'bot') {
      mode = 'offline_bot';
      botCount = playerCount - 1;
    } else if (activeTab === 'pass_play') {
      mode = 'offline_pass_play';
      botCount = 0;
    }

    const config: GameConfig = {
      mode,
      playerCount,
      botCount,
      botDifficulty,
      players: Array.from({ length: playerCount }, (_, i) => ({
        name: activeTab === 'pass_play'
          ? (passPlayNames[i]?.trim() || `Player ${i + 1}`)
          : (i === 0 ? playerName || 'Player 1' : `Bot ${i}`),
        isBot: mode === 'offline_bot' ? i > 0 : false,
        difficulty: botDifficulty
      }))
    };

    onStartOfflineMatch(config);
  };

  const handleCreateRoom = async () => {
    setErrorMsg('');
    const config: GameConfig = {
      mode: 'online_room',
      playerCount,
      botCount: 0,
      botDifficulty,
      players: [{ name: playerName || 'Player 1', isBot: false }]
    };
    const res = await onCreateOnlineRoom(playerName || 'Player 1', config);
    if (!res.success) {
      setErrorMsg(res.message || 'Failed to create room.');
    }
  };

  const handleJoinRoom = async () => {
    setErrorMsg('');
    if (!joinCode || joinCode.length < 4) {
      setErrorMsg('Please enter a valid room code.');
      return;
    }
    const res = await onJoinOnlineRoom(joinCode.toUpperCase(), playerName || 'Player 2');
    if (!res.success) {
      setErrorMsg(res.message || 'Failed to join room.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '520px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 className="cinzel-font" style={{ fontSize: '2rem', color: '#D4AF37', letterSpacing: '2px' }}>
            SPLENDOR
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
            Renaissance Gem Merchant Strategy Board Game
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '10px', marginBottom: '20px' }}>
          <button
            className={`btn-secondary ${activeTab === 'bot' ? 'active' : ''}`}
            style={{ flex: 1, border: 'none', background: activeTab === 'bot' ? 'rgba(212,175,55,0.2)' : 'transparent', color: activeTab === 'bot' ? '#D4AF37' : '#94A3B8' }}
            onClick={() => setActiveTab('bot')}
          >
            <Bot size={16} style={{ marginRight: '6px' }} /> vs AI Bot
          </button>
          <button
            className={`btn-secondary ${activeTab === 'pass_play' ? 'active' : ''}`}
            style={{ flex: 1, border: 'none', background: activeTab === 'pass_play' ? 'rgba(212,175,55,0.2)' : 'transparent', color: activeTab === 'pass_play' ? '#D4AF37' : '#94A3B8' }}
            onClick={() => setActiveTab('pass_play')}
          >
            <Users size={16} style={{ marginRight: '6px' }} /> Pass & Play
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
      </div>
    </div>
  );
};
