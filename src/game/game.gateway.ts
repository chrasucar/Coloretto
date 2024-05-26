import {SubscribeMessage, WebSocketGateway, OnGatewayConnection, 
        OnGatewayDisconnect, WebSocketServer} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
  
  @WebSocketGateway()

  export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;
  
    constructor(private readonly gameService: GameService) {}
  
    handleConnection(client: Socket, ...args: any[]) {

      console.log('Client connected:', client.id);

    }
  
    handleDisconnect(client: Socket) {

      console.log('Client disconnected:', client.id);

    }
  
    @SubscribeMessage('joinGame')
    handleJoinGame(client: Socket, gameId: string) {

      this.gameService.joinGame(client.id, gameId);

      client.join(gameId);

      const gameState = this.gameService.getGameState(gameId);

      this.server.to(gameId).emit('gameState', gameState);

    }
  
    @SubscribeMessage('makeMove')
    handleMakeMove(client: Socket, { gameId, move }: { gameId: string; move: any }) {

      this.gameService.makeMove(client.id, gameId, move);

      const gameState = this.gameService.getGameState(gameId);

      this.server.to(gameId).emit('gameState', gameState);
      
    }
  }
  