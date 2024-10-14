"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let GameGateway = class GameGateway {
    afterInit(server) { }
    handleConnection(client) { }
    handleDisconnect(client) { }
    emitGameCreated(game) {
        this.server.emit('gameCreated', game);
    }
    emitPlayerJoined(username) {
        this.server.emit('playerJoined', { username });
    }
    emitPlayerLeft(username) {
        this.server.emit('playerLeft', { username });
    }
    emitGameDeleted(gameId) {
        this.server.emit('gameDeleted', gameId);
    }
    emitGamePrepared(game) {
        this.server.emit('gamePrepared', game);
    }
    emitCardsAssigned(game) {
        this.server.emit('cardsAssigned', game);
    }
    emitNextTurn(game) {
        this.server.emit('nextTurn', { gameName: game.gameName, message: 'Cambio de turno' });
    }
    emitCardRevealed(game, revealedCard) {
        this.server.emit('cardRevealed', { game, revealedCard });
    }
    emitColumnTaken(game, columnIndex, playerName) {
        this.server.emit('columnTaken', { game, columnIndex, playerName });
    }
    emitRoundEnd(game) {
        this.server.emit('roundEnd', { gameName: game.gameName, message: 'Es la última ronda.' });
    }
    emitGameFinalization(gameName, finalScores, winners) {
        this.server.emit('gameFinalized', { gameName, finalScores, winners });
    }
};
exports.GameGateway = GameGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
exports.GameGateway = GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    })
], GameGateway);
//# sourceMappingURL=game.gateway.js.map