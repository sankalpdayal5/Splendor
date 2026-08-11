import { io, Socket } from 'socket.io-client';
import { GameAction, GameConfig, RoomInfo } from '../engine/types';

class SocketService {
  private socket: Socket | null = null;

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io({
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000
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
      socket.emit('CREATE_ROOM', { playerName, config }, (response: any) => {
        resolve(response);
      });
    });
  }

  public joinRoom(roomCode: string, playerName: string): Promise<{ success: boolean; roomCode?: string; playerId?: string; message?: string }> {
    return new Promise((resolve) => {
      const socket = this.connect();
      socket.emit('JOIN_ROOM', { roomCode, playerName }, (response: any) => {
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
        resolve({ success: false, message: 'Not connected.' });
        return;
      }
      this.socket.emit('SUBMIT_ACTION', { roomCode, action }, (response: any) => {
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
