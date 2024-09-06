import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MessagesService } from 'src/messages/message.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private connectedUsers: Map<string, { name: string; isConnected: boolean }> =
    new Map();
  private typingUsers: Set<string> = new Set();

  constructor(private messagesService: MessagesService) {}

  // Iniciar WebSocket

  afterInit(server: Server) {}

  // Conexión al WebSocket

  handleConnection(client: Socket) {
    const userName = client.handshake.query.userName as string;
    if (userName) {
      const existingUser = Array.from(this.connectedUsers.values()).find(
        (user) => user.name === userName,
      );
      if (existingUser) {
        existingUser.isConnected = true;
      } else {
        this.connectedUsers.set(client.id, {
          name: userName,
          isConnected: true,
        });
      }
      setTimeout(() => {
        this.updateConnectedUsers();
      }, 3000);
      this.logger.log(`Cliente conectado: ${client.id}, Usuario: ${userName}`);
    }
    this.loadMessages(client);
  }

  // Desconexión del WebSocket

  handleDisconnect(client: Socket) {
    const user = Array.from(this.connectedUsers.values()).find(
      (user) => user.name === client.handshake.query.userName,
    );
    if (user) {
      user.isConnected = false;
      setTimeout(() => {
        this.connectedUsers = new Map(
          Array.from(this.connectedUsers.entries()).map(([id, u]) =>
            id === client.id ? [id, user] : [id, u],
          ),
        );
        this.updateConnectedUsers();
      }, 3000);
      this.logger.log(`Cliente desconectado: ${client.id}, Usuario: ${user.name}`);
    }
  }

  // Mensajes recibidos

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() message: { sender: string; text: string },
  ) {
    this.logger.log(`Mensaje recibido: ${message.sender} - ${message.text}`);

    const references = this.extractReferences(message.text);
    const newMessage = await this.messagesService.createMessage(
      message.sender,
      message.text,
      references,
    );

    return newMessage;
  }

  // Reacciones recibidas

  @SubscribeMessage('reaction')
  async handleReaction(
    @MessageBody() reaction: { messageId: string; emoji: string; user: string },
  ) {
    this.logger.log(
      `Reacción recibia del usuario: ${reaction.user} con el emoji ${reaction.emoji} al mensaje ${reaction.messageId}`,
    );
    try {
      const updatedMessage = await this.messagesService.addReaction(
        reaction.messageId,
        reaction.emoji,
        reaction.user,
      );
      this.server.emit('reaction-updated', updatedMessage);
      return updatedMessage;
    } catch (error) {
      this.logger.error('Error añadiendo la reacción', error.stack);
    }
  }

  // Reacciones eliminadas

  @SubscribeMessage('remove-reaction')
  async handleRemoveReaction(
    client: Socket,
    payload: { messageId: string; emoji: string; user: string },
  ) {
    const { messageId, emoji, user } = payload;
    this.logger.log(
      `Petición para eliminar la reacción del usuario ${user}, eliminando ${emoji} del mensaje ${messageId}`,
    );
    try {
      const updatedMessage = await this.messagesService.removeReaction(
        messageId,
        emoji,
        user,
      );
      if (updatedMessage) {
        this.server.emit('reaction-removed', updatedMessage);
        this.logger.log(
          `Reacción eliminada del usuario: ${user}, eliminado ${emoji} del mensaje ${messageId}`,
        );
      }
    } catch (error) {
      this.logger.error('Error eliminando la reacción', error.stack);
    }
  }

  // Usuario escribiendo en el chat.

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { user: string }) {
    this.typingUsers.add(payload.user);
    this.server.emit('typing', Array.from(this.typingUsers));
  }

  // Usuario para de escribir en el chat.

  @SubscribeMessage('stop-typing')
  handleStopTyping(client: Socket, payload: { user: string }) {
    this.typingUsers.delete(payload.user);
    this.server.emit('typing', Array.from(this.typingUsers));
  }

  // Método privado: Cargar mensajes cuando se entra al chat.

  private async loadMessages(client: Socket) {
    const messages = await this.messagesService.findAllMessages();
    client.emit('messages', messages);
  }

  // Método privado: Actualizar los usuarios conectados.

  private updateConnectedUsers() {
    const users = Array.from(this.connectedUsers.values());
    this.server.emit('users-updated', users);
  }

  // Método privado: Definir la referencia que se hace a un usuario.

  private extractReferences(message: string): string[] {
    const regex = /@(\w+)/g;
    const references: string[] = [];
    let match: string[];
    while ((match = regex.exec(message)) !== null) {
      references.push(match[1]);
    }
    return references;
  }
}
