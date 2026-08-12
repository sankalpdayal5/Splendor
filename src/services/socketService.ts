import { io, Socket } from 'socket.io-client';
import { GameAction, GameConfig, RoomInfo } from '../engine/types.js';

class SocketService {
  private socket: Socket | null = null;
  private sessionPlayerId: string = '';
  private connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error' = 'disconnected';
  private statusListeners: Array<(status: 'connected' | 'connecting' | 'disconnected' | 'error') => void> = [];

  constructor() {
    this.sessionPlayerId = this.getOrCreateSessionPlayerId();
  }

  private getOrCreateSessionPlayerId(): string {
    if (typeof localStorage !== 'undefined') {
      let stored = localStorage.getItem('splendor_session_player_id');
      if (!stored) {
        stored = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('splendor_session_player_id', stored);
      }
      return stored;
    }
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  public getSessionPlayerId(): string {
    return this.sessionPlayerId;
  }

  public getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    return this.connectionStatus;
  }

  public onConnectionStatusChange(callback: (status: 'connected' | 'connecting' | 'disconnected' | 'error') => void) {
    this.statusListeners.push(callback);
    callback(this.connectionStatus);
  }

  private updateStatus(status: 'connected' | 'connecting' | 'disconnected' | 'error') {
    this.connectionStatus = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  public connect(): Socket {
    if (!this.socket) {
      const serverUrl = (import.meta as any).env?.VITE_SERVER_URL ||
        (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.origin : 'http://127.0.0.1:3001');

      this.updateStatus('connecting');

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1500,
        auth: {
          sessionPlayerId: this.sessionPlayerId
        }
      });

      this.socket.on('connect', () => {
        this.updateStatus('connected');
      });

      this.socket.on('disconnect', () => {
        this.updateStatus('disconnected');
      });

      this.socket.on('connect_error', () => {
        this.updateStatus('error');
      });
    }

    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public createRoom(playerName: string, config: GameConfig): Promise<{ success: boolean; roomCode?: string; playerId?: string; message?: string }> {
    return new Promise((resolve) => {
      const socket = this.connect();
      socket.emit('CREATE_ROOM', { playerName: playerName.trim(), config, sessionPlayerId: this.sessionPlayerId }, (response: any) => {
        resolve(response);
      });
    });
  }

  public joinRoom(roomCode: string, playerName: string): Promise<{ success: boolean; roomCode?: string; playerId?: string; message?: string }> {
    return new Promise((resolve) => {
      const socket = this.connect();
      socket.emit('JOIN_ROOM', { roomCode: roomCode.trim().toUpperCase(), playerName: playerName.trim(), sessionPlayerId: this.sessionPlayerId }, (response: any) => {
        resolve(response);
      });
    });
  }

  public addBot(roomCode: string, difficulty: 'easy' | 'medium' | 'hard') {
    if (this.socket) {
      this.socket.emit('ADD_BOT', { roomCode, difficulty });
    }
  }

  public startGame(roomCode: string) {
    if (this.socket) {
      this.socket.emit('START_GAME', { roomCode });
    }
  }

  public submitAction(roomCode: string, action: GameAction): Promise<{ success: boolean; message?: string }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, message: 'Not connected to server.' });
        return;
      }
      this.socket.emit('SUBMIT_ACTION', { roomCode, action, sessionPlayerId: this.sessionPlayerId }, (response: any) => {
        resolve(response);
      });
    });
  }

  public sendChat(roomCode: string, senderName: string, message: string) {
    if (this.socket) {
      this.socket.emit('SEND_CHAT', { roomCode, senderName, message });
    }
  }

  public onRoomUpdated(callback: (room: RoomInfo) => void) {
    if (this.socket) {
      this.socket.on('ROOM_UPDATED', callback);
    }
  }

  public onGameStateUpdate(callback: (gameState: any) => void) {
    if (this.socket) {
      this.socket.on('GAME_STATE_UPDATE', callback);
      this.socket.on('PUBLIC_GAME_STATE', callback);
    }
  }

  public onChatMessage(callback: (chat: { senderName: string; message: string; timestamp: number }) => void) {
    if (this.socket) {
      this.socket.on('CHAT_MESSAGE', callback);
    }
  }

  public removeListeners() {
    if (this.socket) {
      this.socket.off('ROOM_UPDATED');
      this.socket.off('GAME_STATE_UPDATE');
      this.socket.off('PUBLIC_GAME_STATE');
      this.socket.off('CHAT_MESSAGE');
    }
  }
}

export const socketService = new SocketService();
