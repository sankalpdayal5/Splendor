import React, { useState } from 'react';
import { GameConfig, RoomInfo } from '../engine/types';
import { Bot, Users, Globe, Play, Plus, ArrowRight } from 'lucide-react';

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
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(3);
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [joinCode, setJoinCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // If in an active waiting room, show Room HUD
  if (roomInfo && !roomInfo.isStarted) {
    return (
      <div className="modal-overlay">
        <div className="glass-panel modal-content" style={{ maxWidth: '580px' }}>
          <h2 className="cinzel-font" style={{ color: '#F59E0B', marginBottom: '8px', textAlign: 'center' }}>
            Multiplayer Room
          </h2>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>SHARE ROOM CODE:</span>
            <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '4px', color: '#3B82F6', marginTop: '4px' }}>
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
                  <span style={{ fontSize: '0.75rem', color: '#10B981', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '4px' }}>Ready</span>
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

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {onStartOnlineRoom && (
              <button className="btn-primary" style={{ width: '100%' }} onClick={onStartOnlineRoom}>
                <Play size={18} style={{ marginRight: '6px', inlineSize: 'auto' }} /> Start Game
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const handleStartOffline = () => {
    if (activeTab === 'bot') {
      const config: GameConfig = {
        playerCount,
        mode: 'offline_bot',
        botCount: playerCount - 1,
        botDifficulty,
        players: [
          { name: playerName || 'Player 1', isBot: false },
          ...Array.from({ length: playerCount - 1 }).map((_, i) => ({
            name: `Bot ${i + 1} (${botDifficulty})`,
            isBot: true,
            botDifficulty
          }))
        ]
      };
      onStartOfflineMatch(config);
    } else if (activeTab === 'pass_play') {
      const config: GameConfig = {
        playerCount,
        mode: 'offline_pass_play',
        players: Array.from({ length: playerCount }).map((_, i) => ({
          name: `Player ${i + 1}`,
          isBot: false
        }))
      };
      onStartOfflineMatch(config);
    }
  };

  const handleCreateRoom = async () => {
    setErrorMsg('');
    const config: GameConfig = {
      playerCount,
      mode: 'online_room',
      players: []
    };
    const res = await onCreateOnlineRoom(playerName, config);
    if (!res.success) setErrorMsg(res.message || 'Failed to create room.');
  };

  const handleJoinRoom = async () => {
    if (!joinCode) {
      setErrorMsg('Please enter 6-character room code.');
      return;
    }
    setErrorMsg('');
    const res = await onJoinOnlineRoom(joinCode, playerName);
    if (!res.success) setErrorMsg(res.message || 'Failed to join room.');
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel modal-content" style={{ maxWidth: '580px' }}>
        <h1 className="cinzel-font" style={{ color: '#F59E0B', textAlign: 'center', marginBottom: '4px', fontSize: '2.2rem' }}>
          Splendor
        </h1>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#94A3B8', marginBottom: '20px' }}>
          Digital Strategy Gem Board Game
        </p>

        {/* Tab Selection */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
          <button
            className={`btn-secondary`}
            style={{ flex: 1, border: 'none', background: activeTab === 'bot' ? 'rgba(255,255,255,0.15)' : 'transparent', color: activeTab === 'bot' ? '#F59E0B' : '#94A3B8' }}
            onClick={() => setActiveTab('bot')}
          >
            <Bot size={16} style={{ marginRight: '6px' }} /> vs AI Bots
          </button>
          <button
            className={`btn-secondary`}
            style={{ flex: 1, border: 'none', background: activeTab === 'pass_play' ? 'rgba(255,255,255,0.15)' : 'transparent', color: activeTab === 'pass_play' ? '#F59E0B' : '#94A3B8' }}
            onClick={() => setActiveTab('pass_play')}
          >
            <Users size={16} style={{ marginRight: '6px' }} /> Pass & Play
          </button>
          <button
            className={`btn-secondary`}
            style={{ flex: 1, border: 'none', background: activeTab === 'online' ? 'rgba(255,255,255,0.15)' : 'transparent', color: activeTab === 'online' ? '#F59E0B' : '#94A3B8' }}
            onClick={() => setActiveTab('online')}
          >
            <Globe size={16} style={{ marginRight: '6px' }} /> Online Room
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #EF4444', color: '#EF4444', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        {/* Common Player Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '6px' }}>Your Name:</label>
          <input
            type="text"
            className="glass-panel"
            style={{ width: '100%', padding: '10px 14px', color: '#FFF', fontSize: '0.95rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)' }}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>

        {/* Player Count */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '6px' }}>Player Count:</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[2, 3, 4].map((num) => (
              <button
                key={num}
                className="btn-secondary"
                style={{ flex: 1, background: playerCount === num ? '#3B82F6' : 'rgba(255,255,255,0.08)', color: '#FFF' }}
                onClick={() => setPlayerCount(num as any)}
              >
                {num} Players
              </button>
            ))}
          </div>
        </div>

        {/* Bot Specific Config */}
        {activeTab === 'bot' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#CBD5E1', marginBottom: '6px' }}>AI Bot Difficulty:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  className="btn-secondary"
                  style={{ flex: 1, textTransform: 'capitalize', background: botDifficulty === diff ? '#10B981' : 'rgba(255,255,255,0.08)', color: '#FFF' }}
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
