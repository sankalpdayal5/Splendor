import React, { useState, useEffect } from 'react';
import { GameState, GameConfig, GameAction, RoomInfo } from './engine/types.js';
import { createInitialState, applyAction } from './engine/gameEngine.js';
import { selectBotAction } from './engine/aiEngine.js';
import { socketService } from './services/socketService.js';
import { Navbar } from './components/common/index.js';
import { LobbyModal, RulebookModal } from './components/modals/index.js';
import { ProfileModal } from './components/modals/ProfileModal.js';
import { GameBoard } from './components/game/index.js';
import { getOrCreateUserProfile, UserProfile } from './utils/userProfile.js';
import './styles/index.css';

export const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [selfPlayerId, setSelfPlayerId] = useState<string | undefined>(undefined);
  const [colorblindMode, setColorblindMode] = useState<boolean>(false);
  const [learnMode, setLearnMode] = useState<boolean>(false);
  const [showRulebook, setShowRulebook] = useState<boolean>(false);
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(getOrCreateUserProfile());

  // Setup Socket.io Listeners for Online Mode
  useEffect(() => {
    socketService.connect();

    socketService.onRoomUpdated((room) => {
      setRoomInfo(room);
    });

    socketService.onGameStateUpdate((updatedState) => {
      setGameState(updatedState);
    });

    return () => {
      socketService.removeListeners();
    };
  }, []);

  // Offline Mode AI Bot Turn Processor
  useEffect(() => {
    if (!gameState || gameState.phase === 'FINISHED' || gameConfig?.mode === 'online_room') return;

    const activePlayer = gameState.players[gameState.currentTurnIndex];
    if (activePlayer && activePlayer.isBot) {
      const timer = setTimeout(() => {
        try {
          const botAction = selectBotAction(gameState, activePlayer.botDifficulty || 'medium');
          const nextState = applyAction(gameState, botAction);
          setGameState(nextState);
        } catch (err: any) {
          console.error('Offline Bot turn error:', err.message);
        }
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [gameState, gameConfig]);

  // Offline Start Match Handler
  const handleStartOfflineMatch = (config: GameConfig) => {
    setGameConfig(config);
    const initialState = createInitialState(config);
    setGameState(initialState);
    if (config.mode === 'offline_pass_play') {
      setSelfPlayerId(undefined); // Unblock all human turns in local Pass & Play!
      setLearnMode(false);
    } else {
      setSelfPlayerId(initialState.players[0].id);
      setLearnMode(true); // Default Learn Mode ON when playing vs AI Bot
    }
  };

  // Dispatch Action Handler (Works for Offline & Online)
  const handleDispatchAction = async (action: GameAction) => {
    if (!gameState) return;

    if (gameConfig?.mode === 'online_room' && roomInfo) {
      await socketService.submitAction(roomInfo.roomCode, action);
    } else {
      // Local Offline State Machine Execution
      try {
        const nextState = applyAction(gameState, action);
        setGameState(nextState);
      } catch (err: any) {
        console.error('Offline action execution error:', err.message);
      }
    }
  };

  // Rematch Handler
  const handleRematch = () => {
    if (gameConfig) {
      if (gameConfig.mode === 'online_room' && roomInfo) {
        socketService.startGame(roomInfo.roomCode);
      } else {
        handleStartOfflineMatch(gameConfig);
      }
    } else {
      setGameState(null);
    }
  };

  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  const handleExitGame = () => {
    setIsExitConfirmOpen(false);
    setGameState(null);
    setGameConfig(null);
    setRoomInfo(null);
    setSelfPlayerId(undefined);
    setUserProfile(getOrCreateUserProfile()); // Reload latest profile stats
  };

  const isOfflineBotMode = gameConfig?.mode === 'offline_bot';

  return (
    <div className="splendor-app">
      <Navbar
        onOpenRules={() => setShowRulebook(true)}
        colorblindMode={colorblindMode}
        onToggleColorblind={() => setColorblindMode(!colorblindMode)}
        roomCode={roomInfo?.roomCode}
        isOfflineBotMode={isOfflineBotMode}
        learnMode={learnMode}
        onToggleLearnMode={() => setLearnMode(!learnMode)}
        onExitGame={gameState ? handleExitGame : undefined}
        onExitConfirmStateChange={setIsExitConfirmOpen}
        onOpenProfile={() => setShowProfile(true)}
        userProfile={userProfile}
      />

      {/* ARIA Speech Announcement Live Regions */}
      <div id="aria-live-polite" className="sr-only" aria-live="polite" aria-atomic="true"></div>
      <div id="aria-live-assertive" className="sr-only" aria-live="assertive" aria-atomic="true"></div>

      {/* Main Content Area */}
      {!gameState ? (
        <LobbyModal onStartGame={(config) => handleStartOfflineMatch(config)} />
      ) : (
        <GameBoard
          gameState={gameState}
          colorblindMode={colorblindMode}
          learnMode={learnMode && isOfflineBotMode}
          isPassAndPlay={gameConfig?.mode === 'offline_pass_play'}
          onDispatchAction={handleDispatchAction}
          onRematch={handleRematch}
          onExitGame={handleExitGame}
          selfPlayerId={selfPlayerId}
          isExitConfirmOpen={isExitConfirmOpen}
        />
      )}

      {/* Interactive Profile Modal */}
      {showProfile && (
        <ProfileModal
          profile={userProfile}
          onClose={() => setShowProfile(false)}
          onUpdateProfile={(updated) => setUserProfile(updated)}
        />
      )}

      {/* Interactive Rulebook Modal */}
      {showRulebook && (
        <RulebookModal onClose={() => setShowRulebook(false)} />
      )}
    </div>
  );
};

export default App;
