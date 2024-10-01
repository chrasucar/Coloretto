import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { Card, CardSchema, Column, ColumnSchema } from './card/card.schema';

export type GameDocument = Game & Document;

 // Definición del esquema de gestión de partidas con sus campos.

@Schema()
export class Game {

  @Prop({ required: true })
  owner: string;

  @Prop({ required: true, maxlength: 30 })
  gameName: string;

  @Prop({ required: true, min: 2, max: 5 })
  maxPlayers: number;

  @Prop({ default: true })
  isAvailable: boolean;

  @Prop({ type: [String], default: [] })
  players: string[];

  @Prop({ type: [{ _id: Types.ObjectId, name: String }], default: [] })
  aiPlayers: { _id: Types.ObjectId, name: string }[];

  @Prop({ default: false })
  isAiControlled: boolean;

  @Prop({ type: Date, default: () => new Date() })
  lastActivity: Date;

  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;

  @Prop({ type: Date, default: () => new Date() })
  updatedAt: Date;

  // Definición del esquema de juego con sus campos.

  @Prop({ type: Date, required: false })
  preparationTime: Date; 

  @Prop({ required: true, enum: ['Básico', 'Experto'] })
  difficultyLevel: 'Básico' | 'Experto';

  @Prop({ type: Boolean, default: false }) 
  isPrepared: boolean;

  @Prop({ type: Boolean, default: false }) 
  isFinished: boolean;

  @Prop({ type: [ColumnSchema], default: [] })
  columns: Column[];

  @Prop({ type: Map, of: [{ type: CardSchema }], default: {} })
  summaryCards: Map<string, Card[]>;

  @Prop({ type: Map, of: [{ type: CardSchema }], default: {} })
  wildCards: Map<string, Card[]>;

  @Prop({ type: [CardSchema], default: [] })
  deck: Card[];

  @Prop({ type: Map, of: { type: mongoose.Schema.Types.Mixed }, default: {} })
  playerCollections: Map<string, Card[]>;

  @Prop({ default: false })
  isRoundCardRevealed: boolean;
  
  @Prop({ default: 0 })
  currentPlayerIndex: number;

  @Prop({ default: 0 })
  currentRound: number;

  @Prop({ type: [String], default: [] })
  playersTakenColumn: string[];

  @Prop({ type: Map, of: Number, default: {} })
  finalScores: Record<string, number>;

  @Prop({ type: [String], default: [] })
  winner: string[];
  
}

export const GameSchema = SchemaFactory.createForClass(Game);

GameSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});