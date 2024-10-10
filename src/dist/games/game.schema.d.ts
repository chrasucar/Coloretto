import mongoose, { Document, Types } from 'mongoose';
import { Card, Column } from './card/card.schema';
export type GameDocument = Game & Document;
export declare class Game {
    owner: string;
    gameName: string;
    maxPlayers: number;
    isAvailable: boolean;
    players: string[];
    aiPlayers: {
        _id: Types.ObjectId;
        name: string;
    }[];
    isAiControlled: boolean;
    lastActivity: Date;
    createdAt: Date;
    updatedAt: Date;
    preparationTime: Date;
    difficultyLevel: 'Básico' | 'Experto';
    isPrepared: boolean;
    isFinished: boolean;
    columns: Column[];
    summaryCards: Map<string, Card[]>;
    wildCards: Map<string, Card[]>;
    deck: Card[];
    playerCollections: Map<string, Card[]>;
    isRoundCardRevealed: boolean;
    currentPlayerIndex: number;
    currentRound: number;
    playersTakenColumn: string[];
    finalScores: Record<string, number>;
    winner: string[];
}
export declare const GameSchema: mongoose.Schema<Game, mongoose.Model<Game, any, any, any, mongoose.Document<unknown, any, Game> & Game & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Game, mongoose.Document<unknown, {}, mongoose.FlatRecord<Game>> & mongoose.FlatRecord<Game> & {
    _id: Types.ObjectId;
}>;
