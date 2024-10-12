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
import { Message } from 'src/messages/message.schema';
import { MessagesService } from '../messages/message.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, Map<string, { name: string; isConnected: boolean }>> = new Map();
  private typingUsers: Map<string, Set<string>> = new Map();

  constructor(private messagesService: MessagesService) {}

  // Iniciar WebSocket

  afterInit(server: Server) {}

  // Conexión al WebSocket

  handleConnection(client: Socket) {
    const userName = client.handshake.query.userName as string;
    const gameName = client.handshake.query.gameName as string;
  
    if (userName && gameName) {

      const userMap = this.connectedUsers.get(gameName) || new Map();
      userMap.set(client.id, { name: userName, isConnected: true });
      this.connectedUsers.set(gameName, userMap);
  
      client.join(gameName);
  
      setTimeout(() => {
        this.updateConnectedUsers(gameName);
      }, 3000);
    }
    this.loadMessages(client, gameName);
  }

  // Desconexión del WebSocket

  handleDisconnect(client: Socket) {
    const gameName = client.handshake.query.gameName as string;
    
    const userMap = this.connectedUsers.get(gameName);
    if (userMap) {
      const user = userMap.get(client.id);
      if (user) {
        user.isConnected = false;
        userMap.set(client.id, user);
        setTimeout(() => {
          userMap.delete(client.id);
          if (userMap.size === 0) {
            this.connectedUsers.delete(gameName);
          } else {
            this.connectedUsers.set(gameName, userMap);
          }
          this.updateConnectedUsers(gameName);
        }, 3000);
      }
    }
  }

  // Mensajes recibidos

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() message: { sender: string; text: string, gameName?: string },
  ) {

    const references = this.extractReferences(message.text);
    const newMessage = await this.messagesService.createMessage(
      message.sender,
      message.text,
      references,
      message.gameName,
    );

    if (message.gameName) {
      this.server.to(message.gameName).emit('message', newMessage);
    } else {
      this.server.emit('general', newMessage);
    }

    return newMessage;
  }

  // Reacciones recibidas

  @SubscribeMessage('reaction')
  async handleReaction(@MessageBody() reaction: { messageId: string; emoji: string; user: string, gameName?: string }) {

  try {
    const updatedMessage = await this.messagesService.addReaction(
      reaction.messageId,
      reaction.emoji,
      reaction.user,
    );
    if (reaction.gameName) {
      this.server.to(reaction.gameName).emit('reaction-updated', updatedMessage);
    } else {
      this.server.emit('reaction-updated', updatedMessage);
    }
    return updatedMessage;
  } catch (error) {
    return null;
  }
}

  // Reacciones eliminadas

  @SubscribeMessage('remove-reaction')
  async handleRemoveReaction(client: Socket, payload: { messageId: string; emoji: string; user: string }) {

    const { messageId, emoji, user } = payload;

    try {
      const updatedMessage = await this.messagesService.removeReaction(
        messageId,
        emoji,
        user,
      );
      if (updatedMessage) {
        this.server.emit('reaction-removed', updatedMessage);
      }
    } catch (error) {
      return null;
    }
  }

  // Usuario escribiendo en el chat general.

  @SubscribeMessage('typing')
  handleTyping(client: Socket, payload: { user: string }) {
    const gameName = client.handshake.query.gameName as string;
    const usersInTyping = this.typingUsers.get(gameName) || new Set();
    
    usersInTyping.add(payload.user);
    this.typingUsers.set(gameName, usersInTyping);
    this.server.to(gameName).emit('typing', Array.from(usersInTyping));
  }

  // Usuario para de escribir en el chat general.

  @SubscribeMessage('stop-typing')
  handleStopTyping(client: Socket, payload: { user: string }) {
    const gameName = client.handshake.query.gameName as string;
    const usersInTyping = this.typingUsers.get(gameName);
    
    if (usersInTyping) {
      usersInTyping.delete(payload.user);
      this.typingUsers.set(gameName, usersInTyping);
      this.server.to(gameName).emit('typing', Array.from(usersInTyping));
    }
  }

  // Usuario escribiendo en el chat de una partida.

  @SubscribeMessage('typingGame')
  handleTypingGame(client: Socket, payload: { user: string, gameName: string }) {
    const usersInTyping = this.typingUsers.get(payload.gameName) || new Set();
    
    usersInTyping.add(payload.user);
    this.typingUsers.set(payload.gameName, usersInTyping);
    this.server.to(payload.gameName).emit('typingGame', Array.from(usersInTyping));
  }

  // Usuario para de escribir en el chat de una partida.

  @SubscribeMessage('stop-typingGame')
  handleStopTypingGame(client: Socket, payload: { user: string, gameName: string }) {
    const usersInTyping = this.typingUsers.get(payload.gameName);
    
    if (usersInTyping) {
      usersInTyping.delete(payload.user);
      this.typingUsers.set(payload.gameName, usersInTyping);
      this.server.to(payload.gameName).emit('typingGame', Array.from(usersInTyping));
    }
  }

  // Método privado: Cargar mensajes cuando se entra al chat.

  private async loadMessages(client: Socket, gameName?: string) {
    let messages: Message[] = [];

    if (gameName) {
      messages = await this.messagesService.findAllMessagesGame(gameName);
    } else {
      messages = await this.messagesService.findAllMessages();
    }
    client.emit('messages', messages);
  }

  // Método privado: Actualizar los usuarios conectados.

  private updateConnectedUsers(gameName: string) {
    const userMap = this.connectedUsers.get(gameName);
    if (userMap) {
      const users = Array.from(userMap.values());
      this.server.to(gameName).emit('users-updated', users);
    }
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
