import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GameDocument = Game & Document;

// Definición del esquema de juego con sus campos.

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
  createdAt: Date;

  @Prop({ type: Date, default: () => new Date() })
  updatedAt: Date;
  
}

export const GameSchema = SchemaFactory.createForClass(Game);

GameSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});