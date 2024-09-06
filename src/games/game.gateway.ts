import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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

  handleConnection(client: Socket) {
    console.log(`Cliente del juego conectado: ${client.id}`);
  }

  // Desconexión del websocket.

  handleDisconnect(client: Socket) {
    console.log(`Cliente del juego desconectado: ${client.id}`);
  }

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

  // Volver a partida.

  emitPlayerRejoined(username: string) {
    this.server.emit('playerRejoined', { username });
  }

  // Eliminar partida.

  emitGameDeleted(gameId: string) {
    this.server.emit('gameDeleted', gameId);
  }
}
