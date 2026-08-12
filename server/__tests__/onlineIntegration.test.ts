import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import express from 'express';
import { Server as SocketServer } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { GameConfig } from '../../src/engine/types.js';

describe('E2E Online Multiplayer Integration Test Suite', () => {
  let httpServer: http.Server;
  let ioServer: SocketServer;
  let serverPort: number;
  let client1: ClientSocket;
  let client2: ClientSocket;
  let client3: ClientSocket;
  const sessionUser1 = 'user_session_test_1';
  const sessionUser2 = 'user_session_test_2';
  const sessionUser3 = 'user_session_test_3';

  // In-Memory Room Store for testing server logic parity
  const rooms: Map<string, any> = new Map();

  beforeAll(async () => {
    const app = express();
    httpServer = http.createServer(app);
    ioServer = new SocketServer(httpServer, {
      cors: { origin: '*' }
    });

    // Mirror server handlers
    ioServer.on('connection', (socket) => {
      const sessionPlayerId = (socket.handshake.auth?.sessionPlayerId as string) || socket.id;
      socket.data.sessionPlayerId = sessionPlayerId;
      socket.join(sessionPlayerId);

      socket.on('CREATE_ROOM', (data: { playerName: string; config: GameConfig; sessionPlayerId?: string }, callback) => {
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const playerId = data.sessionPlayerId || socket.data.sessionPlayerId || socket.id;

        const room = {
          roomCode,
          hostId: playerId,
          players: [{ id: playerId, name: data.playerName || 'Host', isBot: false, isReady: true }],
          config: data.config,
          isStarted: false,
          gameState: null
        };

        rooms.set(roomCode, room);
        socket.join(`room_${roomCode}`);
        socket.join(playerId);

        if (typeof callback === 'function') callback({ success: true, roomCode, playerId });
        ioServer.to(`room_${roomCode}`).emit('ROOM_UPDATED', room);
      });

      socket.on('JOIN_ROOM', (data: { roomCode: string; playerName: string; sessionPlayerId?: string }, callback) => {
        const roomCode = data.roomCode?.trim().toUpperCase();
        const room = rooms.get(roomCode);

        if (!room) {
          if (typeof callback === 'function') callback({ success: false, message: 'Room not found.' });
          return;
        }

        const playerId = data.sessionPlayerId || socket.data.sessionPlayerId || socket.id;
        const existingPlayer = room.players.find((p: any) => p.id === playerId);
        if (existingPlayer) {
          socket.join(`room_${roomCode}`);
          socket.join(playerId);
          if (typeof callback === 'function') callback({ success: true, roomCode, playerId });
          ioServer.to(`room_${roomCode}`).emit('ROOM_UPDATED', room);
          return;
        }

        if (room.players.length >= room.config.playerCount) {
          if (typeof callback === 'function') callback({ success: false, message: 'Room is full.' });
          return;
        }

        room.players.push({ id: playerId, name: data.playerName || 'Guest', isBot: false, isReady: true });
        socket.join(`room_${roomCode}`);
        socket.join(playerId);

        if (typeof callback === 'function') callback({ success: true, roomCode, playerId });
        ioServer.to(`room_${roomCode}`).emit('ROOM_UPDATED', room);
      });

      socket.on('ADD_BOT', (data: { roomCode: string; difficulty: 'easy' | 'medium' | 'hard' }) => {
        const room = rooms.get(data.roomCode?.trim().toUpperCase());
        if (!room || room.players.length >= room.config.playerCount) return;
        const botNum = room.players.filter((p: any) => p.isBot).length + 1;
        room.players.push({ id: `bot_${botNum}`, name: `Bot ${botNum}`, isBot: true, botDifficulty: data.difficulty });
        ioServer.to(`room_${room.roomCode}`).emit('ROOM_UPDATED', room);
      });

      socket.on('SEND_CHAT', (data: { roomCode: string; message: string; senderName: string }) => {
        ioServer.to(`room_${data.roomCode}`).emit('CHAT_MESSAGE', {
          senderName: data.senderName,
          message: data.message,
          timestamp: Date.now()
        });
      });
    });

    await new Promise<void>((resolve) => {
      httpServer.listen(0, '127.0.0.1', () => {
        const addr = httpServer.address();
        serverPort = typeof addr === 'object' && addr ? addr.port : 0;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (client1?.connected) client1.disconnect();
    if (client2?.connected) client2.disconnect();
    if (client3?.connected) client3.disconnect();
    await new Promise<void>((resolve) => ioServer.close(() => resolve()));
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  });

  function createTestClient(sessionToken: string): Promise<ClientSocket> {
    return new Promise((resolve) => {
      const socket = ioClient(`http://127.0.0.1:${serverPort}`, {
        transports: ['polling', 'websocket'],
        reconnection: false,
        auth: { sessionPlayerId: sessionToken }
      });
      socket.on('connect', () => resolve(socket));
    });
  }

  let testRoomCode = '';

  it('Case 1: Should create online room with unique 6-character room code (CREATE_ROOM)', async () => {
    client1 = await createTestClient(sessionUser1);

    const config: GameConfig = {
      mode: 'online_room',
      playerCount: 2,
      botCount: 0,
      botDifficulty: 'medium',
      players: [{ name: 'Alice', isBot: false }]
    };

    const res: any = await new Promise((resolve) => {
      client1.emit('CREATE_ROOM', { playerName: 'Alice', config, sessionPlayerId: sessionUser1 }, resolve);
    });

    expect(res.success).toBe(true);
    expect(res.roomCode).toBeDefined();
    expect(res.roomCode.length).toBe(6);
    expect(res.playerId).toBe(sessionUser1);
    testRoomCode = res.roomCode;
  });

  it('Case 2: Should allow Player 2 to join online room and broadcast updated room state (JOIN_ROOM)', async () => {
    client2 = await createTestClient(sessionUser2);

    const roomUpdatePromise = new Promise<any>((resolve) => {
      client1.once('ROOM_UPDATED', resolve);
    });

    const joinRes: any = await new Promise((resolve) => {
      client2.emit('JOIN_ROOM', { roomCode: testRoomCode, playerName: 'Bob', sessionPlayerId: sessionUser2 }, resolve);
    });

    expect(joinRes.success).toBe(true);
    expect(joinRes.playerId).toBe(sessionUser2);

    const updatedRoom = await roomUpdatePromise;
    expect(updatedRoom.players.length).toBe(2);
    expect(updatedRoom.players[1].name).toBe('Bob');
  });

  it('Case 3: Should enforce room capacity limit and reject 3rd player when max player count is 2', async () => {
    client3 = await createTestClient(sessionUser3);

    const joinRes: any = await new Promise((resolve) => {
      client3.emit('JOIN_ROOM', { roomCode: testRoomCode, playerName: 'Charlie', sessionPlayerId: sessionUser3 }, resolve);
    });

    expect(joinRes.success).toBe(false);
    expect(joinRes.message).toBe('Room is full.');
  });

  it('Case 4: Should add AI Bot to room when requested by host (ADD_BOT)', async () => {
    const config: GameConfig = {
      mode: 'online_room',
      playerCount: 3,
      botCount: 0,
      botDifficulty: 'hard',
      players: [{ name: 'Host', isBot: false }]
    };

    const createRes: any = await new Promise((resolve) => {
      client1.emit('CREATE_ROOM', { playerName: 'Host', config, sessionPlayerId: sessionUser1 }, resolve);
    });

    const roomCode3 = createRes.roomCode;

    const roomUpdatePromise = new Promise<any>((resolve) => {
      client1.on('ROOM_UPDATED', (room) => {
        if (room.players.length === 2) resolve(room);
      });
    });

    client1.emit('ADD_BOT', { roomCode: roomCode3, difficulty: 'hard' });

    const updatedRoom = await roomUpdatePromise;
    expect(updatedRoom.players.length).toBe(2);
    expect(updatedRoom.players[1].isBot).toBe(true);
    expect(updatedRoom.players[1].botDifficulty).toBe('hard');
  });

  it('Case 5: Should broadcast real-time in-room chat messages (SEND_CHAT & CHAT_MESSAGE)', async () => {
    const chatPromise = new Promise<any>((resolve) => {
      client2.once('CHAT_MESSAGE', resolve);
    });

    client1.emit('SEND_CHAT', { roomCode: testRoomCode, message: 'Good luck!', senderName: 'Alice' });

    const chatData = await chatPromise;
    expect(chatData.senderName).toBe('Alice');
    expect(chatData.message).toBe('Good luck!');
    expect(chatData.timestamp).toBeGreaterThan(0);
  });

  it('Case 6: Should allow persistent session player re-joining room after socket drop', async () => {
    client2.disconnect();

    const client2Reconnected = await createTestClient(sessionUser2);

    const rejoinRes: any = await new Promise((resolve) => {
      client2Reconnected.emit('JOIN_ROOM', { roomCode: testRoomCode, playerName: 'Bob', sessionPlayerId: sessionUser2 }, resolve);
    });

    expect(rejoinRes.success).toBe(true);
    expect(rejoinRes.playerId).toBe(sessionUser2);
    client2Reconnected.disconnect();
  });
});
