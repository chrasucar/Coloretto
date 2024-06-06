import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { GameState } from './game.state';

@WebSocketGateway({
  cors: { origin: 'http://localhost:4000', credentials: true },
})

export class GameGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly gameService: GameService) {}

  // Unirse a una partida.

  @SubscribeMessage('joinGame')
  async joinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string },
  ) {
    const gameId = data.gameId;
    if (!gameId) {
      console.error('El id de juego es nulo o indefinido.');
      return;
    }

    await this.gameService.joinGame(client, gameId);
    const gameState = await this.gameService.getGameState(gameId);
    this.emitGameState(gameId, gameState);
  }

  // El jugador realiza un movimiento.

  @SubscribeMessage('makeMove')
  async handleMakeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    const { gameId, move } = data;
    if (!gameId) {
      console.error('El id de juego es nulo o indefinido.');
      return;
    }

    await this.gameService.makeMove(client, gameId, move);
    const gameState = await this.gameService.getGameState(gameId);
    this.emitGameState(gameId, gameState);
  }

  // Emitir el estado del juego.

  async emitGameState(gameId: string, gameState: GameState) {

    this.server.to(gameId).emit('gameStateUpdate', gameState);
  }
}
