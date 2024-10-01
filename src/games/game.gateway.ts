import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Game, GameDocument } from './game.schema';
import { Card } from './card/card.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Iniciar WebSocket.

  afterInit(server: Server) {}

  // Conexión al websocket.

  handleConnection(client: Socket) {}

  // Desconexión del websocket.

  handleDisconnect(client: Socket) {}

  // Crear partida.

  emitGameCreated(game: any) {
    this.server.emit('gameCreated', game);
  }

  // Unirse a partida.

  emitPlayerJoined(username: string) {
    this.server.emit('playerJoined', { username });
  }

  // Dejar partida.

  emitPlayerLeft(username: string) {
    this.server.emit('playerLeft', { username });
  }

  // Eliminar partida.

  emitGameDeleted(gameId: string) {
    this.server.emit('gameDeleted', gameId);
  }

  // Juego

  // Paso 1: Preparación | Asignación de cartas a los jugadores.

  emitGamePrepared(game: any) {
    this.server.emit('gamePrepared', game);
  }

  emitCardsAssigned(game: any) {
    this.server.emit('cardsAssigned', game);
  }

  // Paso 2: Acciones del jugador | Revelar carta o tomar columna.

  emitNextTurn(game: GameDocument): void {
    this.server.emit('nextTurn', { gameName: game.gameName, message: 'Cambio de turno' });
  }

  emitCardRevealed(game: GameDocument, revealedCard: Card) {
    this.server.emit('cardRevealed', { game, revealedCard });
  }

  emitColumnTaken(game: GameDocument, columnIndex: number, playerName: string) {
    this.server.emit('columnTaken', { game, columnIndex, playerName });
  }

  // Paso 3: Finalizar partida.

  emitRoundEnd(game: GameDocument): void {
    this.server.emit('roundEnd', { gameName: game.gameName, message: 'Es la última ronda.' });
  }

  emitGameFinalization(gameName: string, finalScores: Record<string, number>, winners: string[]): void {
    this.server.emit('gameFinalized', { gameName, finalScores, winners });
  }
}
