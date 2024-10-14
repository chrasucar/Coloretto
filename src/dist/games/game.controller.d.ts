import { GameService } from './game.service';
import { Game, GameDocument } from './game.schema';
import { CreateGameDto } from './dto/create-game-dto';
export declare class GameController {
    private readonly gameService;
    constructor(gameService: GameService);
    getAvailableGames(page: number, pageSize: number): Promise<{
        games: Game[];
        total: number;
    }>;
    getGameByName(gameName: string): Promise<Game>;
    getUserGame(owner: string): Promise<Game | null>;
    joinGame(body: {
        gameName: string;
        username: string;
    }): Promise<Game>;
    createGame(createGameDto: CreateGameDto): Promise<Game>;
    leaveGame(gameName: string, username: string): Promise<{
        message: string;
    }>;
    getPreparationTimeRemaining(gameName: string): Promise<{
        timeRemaining: number;
    }>;
    prepareGame(gameName: string, level: string): Promise<Game>;
    selectDifficultyAndPrepareGame(gameName: string, level: 'Básico' | 'Experto'): Promise<Game>;
    revealCard(gameName: string, playerName: string, columnIndex: number): Promise<GameDocument>;
    nextTurn(gameName: string): Promise<void>;
    takeColumn(gameName: string, playerName: string, columnIndex: number): Promise<GameDocument>;
    finalizeScores(gameName: string): Promise<GameDocument>;
}
