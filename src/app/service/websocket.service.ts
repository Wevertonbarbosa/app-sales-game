import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket!: WebSocket;

  connect(room: string): void {
    this.socket = new WebSocket('ws://localhost:3000');

    this.socket.addEventListener('open', () => {
      console.log('Conectado ao WebSocket');
      this.sendMessage({ type: 'join', room });
    });
  }

  sendMessage(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      this.socket.addEventListener('open', () => {
        this.socket.send(JSON.stringify(message));
      });
    }
  }

  onMessage(callback: (data: any) => void) {
    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    });
  }
}
