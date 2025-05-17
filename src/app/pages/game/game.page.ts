import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { WebSocketService } from 'src/app/service/websocket.service';
import {
  IonHeader,
  IonTitle,
  IonToolbar,
  IonContent,
  IonItem,
  IonInput,
  IonLabel,
  IonButton,
} from '@ionic/angular/standalone';

interface Player {
  name: string;
  position: number;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonContent,
    IonItem,
    IonInput,
    IonLabel,
    IonButton,
  ],
})
export class GamePage implements OnInit {
  players: Player[] = [];
  currentPlayerIndex = 0;
  round = 1;
  maxRounds = 5;
  lastRoll: number | null = null;
  winner: Player | null = null;

  playerName = '';
  roomPin = '';
  connected = false;

  constructor(private router: Router, private wsService: WebSocketService) {}

  ngOnInit() {
    // Apenas para carregar localStorage se quiser
    const saved = localStorage.getItem('playerInfo');
    if (saved) {
      const { name, room } = JSON.parse(saved);
      this.playerName = name;
      this.roomPin = room;
    }
  }

  rollDice() {
    if (!this.connected || this.round > this.maxRounds) return;

    const roll = Math.floor(Math.random() * 6) + 1;

    this.wsService.sendMessage({
      type: 'roll',
      room: this.roomPin,
      player: this.playerName,
      roll,
    });
  }

  connectToRoom() {
    if (!this.playerName || !this.roomPin) return;

    this.connected = true;

    this.players.push({ name: this.playerName, position: 0 });
    this.wsService.connect(this.roomPin);
    this.wsService.sendMessage({ type: 'join', room: this.roomPin });

    this.wsService.onMessage((msg) => {
      if (msg.type === 'update') {
        const player = this.players.find((p) => p.name === msg.player);

        if (player) {
          player.position += msg.roll;
        } else {
          this.players.push({ name: msg.player, position: msg.roll });
        }

        this.lastRoll = msg.roll;

        // Próximo jogador
        this.currentPlayerIndex++;
        if (this.currentPlayerIndex >= this.players.length) {
          this.currentPlayerIndex = 0;
          this.round++;
        }

        // Fim do jogo
        if (this.round > this.maxRounds) {
          this.winner = this.players.reduce((a, b) =>
            a.position > b.position ? a : b
          );
        }
      }
    });
  }

  restart() {
    localStorage.removeItem('players');
    this.router.navigateByUrl('/home');
  }
}
