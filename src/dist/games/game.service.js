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
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const game_schema_1 = require("./game.schema");
const user_schema_1 = require("../users/user.schema");
const game_gateway_1 = require("./game.gateway");
const card_schema_1 = require("./card/card.schema");
const users_service_1 = require("../users/users.service");
const game_ai_1 = require("./game.ai");
let GameService = class GameService {
    constructor(gameModel, userModel, cardModel, columnModel, gameGateway, usersService, aiService) {
        this.gameModel = gameModel;
        this.userModel = userModel;
        this.cardModel = cardModel;
        this.columnModel = columnModel;
        this.gameGateway = gameGateway;
        this.usersService = usersService;
        this.aiService = aiService;
    }
    async createGame(createGameDto) {
        const existingGame = await this.gameModel.findOne({ owner: createGameDto.owner }).exec();
        const ownerExists = await this.userModel.findOne({ username: createGameDto.owner }).exec();
        if (!ownerExists) {
            throw new Error('El dueño especificado no existe.');
        }
        if (existingGame) {
            throw new common_1.BadRequestException('Ya se ha creado una partida.');
        }
        const totalPlayers = createGameDto.maxPlayers;
        const currentPlayers = 1;
        const aiPlayersCount = createGameDto.isAiControlled
            ? Math.max(totalPlayers - currentPlayers, 0)
            : 0;
        const aiPlayers = this.aiService.generateAiPlayers(aiPlayersCount);
        const newGame = new this.gameModel({
            gameName: createGameDto.gameName,
            maxPlayers: createGameDto.maxPlayers,
            isAiControlled: createGameDto.isAiControlled,
            owner: createGameDto.owner,
            players: [createGameDto.owner],
            difficultyLevel: createGameDto.difficultyLevel,
            aiPlayers: aiPlayers,
            createdAt: new Date(),
            updatedAt: new Date(),
            preparationTime: new Date(Date.now() + 10000)
        });
        const savedGame = await newGame.save();
        this.scheduleGamePreparation(savedGame);
        this.gameGateway.emitGameCreated(savedGame);
        return savedGame;
    }
    async findGameByName(gameName) {
        const game = await this.gameModel.findOne({ gameName }).exec();
        if (!game) {
            throw new common_1.NotFoundException('Partida no encontrada.');
        }
        return game;
    }
    async findGameByUser(owner) {
        const game = await this.gameModel.findOne({ owner }).exec();
        if (!game) {
            return null;
        }
        return game;
    }
    async getAvailableGames(page = 1, pageSize = 3) {
        if (page < 1) {
            page = 1;
        }
        if (pageSize < 1) {
            pageSize = 3;
        }
        const skip = (page - 1) * pageSize;
        const total = await this.gameModel.countDocuments({ isAvailable: true }).exec();
        const games = await this.gameModel.find({ isAvailable: true })
            .skip(skip)
            .limit(pageSize)
            .exec();
        return { games, total };
    }
    async getPreparationTimeRemaining(gameName) {
        const game = await this.gameModel.findOne({ gameName }).exec();
        if (!game) {
            throw new common_1.NotFoundException('Juego no encontrado.');
        }
        const preparationTime = game.preparationTime.getTime();
        const currentTime = Date.now();
        const timeRemaining = Math.max(preparationTime - currentTime, 0);
        return timeRemaining;
    }
    async joinGame(gameName, username) {
        const user = await this.userModel.findOne({ username }).exec();
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado.');
        const game = await this.gameModel.findOne({ gameName }).exec();
        if (!game || !game.isAvailable)
            throw new common_1.NotFoundException('Partida no disponible.');
        if (game.owner === username) {
            if (!game.players.includes(username)) {
                game.players.push(username);
                await game.save();
                this.gameGateway.emitPlayerJoined(username);
            }
            return game;
        }
        if (!game.isAiControlled) {
            if (!game.players.includes(username)) {
                game.players.push(username);
                const assignedSummaryCards = this.assignSummaryCards(game);
                game.summaryCards = assignedSummaryCards;
                await game.save();
                this.gameGateway.emitPlayerJoined(username);
                return game;
            }
        }
        if (game.players.length < game.maxPlayers && game.aiPlayers.length > 0) {
            const aiPlayer = game.aiPlayers.shift();
            if (aiPlayer) {
                const aiUsername = aiPlayer.name;
                const aiCollection = game.playerCollections.get(aiUsername) || [];
                const aiCollectionWildCards = game.wildCards.get(aiUsername) || [];
                let allColumnCards = [];
                const columnCards = aiCollection.filter(card => card.color.startsWith('brown_column') ||
                    card.color.startsWith('green_column'));
                allColumnCards = allColumnCards.concat(columnCards);
                allColumnCards.forEach(card => {
                    let column;
                    if (card.color.startsWith('green_column')) {
                        const originalIndex = parseInt(card.color.split('_')[2]);
                        if (originalIndex < game.columns.length && game.columns[originalIndex].cards.length < 3) {
                            column = game.columns[originalIndex];
                        }
                        else {
                            column = game.columns.find(col => col.cards.length === 0);
                            if (!column) {
                                column = game.columns.find(col => col.cards.length < 3);
                            }
                        }
                    }
                    else {
                        column = game.columns.find(col => !col.cards.some(c => c.color.startsWith('brown_column')) && col.cards.length < 3);
                    }
                    if (column && column.cards.length < 3) {
                        column.cards.push(card);
                    }
                    else {
                        const indexToRemove = allColumnCards.indexOf(card);
                        if (indexToRemove !== -1) {
                            allColumnCards.splice(indexToRemove, 1);
                        }
                    }
                });
                aiCollection.forEach(card => {
                    if (!card.color.startsWith('brown_column') && !card.color.startsWith('green_column')) {
                        game.deck.push(this.shuffleArray([card])[0]);
                    }
                });
                aiCollectionWildCards.forEach(card => {
                    game.deck.push(this.shuffleArray([card])[0]);
                });
                game.playerCollections.delete(aiUsername);
                game.summaryCards.delete(aiUsername);
                game.wildCards.delete(aiUsername);
                game.playersTakenColumn = game.playersTakenColumn.filter(player => player !== aiUsername);
            }
            game.players.push(username);
            const assignedSummaryCards = this.assignSummaryCards(game);
            game.summaryCards = assignedSummaryCards;
            await game.save();
            this.gameGateway.emitPlayerJoined(username);
            return game;
        }
    }
    async leaveGame(gameName, username) {
        const game = await this.gameModel.findOne({ gameName }).exec();
        if (!game) {
            throw new common_1.NotFoundException('Partida no encontrada.');
        }
        if (!game.isAvailable) {
            throw new common_1.NotFoundException('Partida no disponible.');
        }
        if (!game.players.includes(username)) {
            throw new common_1.BadRequestException('El jugador no está en la partida.');
        }
        game.players = game.players.filter(player => player !== username);
        game.playersTakenColumn = game.playersTakenColumn.filter(player => player !== username);
        if (game.players.length > 0) {
            if (game.owner === username) {
                game.owner = game.players[0];
            }
        }
        game.lastActivity = new Date();
        game.summaryCards.delete(username);
        const playerCollection = game.playerCollections.get(username);
        if (playerCollection) {
            const userCollection = game.playerCollections.get(username) || [];
            const userCollectionWildCards = game.wildCards.get(username) || [];
            let allColumnCards = [];
            const columnCards = userCollection.filter(card => card.color.startsWith('brown_column') ||
                card.color.startsWith('green_column'));
            allColumnCards = allColumnCards.concat(columnCards);
            allColumnCards.forEach(card => {
                let column;
                if (card.color.startsWith('green_column')) {
                    const originalIndex = parseInt(card.color.split('_')[2]);
                    if (originalIndex < game.columns.length && game.columns[originalIndex].cards.length < 3) {
                        column = game.columns[originalIndex];
                    }
                    else {
                        column = game.columns.find(col => col.cards.length === 0);
                        if (!column) {
                            column = game.columns.find(col => col.cards.length < 3);
                        }
                    }
                }
                else {
                    column = game.columns.find(col => !col.cards.some(c => c.color.startsWith('brown_column')) && col.cards.length < 3);
                }
                if (column && column.cards.length < 3) {
                    column.cards.push(card);
                }
                else {
                    const indexToRemove = allColumnCards.indexOf(card);
                    if (indexToRemove !== -1) {
                        allColumnCards.splice(indexToRemove, 1);
                    }
                }
            });
            userCollection.forEach(card => {
                if (!card.color.startsWith('brown_column') && !card.color.startsWith('green_column')) {
                    game.deck.push(this.shuffleArray([card])[0]);
                }
            });
            userCollectionWildCards.forEach(card => {
                game.deck.push(this.shuffleArray([card])[0]);
            });
            game.playerCollections.delete(username);
            game.wildCards.delete(username);
        }
        await game.save();
        setTimeout(async () => {
            const updatedGame = await this.gameModel.findOne({ gameName }).exec();
            if (updatedGame && updatedGame.players.length === 0) {
                const now = new Date().getTime();
                const lastActivityDate = new Date(updatedGame.lastActivity).getTime();
                const inactivityPeriod = 10 * 1000;
                if (now - lastActivityDate > inactivityPeriod) {
                    try {
                        await this.gameModel.deleteOne({ gameName }).exec();
                        this.gameGateway.emitGameDeleted(gameName);
                    }
                    catch (error) {
                        console.error('Error eliminando la partida', error);
                    }
                }
            }
        }, 10 * 1000);
        if (game.players.length === 1) {
            if (game.isAiControlled) {
                while (game.players.length + game.aiPlayers.length < game.maxPlayers) {
                    const aiPlayer = this.aiService.generateAiPlayers(1)[0];
                    game.aiPlayers.push(aiPlayer);
                    const assignedSummaryCards = this.assignSummaryCards(game);
                    game.summaryCards = assignedSummaryCards;
                    await game.save();
                }
            }
        }
        game.isAvailable = true;
        this.gameGateway.emitPlayerLeft(username);
        await game.save();
    }
    async prepareGame(gameName, level) {
        const game = await this.gameModel.findOne({ gameName }).exec();
        if (!game) {
            return null;
        }
        if (game.difficultyLevel !== level) {
            throw new common_1.BadRequestException(`No puedes cambiar el nivel del juego. El nivel actual es ${game.difficultyLevel}.`);
        }
        const deck = await this.createDeck(game.maxPlayers);
        if (game.maxPlayers === 2) {
            const colorsToRemove = this.getUniqueChameleonColors(2);
            game.deck = deck.filter(card => !colorsToRemove.includes(card.color));
        }
        else if (game.maxPlayers === 3) {
            const colorToRemove = this.getUniqueChameleonColor();
            if (colorToRemove) {
                game.deck = deck.filter(card => card.color !== colorToRemove);
            }
        }
        else {
            game.deck = deck;
        }
        const [columnsCards, remainingDeck] = this.setupColumnsAndDeck(game.deck, game.maxPlayers);
        game.columns = columnsCards;
        const shuffledDeck = this.shuffleArray(remainingDeck);
        const endRoundCardIndex = shuffledDeck.findIndex(card => card.isEndRound);
        if (endRoundCardIndex !== -1) {
            const endRoundCard = shuffledDeck.splice(endRoundCardIndex, 1)[0];
            shuffledDeck.splice(5, 0, endRoundCard);
        }
        game.deck = shuffledDeck;
        const playerCollections = await this.assignHelpCardsAndChameleons([...game.players, ...game.aiPlayers.map(ai => ai.name)], gameName);
        game.playerCollections = playerCollections;
        game.summaryCards = this.assignSummaryCards(game);
        const playerNames = [...game.players, ...game.aiPlayers.map(ai => ai.name)];
        game.currentPlayerIndex = this.chooseStartingPlayer(playerNames);
        game.isRoundCardRevealed = false;
        game.isPrepared = true;
        await game.save();
        this.gameGateway.emitGamePrepared(game);
        this.gameGateway.emitCardsAssigned(game);
        return game;
    }
    assignSummaryCards(game) {
        const summaryCards = game.difficultyLevel === 'Básico'
            ? [{ color: 'summary_brown', isEndRound: false }]
            : [{ color: 'summary_violet', isEndRound: false }];
        const shuffledSummaryCards = this.shuffleArray(summaryCards);
        const playerNames = [...game.players, ...game.aiPlayers.map(ai => ai.name)];
        this.adjustAiDifficulty(game.difficultyLevel);
        const assignedSummaryCards = new Map();
        playerNames.forEach((player, index) => {
            assignedSummaryCards.set(player, [shuffledSummaryCards[index % shuffledSummaryCards.length]]);
        });
        return assignedSummaryCards;
    }
    async revealCard(gameName, playerName, columnIndex) {
        const game = await this.getCurrentGame(gameName);
        if (!game) {
            throw new common_1.NotFoundException('Juego no encontrado.');
        }
        const totalPlayers = game.players.length + game.aiPlayers.length;
        if (game.currentPlayerIndex < 0 || game.currentPlayerIndex >= totalPlayers) {
            throw new common_1.BadRequestException('Índice de jugador actual inválido.');
        }
        const allPlayers = [...game.players, ...game.aiPlayers.map(ai => ai.name)];
        const currentPlayer = allPlayers[game.currentPlayerIndex];
        if (currentPlayer !== playerName) {
            throw new common_1.BadRequestException('No es tu turno.');
        }
        if (game.deck.length === 0) {
            throw new common_1.BadRequestException('El mazo está vacío.');
        }
        if (columnIndex < 0 || columnIndex >= game.columns.length) {
            throw new common_1.BadRequestException('Índice de columna inválido.');
        }
        if (game.isRoundCardRevealed) {
            throw new common_1.BadRequestException('No se pueden revelar más cartas, la ronda ha terminado.');
        }
        const revealedCard = game.deck.shift();
        if (!revealedCard) {
            throw new common_1.BadRequestException('No se pudo revelar la carta.');
        }
        const selectedColumn = game.columns[columnIndex];
        if (selectedColumn.cards.length === 0 && revealedCard.color !== "endRound") {
            throw new common_1.BadRequestException(`La columna ${columnIndex} está vacía y no se puede revelar una carta aquí.`);
        }
        if (game.isFinished) {
            throw new common_1.BadRequestException('La partida ha finalizado.');
        }
        if (revealedCard.isEndRound) {
            game.isRoundCardRevealed = true;
            game.currentRound++;
            await this.nextTurn(gameName);
            this.gameGateway.emitRoundEnd(game);
            await game.save();
            return game;
        }
        else {
            const wildCards = [];
            const normalCards = [];
            if (revealedCard.color === 'wild' || revealedCard.color === 'golden_wild') {
                let columnFound = false;
                if (game.columns[columnIndex].cards.length < 3) {
                    game.columns[columnIndex].cards.push(revealedCard);
                    columnFound = true;
                }
                if (!columnFound) {
                    for (let i = 0; i < game.columns.length; i++) {
                        if (game.columns[i].cards.length < 3 && game.columns[i].cards.length !== 0) {
                            game.columns[i].cards.push(revealedCard);
                            columnFound = true;
                            break;
                        }
                    }
                }
                if (!columnFound) {
                    wildCards.push(revealedCard);
                }
                if (revealedCard.color === 'golden_wild' && game.deck.length > 0) {
                    const nextCard = game.deck.shift();
                    if (nextCard && nextCard.isEndRound) {
                        game.isRoundCardRevealed = true;
                        game.currentRound++;
                        game.currentPlayerIndex = (game.currentPlayerIndex + 1) % (game.players.length + game.aiPlayers.length);
                        await this.nextTurn(gameName);
                        this.gameGateway.emitRoundEnd(game);
                        await game.save();
                        return game;
                    }
                    else if (nextCard) {
                        if (nextCard.color === 'wild') {
                            let columnFound = false;
                            if (game.columns[columnIndex].cards.length < 3) {
                                game.columns[columnIndex].cards.push(nextCard);
                                columnFound = true;
                            }
                            if (!columnFound) {
                                for (let i = 0; i < game.columns.length; i++) {
                                    if (game.columns[i].cards.length < 3 && game.columns[i].cards.length !== 0) {
                                        game.columns[i].cards.push(nextCard);
                                        columnFound = true;
                                        break;
                                    }
                                }
                            }
                            if (!columnFound) {
                                wildCards.push(nextCard);
                            }
                        }
                        else {
                            const playerCollectionsObj = game.playerCollections instanceof Map ? Object.fromEntries(game.playerCollections)
                                : game.playerCollections;
                            const playerCards = playerCollectionsObj[playerName] || [];
                            playerCards.push(nextCard);
                            playerCollectionsObj[playerName] = playerCards;
                            game.playerCollections = new Map(Object.entries(playerCollectionsObj));
                        }
                    }
                }
            }
            else {
                if (game.columns[columnIndex].cards.length >= 3) {
                    throw new common_1.BadRequestException('La columna está llena.');
                }
                game.columns[columnIndex].cards.push(revealedCard);
            }
            const updatedPlayerCollections = game.playerCollections;
            const currentPlayerCards = updatedPlayerCollections.get(playerName) || [];
            updatedPlayerCollections.set(playerName, [
                ...currentPlayerCards,
                ...normalCards
            ]);
            updatedPlayerCollections.get(playerName)?.sort((cardA, cardB) => {
                return cardA.color.localeCompare(cardB.color);
            });
            if (!game.wildCards[playerName]) {
                game.wildCards[playerName] = [];
            }
            const playerWildCards = game.wildCards.get(playerName) || [];
            playerWildCards.push(...wildCards);
            game.wildCards.set(playerName, playerWildCards);
        }
        await game.save();
        this.gameGateway.emitCardRevealed(game, revealedCard);
        await this.nextTurn(gameName);
        return game;
    }
    async takeColumn(gameName, playerName, columnIndex) {
        const game = await this.getCurrentGame(gameName);
        if (!game) {
            throw new common_1.NotFoundException('Juego no encontrado.');
        }
        const allPlayers = [...game.players, ...game.aiPlayers.map(ai => ai.name)];
        const currentPlayer = allPlayers[game.currentPlayerIndex];
        if (currentPlayer !== playerName) {
            throw new common_1.BadRequestException('No es tu turno.');
        }
        const selectedColumn = game.columns[columnIndex];
        if (selectedColumn.cards.length === 0) {
            throw new common_1.BadRequestException('La columna seleccionada está vacía.');
        }
        if (game.playersTakenColumn.includes(playerName)) {
            throw new common_1.BadRequestException('Ya has tomado una columna en esta ronda.');
        }
        if (game.isFinished) {
            throw new common_1.BadRequestException('La partida ha finalizado, no se pueden tomar más columnas.');
        }
        const cardsToTake = [...selectedColumn.cards];
        const wildCards = [];
        const normalCards = [];
        cardsToTake.forEach(card => {
            if (card.color === 'wild' || card.color === 'golden_wild') {
                wildCards.push(card);
            }
            else if (card.color === "endRound") {
                game.isRoundCardRevealed = true;
                return;
            }
            else {
                normalCards.push(card);
            }
        });
        if (!game.playerCollections.has(playerName)) {
            game.playerCollections.set(playerName, []);
        }
        const updatedPlayerCollections = game.playerCollections;
        updatedPlayerCollections.set(playerName, [
            ...(updatedPlayerCollections.get(playerName) || []),
            ...normalCards
        ]);
        updatedPlayerCollections.get(playerName)?.sort((cardA, cardB) => {
            return cardA.color.localeCompare(cardB.color);
        });
        if (!game.wildCards[playerName]) {
            game.wildCards[playerName] = [];
        }
        const playerWildCards = game.wildCards.get(playerName) || [];
        playerWildCards.push(...wildCards);
        game.wildCards.set(playerName, playerWildCards);
        selectedColumn.cards = [];
        game.playersTakenColumn.push(playerName);
        const allPlayersInGame = [...game.players, ...game.aiPlayers].length;
        if (game.isRoundCardRevealed && game.playersTakenColumn.length === allPlayersInGame) {
            if (normalCards.length > 0) {
                updatedPlayerCollections.set(currentPlayer, [
                    ...(updatedPlayerCollections.get(currentPlayer) || []),
                    ...normalCards
                ]);
            }
            game.columns.forEach(column => {
                column.cards = [];
            });
            await game.save();
            this.finalizeAndCalculateScores(gameName);
        }
        else {
            const allPlayersInGame = [...game.players, ...game.aiPlayers].length;
            if (game.playersTakenColumn.length === allPlayersInGame) {
                game.currentRound++;
                game.playersTakenColumn = [];
                const isFirstRound = game.currentRound === 1;
                if (allPlayersInGame === 2 && isFirstRound) {
                    const remainingColumnIndex = game.columns.findIndex(column => column.cards.length > 0);
                    if (remainingColumnIndex !== -1) {
                        game.columns.splice(remainingColumnIndex, 1);
                    }
                }
                let allColumnCards = [];
                game.playerCollections.forEach((cards, playerName) => {
                    const columnCards = cards.filter(card => card.color.startsWith('brown_column') ||
                        card.color.startsWith('green_column'));
                    allColumnCards = allColumnCards.concat(columnCards);
                });
                game.columns.forEach(column => {
                    column.cards = [];
                });
                game.playerCollections.forEach((cards, playerName) => {
                    game.playerCollections.set(playerName, cards.filter(card => !card.color.startsWith('brown_column') &&
                        !card.color.startsWith('green_column')));
                });
                allColumnCards.forEach((card, index) => {
                    const columnIndex = index % game.columns.length;
                    game.columns[columnIndex].cards.push(card);
                });
            }
            else {
                let nextPlayerIndex = (game.currentPlayerIndex + 1) % allPlayers.length;
                while (game.playersTakenColumn.includes(allPlayers[nextPlayerIndex])) {
                    nextPlayerIndex = (nextPlayerIndex + 1) % allPlayers.length;
                    if (nextPlayerIndex === game.currentPlayerIndex) {
                        break;
                    }
                }
                game.currentPlayerIndex = nextPlayerIndex;
            }
            await game.save();
            this.gameGateway.emitColumnTaken(game, columnIndex, playerName);
            return game;
        }
    }
    adjustAiDifficulty(level) {
        this.aiService.adjustAiDifficulty(level);
    }
    async selectDifficultyAndPrepareGame(gameName, level) {
        const game = await this.gameModel.findOne({ gameName }).exec();
        if (!game) {
            throw new common_1.NotFoundException('Juego no encontrado.');
        }
        game.difficultyLevel = level;
        await game.save();
        this.scheduleGamePreparation(game);
        return game;
    }
    async createDeck(numberOfPlayers) {
        const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'brown'];
        const deck = [];
        for (const color of colors) {
            for (let i = 0; i < 9; i++) {
                deck.push({
                    color,
                    isEndRound: false,
                });
            }
        }
        for (let i = 0; i < 10; i++) {
            deck.push({
                color: 'cotton',
                isEndRound: false,
            });
        }
        for (let i = 0; i < 2; i++) {
            deck.push({
                color: 'wild',
                isEndRound: false,
            });
        }
        for (let i = 0; i < 1; i++) {
            deck.push({
                color: 'golden_wild',
                isEndRound: false,
            });
        }
        deck.push({
            color: 'endRound',
            isEndRound: true,
        });
        if (numberOfPlayers > 2) {
            for (let i = 0; i < 5; i++) {
                deck.push({
                    color: 'brown_column',
                    isEndRound: false,
                });
            }
        }
        else if (numberOfPlayers === 2) {
            deck.push({
                color: 'green_column_0',
                isEndRound: false,
            });
            deck.push({
                color: 'green_column_1',
                isEndRound: false,
            });
            deck.push({
                color: 'green_column_2',
                isEndRound: false,
            });
        }
        return deck;
    }
    setupColumnsAndDeck(deck, numberOfPlayers) {
        const shuffledDeck = this.shuffleArray(deck);
        let endRoundCard = null;
        const remainingDeck = shuffledDeck.filter(card => {
            if (card.isEndRound) {
                endRoundCard = card;
                return false;
            }
            return true;
        });
        const columnCards = remainingDeck.filter(card => card.color.startsWith('green_column') || card.color.startsWith('brown_column'));
        let columns = [];
        if (numberOfPlayers === 2) {
            const greenColumn1 = columnCards.find(card => card.color === 'green_column_0');
            const greenColumn2 = columnCards.find(card => card.color === 'green_column_1');
            const greenColumn3 = columnCards.find(card => card.color === 'green_column_2');
            columns = [
                { cards: greenColumn1 ? [greenColumn1] : [] },
                { cards: greenColumn2 ? [greenColumn2] : [] },
                { cards: greenColumn3 ? [greenColumn3] : [] },
            ];
        }
        else if (numberOfPlayers > 2) {
            const selectedColumnCards = columnCards.slice(0, numberOfPlayers);
            columns = selectedColumnCards.map(card => ({
                cards: [card]
            }));
        }
        const deckWithoutColumns = remainingDeck.filter(card => !card.color.startsWith('green_column') &&
            !card.color.startsWith('brown_column'));
        const first16Cards = deckWithoutColumns.splice(0, 16);
        const finalDeck = [...first16Cards, ...deckWithoutColumns];
        if (endRoundCard) {
            finalDeck.splice(3, 0, endRoundCard);
        }
        return [columns, finalDeck];
    }
    async assignHelpCardsAndChameleons(players, gameName) {
        const playerCollections = new Map();
        const chameleonColors = this.getUniqueChameleonColors(players.length * 2);
        let colorIndex = 0;
        for (const player of players) {
            const chameleonCards = [];
            const cardsToAssign = players.length === 2 ? 2 : 1;
            for (let i = 0; i < cardsToAssign; i++) {
                if (colorIndex < chameleonColors.length) {
                    chameleonCards.push({
                        color: chameleonColors[colorIndex++],
                        isEndRound: false,
                    });
                }
            }
            playerCollections.set(player, chameleonCards);
        }
        const game = await this.gameModel.findOne({ gameName }).exec();
        if (game) {
            game.playerCollections = playerCollections;
            await game.save();
        }
        return playerCollections;
    }
    getUniqueChameleonColor() {
        const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'brown'];
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    }
    getUniqueChameleonColors(count) {
        const allColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'brown'];
        count = Math.min(count, allColors.length);
        const shuffledColors = [...allColors];
        for (let i = shuffledColors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledColors[i], shuffledColors[j]] = [shuffledColors[j], shuffledColors[i]];
        }
        return shuffledColors.slice(0, count);
    }
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    chooseStartingPlayer(players) {
        return Math.floor(Math.random() * players.length);
    }
    async getCurrentGame(gameName) {
        const game = await this.gameModel.findOne({ gameName }).exec();
        if (!game) {
            throw new common_1.NotFoundException('La partida no existe.');
        }
        return game;
    }
    async nextTurn(gameName) {
        const game = await this.getCurrentGame(gameName);
        if (!game) {
            throw new common_1.NotFoundException('Juego no encontrado.');
        }
        if (game.players.length === 0 && game.aiPlayers.length === 0) {
            throw new common_1.BadRequestException('No hay jugadores en el juego.');
        }
        const totalPlayers = game.players.length + game.aiPlayers.length;
        const allPlayers = [...game.players, ...game.aiPlayers.map(ai => ai.name)];
        let nextPlayerIndex = (game.currentPlayerIndex + 1) % totalPlayers;
        while (game.playersTakenColumn.includes(allPlayers[nextPlayerIndex])) {
            nextPlayerIndex = (nextPlayerIndex + 1) % totalPlayers;
        }
        game.currentPlayerIndex = nextPlayerIndex;
        await game.save();
        this.gameGateway.emitNextTurn(game);
    }
    async scheduleGamePreparation(game) {
        const preparationTime = game.preparationTime;
        const now = Date.now();
        let delay = Math.max(preparationTime.getTime() - now, 0);
        const prepareGameAndUpdate = async () => {
            if (!game.isPrepared) {
                await this.prepareGame(game.gameName, game.difficultyLevel);
            }
            game.preparationTime = new Date();
            await game.save();
        };
        setTimeout(async () => {
            await prepareGameAndUpdate();
        }, delay);
        const updateRemainingTime = async () => {
            const currentTime = Date.now();
            const timeRemaining = Math.max(preparationTime.getTime() - currentTime, 0);
            if (timeRemaining > 0) {
                await this.updatePreparationTime(game, new Date(currentTime + timeRemaining));
                setTimeout(updateRemainingTime, 1000);
            }
        };
        updateRemainingTime();
    }
    async updatePreparationTime(game, newPreparationTime) {
        game.preparationTime = newPreparationTime;
        await game.save();
    }
    async finalizeAndCalculateScores(gameName) {
        const game = await this.getCurrentGame(gameName);
        if (!game) {
            throw new common_1.NotFoundException('Juego no encontrado.');
        }
        if (!game.isRoundCardRevealed) {
            throw new common_1.BadRequestException('La carta de fin de ronda no ha sido revelada.');
        }
        const scores = {};
        const allPlayers = [...game.players, ...game.aiPlayers.map(ai => ai.name)];
        const playerCollectionsObj = game.playerCollections instanceof Map
            ? Object.fromEntries(game.playerCollections)
            : game.playerCollections;
        for (const playerName of allPlayers) {
            const playerCards = playerCollectionsObj[playerName] || [];
            const wildCards = game.wildCards.get(playerName) || [];
            const summaryCards = game.summaryCards.get(playerName) || [];
            const cardCountByColor = {};
            playerCards.forEach((card) => {
                if (card.color !== 'green_column_0' && card.color !== 'green_column_1' &&
                    card.color !== 'green_column_2' && card.color !== 'brown_column') {
                    cardCountByColor[card.color] = (cardCountByColor[card.color] || 0) + 1;
                }
            });
            const maxColor = Object.entries(cardCountByColor)
                .filter(([color]) => color !== 'cotton')
                .sort(([, a], [, b]) => b - a)
                .shift();
            const availableColors = Object.keys(cardCountByColor).filter(color => color !== 'cotton');
            for (let i = wildCards.length - 1; i >= 0; i--) {
                const wildCard = wildCards[i];
                const availableColorsWithoutCotton = availableColors.filter(color => color !== 'cotton');
                const assignedColor = maxColor ? maxColor[0] : availableColorsWithoutCotton[Math.floor(Math.random() * availableColorsWithoutCotton.length)];
                if (wildCard.color === 'wild' || wildCard.color === 'golden_wild') {
                    wildCard.color = assignedColor;
                    playerCards.push(wildCard);
                    cardCountByColor[assignedColor] = (cardCountByColor[assignedColor] || 0) + 1;
                    wildCards.splice(i, 1);
                }
            }
            const positiveColors = this.selectPositiveColors(cardCountByColor).filter(color => color !== 'cotton');
            let totalScore = 0;
            const summaryCardType = summaryCards[0].color;
            for (const color in cardCountByColor) {
                const count = cardCountByColor[color];
                if (color !== 'cotton') {
                    const isPositive = positiveColors.includes(color);
                    let score = this.calculateScore(count, isPositive, { color: summaryCardType });
                    totalScore += score;
                }
            }
            const bonusPoints = playerCards.filter((card) => card.color === 'cotton').length * 2;
            totalScore += bonusPoints;
            scores[playerName] = totalScore;
            if (Array.isArray(playerCards) && playerCards.every(card => card.color)) {
                playerCollectionsObj[playerName] = playerCards.sort((a, b) => a.color.localeCompare(b.color));
            }
            else {
                return null;
            }
        }
        ;
        game.finalScores = scores;
        const maxScore = Math.max(...Object.values(scores));
        game.winner = Object.keys(scores).filter((playerName) => scores[playerName] === maxScore);
        game.playerCollections = new Map(Object.entries(playerCollectionsObj));
        for (const playerName of allPlayers) {
            const user = await this.userModel.findOne({ username: playerName }).exec();
            if (!user) {
                continue;
            }
            user.gamesPlayed += 1;
            if (game.winner.includes(playerName)) {
                user.gamesWon += 1;
            }
            else {
                user.gamesLost += 1;
            }
            await user.save();
        }
        game.isFinished = true;
        await game.save();
        this.gameGateway.emitGameFinalization(gameName, scores, game.winner);
        return game;
    }
    selectPositiveColors(cardCountByColor) {
        return Object.entries(cardCountByColor)
            .filter(([color]) => color !== 'cotton')
            .sort(([colorA, countA], [colorB, countB]) => {
            if (countB !== countA) {
                return countB - countA;
            }
            return colorA.localeCompare(colorB);
        })
            .slice(0, 3)
            .map(([color]) => color);
    }
    calculateScore(count, isPositive, summaryCard) {
        const scoringTables = {
            'summary_brown': [0, 1, 3, 6, 10, 15, 21],
            'summary_violet': [0, 1, 4, 8, 7, 6, 5]
        };
        let score = 0;
        if (summaryCard) {
            const table = scoringTables[summaryCard.color];
            if (table) {
                score = table[Math.min(count, table.length - 1)];
            }
        }
        return isPositive ? score : -score;
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(game_schema_1.Game.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(card_schema_1.Card.name)),
    __param(3, (0, mongoose_1.InjectModel)(card_schema_1.Column.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        game_gateway_1.GameGateway,
        users_service_1.UsersService,
        game_ai_1.AiService])
], GameService);
//# sourceMappingURL=game.service.js.map