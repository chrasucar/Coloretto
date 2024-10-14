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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
const create_game_dto_1 = require("./dto/create-game-dto");
let GameController = class GameController {
    constructor(gameService) {
        this.gameService = gameService;
    }
    async getAvailableGames(page, pageSize) {
        return this.gameService.getAvailableGames(page, pageSize);
    }
    async getGameByName(gameName) {
        return this.gameService.findGameByName(gameName);
    }
    async getUserGame(owner) {
        const game = await this.gameService.findGameByUser(owner);
        if (!game) {
            return null;
        }
        return game;
    }
    async joinGame(body) {
        try {
            const { gameName, username } = body;
            const game = await this.gameService.joinGame(gameName, username);
            return game;
        }
        catch (error) {
            throw error;
        }
    }
    async createGame(createGameDto) {
        if (createGameDto.isAiControlled) {
            if (createGameDto.aiPlayersCount < 2 ||
                createGameDto.aiPlayersCount > 5) {
                throw new common_1.BadRequestException('El número de jugadores IA tiene que ser entre 2 y 5.');
            }
        }
        const gameData = {
            ...createGameDto,
            players: [createGameDto.owner],
        };
        const newGame = await this.gameService.createGame(gameData);
        return newGame;
    }
    async leaveGame(gameName, username) {
        const game = await this.gameService.findGameByName(gameName);
        if (!game) {
            throw new common_1.NotFoundException('Partida no encontrada.');
        }
        if (!game.players.includes(username)) {
            throw new common_1.BadRequestException('El jugador no está en la partida.');
        }
        await this.gameService.leaveGame(gameName, username);
        return { message: 'El jugador ha abandonado la partida.' };
    }
    async getPreparationTimeRemaining(gameName) {
        try {
            const timeRemainingMillis = await this.gameService.getPreparationTimeRemaining(gameName);
            return { timeRemaining: timeRemainingMillis };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException('Juego no encontrado.');
            }
            return null;
        }
    }
    async prepareGame(gameName, level) {
        try {
            if (level !== 'Básico' && level !== 'Experto') {
                throw new common_1.BadRequestException('Nivel de dificultad inválido.');
            }
            const game = await this.gameService.prepareGame(gameName, level);
            return game;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException('Juego no encontrado.');
            }
            return null;
        }
    }
    async selectDifficultyAndPrepareGame(gameName, level) {
        try {
            const game = await this.gameService.selectDifficultyAndPrepareGame(gameName, level);
            return game;
        }
        catch (error) {
            return null;
        }
    }
    async revealCard(gameName, playerName, columnIndex) {
        try {
            return await this.gameService.revealCard(gameName, playerName, columnIndex);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException(error.message);
            }
            else if (error instanceof common_1.BadRequestException) {
                throw new common_1.BadRequestException(error.message);
            }
        }
    }
    async nextTurn(gameName) {
        await this.gameService.nextTurn(gameName);
    }
    async takeColumn(gameName, playerName, columnIndex) {
        try {
            return await this.gameService.takeColumn(gameName, playerName, columnIndex);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException(error.message);
            }
            else if (error instanceof common_1.BadRequestException) {
                throw new common_1.BadRequestException(error.message);
            }
        }
    }
    async finalizeScores(gameName) {
        try {
            return await this.gameService.finalizeAndCalculateScores(gameName);
        }
        catch (error) {
            return null;
        }
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('pageSize', new common_1.DefaultValuePipe(3), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getAvailableGames", null);
__decorate([
    (0, common_1.Get)(':gameName'),
    __param(0, (0, common_1.Param)('gameName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getGameByName", null);
__decorate([
    (0, common_1.Get)('owner/:owner'),
    __param(0, (0, common_1.Param)('owner')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getUserGame", null);
__decorate([
    (0, common_1.Post)('join'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "joinGame", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_game_dto_1.CreateGameDto]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "createGame", null);
__decorate([
    (0, common_1.Delete)('leave/:gameName/:username'),
    __param(0, (0, common_1.Param)('gameName')),
    __param(1, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "leaveGame", null);
__decorate([
    (0, common_1.Get)(':gameName/preparation-time'),
    __param(0, (0, common_1.Param)('gameName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getPreparationTimeRemaining", null);
__decorate([
    (0, common_1.Post)(':gameName/prepare'),
    __param(0, (0, common_1.Param)('gameName')),
    __param(1, (0, common_1.Body)('level')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "prepareGame", null);
__decorate([
    (0, common_1.Post)(':gameName/select-difficulty'),
    __param(0, (0, common_1.Param)('gameName')),
    __param(1, (0, common_1.Body)('level')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "selectDifficultyAndPrepareGame", null);
__decorate([
    (0, common_1.Post)(':gameName/reveal-card'),
    __param(0, (0, common_1.Param)('gameName')),
    __param(1, (0, common_1.Body)('playerName')),
    __param(2, (0, common_1.Body)('columnIndex')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "revealCard", null);
__decorate([
    (0, common_1.Post)(':gameName/next-turn'),
    __param(0, (0, common_1.Param)('gameName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "nextTurn", null);
__decorate([
    (0, common_1.Post)(':gameName/take-column'),
    __param(0, (0, common_1.Param)('gameName')),
    __param(1, (0, common_1.Body)('playerName')),
    __param(2, (0, common_1.Body)('columnIndex')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "takeColumn", null);
__decorate([
    (0, common_1.Post)(':gameName/finalize-scores'),
    __param(0, (0, common_1.Param)('gameName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "finalizeScores", null);
exports.GameController = GameController = __decorate([
    (0, common_1.Controller)('games'),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
//# sourceMappingURL=game.controller.js.map