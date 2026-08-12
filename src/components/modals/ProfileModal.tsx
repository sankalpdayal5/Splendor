import React, { useState } from 'react';
import { UserProfile, AVATAR_OPTIONS, saveUserProfile } from '../../utils/userProfile.js';
import { soundManager } from '../../utils/SoundManager.js';

interface ProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onUpdateProfile: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ profile, onClose, onUpdateProfile }) => {
  const [name, setName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [isEditing, setIsEditing] = useState(false);

  const winRate = profile.matchesPlayed > 0
    ? Math.round((profile.wins / profile.matchesPlayed) * 100)
    : 0;

  const handleSave = () => {
    soundManager.playButtonClick();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'Renaissance Merchant',
      avatar: selectedAvatar
    };
    saveUserProfile(updated);
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="glass-panel text-amber-100 modal-card animate-scale-in"
        style={{
          maxWidth: '680px',
          width: '92%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 27, 75, 0.95))',
          border: '2px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.2)',
          padding: '28px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>📜</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#F59E0B' }}>Merchant Profile</h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>Career Statistics & Achievements</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playButtonClick();
              onClose();
            }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#94A3B8',
              fontSize: '20px',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Profile Card Header */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}
        >
          {/* Avatar Display */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                fontSize: '54px',
                background: 'radial-gradient(circle, #312E81 0%, #0F172A 100%)',
                width: '88px',
                height: '88px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid #F59E0B',
                boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
              }}
            >
              {selectedAvatar}
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                background: '#F59E0B',
                color: '#0F172A',
                fontSize: '11px',
                fontWeight: 900,
                padding: '2px 6px',
                borderRadius: '10px'
              }}
            >
              LVL {profile.level}
            </div>
          </div>

          {/* User Details */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid #F59E0B',
                    color: '#FFF',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 700
                  }}
                  maxLength={20}
                />
                <button
                  onClick={handleSave}
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: '#0F172A',
                    fontWeight: 800,
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#FFF' }}>{profile.name}</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  title="Edit Name"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                >
                  ✏️
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px' }}>
              <span style={{ color: '#F59E0B', fontWeight: 700 }}>👑 {profile.title}</span>
              <span style={{ color: '#6366F1', fontWeight: 700 }}>⭐ Elo {profile.elo}</span>
            </div>

            {/* Level XP Bar */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginBottom: '4px' }}>
                <span>XP {profile.xp % 300} / 300</span>
                <span>Next Level {profile.level + 1}</span>
              </div>
              <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${((profile.xp % 300) / 300) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #6366F1, #F59E0B)'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Picker Section */}
        {isEditing && (
          <div style={{ marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#F59E0B' }}>Choose Avatar</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAvatar(opt.icon)}
                  style={{
                    fontSize: '28px',
                    padding: '8px',
                    borderRadius: '10px',
                    border: selectedAvatar === opt.icon ? '2px solid #F59E0B' : '1px solid rgba(255,255,255,0.1)',
                    background: selectedAvatar === opt.icon ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer'
                  }}
                >
                  {opt.icon}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Key Career Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#FFF' }}>{profile.matchesPlayed}</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>Matches</div>
          </div>
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#10B981' }}>{profile.wins}</div>
            <div style={{ fontSize: '11px', color: '#A7F3D0' }}>Wins ({winRate}%)</div>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#F59E0B' }}>{profile.highestSingleGameScore}</div>
            <div style={{ fontSize: '11px', color: '#FDE68A' }}>High Score</div>
          </div>
          <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#818CF8' }}>{profile.totalPrestigePoints}</div>
            <div style={{ fontSize: '11px', color: '#C7D2FE' }}>Total VP</div>
          </div>
        </div>

        {/* Achievements Section */}
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#F59E0B', fontWeight: 800 }}>
          🏆 Achievements ({profile.achievements.filter((a) => a.unlocked).length} / {profile.achievements.length})
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {profile.achievements.map((ach) => (
            <div
              key={ach.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '12px',
                background: ach.unlocked ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.03)',
                border: ach.unlocked ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255,255,255,0.06)',
                opacity: ach.unlocked ? 1 : 0.5
              }}
            >
              <span style={{ fontSize: '24px' }}>{ach.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: ach.unlocked ? '#F59E0B' : '#94A3B8' }}>{ach.title}</div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>{ach.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
