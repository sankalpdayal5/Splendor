import express from 'express';
import http from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { Mutex } from 'async-mutex';
import {
  GameState,
  GameAction,
  GameConfig,
  RoomInfo,
  Player
} from '../src/engine/types.js';
import {
  createInitialState,
  applyAction,
  validateAction
} from '../src/engine/gameEngine.js';
import { selectBotAction } from '../src/engine/aiEngine.js';
import { createHealthRouter } from './health.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 4096 // 4KB payload limit
});

// In-Memory Room Registry
const rooms: Map<string, RoomInfo> = new Map();
const roomMutexes: Map<string, Mutex> = new Map();
const disconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();

function getRoomMutex(roomCode: string): Mutex {
  if (!roomMutexes.has(roomCode)) {
    roomMutexes.set(roomCode, new Mutex());
  }
  return roomMutexes.get(roomCode)!;
}

// Server View Projection Filter: Redacts deck card arrays to prevent deck peeking
function projectStateForPlayer(state: GameState, targetPlayerId: string): any {
  return {
    gameId: state.gameId,
    playerCount: state.playerCount,
    currentTurnIndex: state.currentTurnIndex,
    bank: state.bank,
    tierGrid: state.tierGrid,
    nobles: state.nobles,
    phase: state.phase,
    pendingNobleOptions: state.pendingNobleOptions,
    finalRoundTriggered: state.finalRoundTriggered,
    winnerIds: state.winnerIds,
    turnNumber: state.turnNumber,
    moveHistory: state.moveHistory,
    // EXPOSE ONLY DECK COUNTS TO CLIENTS
    tierDeckCounts: {
      tier1: state.tierDecks.tier1.length,
      tier2: state.tierDecks.tier2.length,
      tier3: state.tierDecks.tier3.length
    },
    players: state.players.map(p => ({
      ...p,
      // Mask face-down reserved cards for opponents
      reservedCards: p.id === targetPlayerId
        ? p.reservedCards
        : p.reservedCards.map(c => ({ id: 'hidden', tier: c.tier, gemBonus: 'emerald', prestigePoints: 0, cost: {} }))
    }))
  };
}

function broadcastRoomState(room: RoomInfo) {
  if (!room.gameState) return;

  // Send tailored view projection to each player socket
  for (const p of room.players) {
    if (!p.isBot) {
      const projected = projectStateForPlayer(room.gameState, p.id);
      io.to(p.id).emit('GAME_STATE_UPDATE', projected);
    }
  }

  // Spectators get generalized view
  const publicView = projectStateForPlayer(room.gameState, '');
  io.to(`room_${room.roomCode}`).emit('PUBLIC_GAME_STATE', publicView);
}

// Process Bot Turns automatically
async function processBotTurnsIfNeeded(room: RoomInfo) {
  if (!room.gameState || room.gameState.phase === 'FINISHED') return;

  const activePlayer = room.gameState.players[room.gameState.currentTurnIndex];
  if (activePlayer && activePlayer.isBot) {
    // Artificial delay for smooth AI turn feel
    setTimeout(async () => {
      const mutex = getRoomMutex(room.roomCode);
      await mutex.runExclusive(() => {
        if (!room.gameState || room.gameState.phase === 'FINISHED') return;
        const currentActive = room.gameState.players[room.gameState.currentTurnIndex];
        if (!currentActive.isBot) return;

        try {
          const botAction = selectBotAction(room.gameState, currentActive.botDifficulty || 'medium');
          room.gameState = applyAction(room.gameState, botAction);
          broadcastRoomState(room);
          processBotTurnsIfNeeded(room);
        } catch (err: any) {
          console.error(`Bot action error in room ${room.roomCode}:`, err.message);
        }
      });
    }, 1000);
  }
}

// Health & Telemetry Routes
const { router: healthRouter, setShuttingDown } = createHealthRouter(io, () => rooms.size);
app.use(healthRouter);

// Serve Static Frontend Production Assets
const distPublicPath = path.join(__dirname, '../dist');
app.use(express.static(distPublicPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPublicPath, 'index.html'));
});

// Socket.io Real-time Handlers
io.on('connection', (socket: Socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // 1. CREATE ROOM
  socket.on('CREATE_ROOM', (data: { playerName: string; config: GameConfig }, callback) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const playerId = socket.id;

    const room: RoomInfo = {
      roomCode,
      hostId: playerId,
      players: [
        { id: playerId, name: data.playerName || 'Host Player', isBot: false, isReady: true }
      ],
      config: data.config,
      isStarted: false,
      gameState: null
    };

    rooms.set(roomCode, room);
    socket.join(`room_${roomCode}`);
    socket.join(playerId);

    if (typeof callback === 'function') {
      callback({ success: true, roomCode, playerId });
    }

    io.to(`room_${roomCode}`).emit('ROOM_UPDATED', room);
  });

  // 2. JOIN ROOM
  socket.on('JOIN_ROOM', (data: { roomCode: string; playerName: string }, callback) => {
    const roomCode = data.roomCode?.toUpperCase();
    const room = rooms.get(roomCode);

    if (!room) {
      if (typeof callback === 'function') callback({ success: false, message: 'Room not found.' });
      return;
    }

    if (room.isStarted) {
      if (typeof callback === 'function') callback({ success: false, message: 'Game already in progress.' });
      return;
    }

    if (room.players.length >= room.config.playerCount) {
      if (typeof callback === 'function') callback({ success: false, message: 'Room is full.' });
      return;
    }

    const playerId = socket.id;
    room.players.push({ id: playerId, name: data.playerName || `Player ${room.players.length + 1}`, isBot: false, isReady: true });

    socket.join(`room_${roomCode}`);
    socket.join(playerId);

    if (typeof callback === 'function') {
      callback({ success: true, roomCode, playerId });
    }

    io.to(`room_${roomCode}`).emit('ROOM_UPDATED', room);
  });

  // 3. ADD BOT
  socket.on('ADD_BOT', (data: { roomCode: string; difficulty: 'easy' | 'medium' | 'hard' }) => {
    const room = rooms.get(data.roomCode);
    if (!room || room.isStarted) return;
    if (room.players.length >= room.config.playerCount) return;

    const botNumber = room.players.filter(p => p.isBot).length + 1;
    room.players.push({
      id: `bot_${Date.now()}_${botNumber}`,
      name: `Bot ${botNumber} (${data.difficulty})`,
      isBot: true,
      botDifficulty: data.difficulty,
      isReady: true
    });

    io.to(`room_${data.roomCode}`).emit('ROOM_UPDATED', room);
  });

  // 4. START GAME
  socket.on('START_GAME', (data: { roomCode: string }) => {
    const room = rooms.get(data.roomCode);
    if (!room || room.isStarted) return;

    // Fill remaining slots with Medium Bots if needed
    while (room.players.length < room.config.playerCount) {
      const botNum = room.players.filter(p => p.isBot).length + 1;
      room.players.push({
        id: `bot_${Date.now()}_${botNum}`,
        name: `Bot ${botNum} (Medium)`,
        isBot: true,
        botDifficulty: 'medium',
        isReady: true
      });
    }

    const fullConfig: GameConfig = {
      playerCount: room.config.playerCount,
      mode: 'online_room',
      players: room.players.map(p => ({
        name: p.name,
        isBot: p.isBot,
        botDifficulty: p.botDifficulty
      }))
    };

    room.gameState = createInitialState(fullConfig);
    // Bind actual player IDs to state
    room.gameState.players.forEach((p, idx) => {
      p.id = room.players[idx].id;
    });

    room.isStarted = true;
    broadcastRoomState(room);
    processBotTurnsIfNeeded(room);
  });

  // 5. SUBMIT ACTION
  socket.on('SUBMIT_ACTION', async (data: { roomCode: string; action: GameAction }, callback) => {
    const room = rooms.get(data.roomCode);
    if (!room || !room.gameState) {
      if (typeof callback === 'function') callback({ success: false, message: 'Invalid room or game state.' });
      return;
    }

    const mutex = getRoomMutex(data.roomCode);
    await mutex.runExclusive(() => {
      if (!room.gameState) return;

      const activePlayer = room.gameState.players[room.gameState.currentTurnIndex];
      if (activePlayer.id !== socket.id) {
        if (typeof callback === 'function') callback({ success: false, message: 'Not your turn.' });
        return;
      }

      try {
        room.gameState = applyAction(room.gameState, data.action);
        if (typeof callback === 'function') callback({ success: true });
        broadcastRoomState(room);
        processBotTurnsIfNeeded(room);
      } catch (err: any) {
        if (typeof callback === 'function') callback({ success: false, message: err.message });
      }
    });
  });

  // 6. CHAT MESSAGE
  socket.on('SEND_CHAT', (data: { roomCode: string; message: string; senderName: string }) => {
    io.to(`room_${data.roomCode}`).emit('CHAT_MESSAGE', {
      senderName: data.senderName,
      message: data.message,
      timestamp: Date.now()
    });
  });

  // 7. DISCONNECT & RECONNECT GRACE PERIOD
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Graceful SIGTERM Shutdown Handler
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Initiating graceful shutdown...');
  setShuttingDown();

  io.emit('SERVER_SHUTTING_DOWN', { message: 'Server restarting for updates. Matches will re-sync.' });

  setTimeout(() => {
    server.close(() => {
      console.log('HTTP & WebSocket server closed gracefully.');
      process.exit(0);
    });
  }, 5000);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Splendor Server running on port ${PORT}`);
});
