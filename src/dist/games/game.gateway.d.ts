import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameDocument } from './game.schema';
import { Card } from './card/card.schema';
export declare class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    afterInit(server: Server): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitGameCreated(game: any): void;
    emitPlayerJoined(username: string): void;
    emitPlayerLeft(username: string): void;
    emitGameDeleted(gameId: string): void;
    emitGamePrepared(game: any): void;
    emitCardsAssigned(game: any): void;
    emitNextTurn(game: GameDocument): void;
    emitCardRevealed(game: GameDocument, revealedCard: Card): void;
    emitColumnTaken(game: GameDocument, columnIndex: number, playerName: string): void;
    emitRoundEnd(game: GameDocument): void;
    emitGameFinalization(gameName: string, finalScores: Record<string, number>, winners: string[]): void;
}
