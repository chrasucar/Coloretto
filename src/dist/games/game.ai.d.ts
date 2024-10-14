import { Types } from 'mongoose';
import { GameService } from './game.service';
export declare class AiService {
    private readonly gameModel;
    private readonly gameService;
    constructor(gameModel: any, gameService: GameService);
    generateAiPlayers(count: number): {
        _id: Types.ObjectId;
        name: string;
    }[];
    adjustAiDifficulty(level: 'Básico' | 'Experto'): void;
    makeAiMove(gameName: string): Promise<void>;
}
