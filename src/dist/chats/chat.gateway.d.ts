import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Message } from 'src/messages/message.schema';
import { MessagesService } from '../messages/message.service';
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private messagesService;
    server: Server;
    private connectedUsers;
    private typingUsers;
    constructor(messagesService: MessagesService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleMessage(message: {
        sender: string;
        text: string;
        gameName?: string;
    }): Promise<Message>;
    handleReaction(reaction: {
        messageId: string;
        emoji: string;
        user: string;
        gameName?: string;
    }): Promise<import("src/messages/message.schema").MessageDocument>;
    handleRemoveReaction(client: Socket, payload: {
        messageId: string;
        emoji: string;
        user: string;
    }): Promise<any>;
    handleTyping(client: Socket, payload: {
        user: string;
    }): void;
    handleStopTyping(client: Socket, payload: {
        user: string;
    }): void;
    handleTypingGame(client: Socket, payload: {
        user: string;
        gameName: string;
    }): void;
    handleStopTypingGame(client: Socket, payload: {
        user: string;
        gameName: string;
    }): void;
    private loadMessages;
    private updateConnectedUsers;
    private extractReferences;
}
