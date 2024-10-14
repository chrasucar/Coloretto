"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const mongoose_1 = require("mongoose");
const faker_1 = require("@faker-js/faker");
class AiService {
    constructor(gameModel, gameService) {
        this.gameModel = gameModel;
        this.gameService = gameService;
    }
    generateAiPlayers(count) {
        const aiPlayers = [];
        for (let i = 0; i < count; i++) {
            const aiPlayerId = new mongoose_1.Types.ObjectId();
            const aiPlayerName = faker_1.faker.person.firstName();
            aiPlayers.push({ _id: aiPlayerId, name: aiPlayerName });
        }
        return aiPlayers;
    }
    adjustAiDifficulty(level) {
        if (level === 'Experto') {
            console.log("Dificultad a experto. Prueba en IA de dificultad");
        }
    }
    async makeAiMove(gameName) {
        const game = await this.gameService.getCurrentGame(gameName);
        if (!game) {
            throw new Error('Juego no encontrado');
        }
        const totalHumanPlayers = game.players.length;
        if (game.currentPlayerIndex >= totalHumanPlayers) {
            const aiPlayerIndex = game.currentPlayerIndex - totalHumanPlayers;
            const aiPlayer = game.aiPlayers[aiPlayerIndex];
            if (!aiPlayer) {
                throw new Error('No se encontró el jugador IA');
            }
            const availableColumns = game.columns.filter(col => col.cards.length < 3);
            if (availableColumns.length > 0) {
                const randomColumnIndex = Math.floor(Math.random() * availableColumns.length);
                await this.gameService.revealCard(gameName, aiPlayer.name, randomColumnIndex);
            }
            else {
                const randomColumnIndex = Math.floor(Math.random() * game.columns.length);
                await this.gameService.takeColumn(gameName, aiPlayer.name, randomColumnIndex);
            }
        }
        else {
            throw new Error('No es el turno de un jugador IA');
        }
    }
}
exports.AiService = AiService;
//# sourceMappingURL=game.ai.js.map