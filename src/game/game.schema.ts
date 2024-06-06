import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Card, Column, Player } from './game.state';

export type GameDocument = Game & Document;

@Schema()
export class Game {
  @Prop({ required: true })
  numberOfPlayers: number;

  @Prop({ type: [{ type: String, ref: 'Player' }] })
  players: Player[]; // Puedes ajustar el tipo según tu definición de jugador

  @Prop({ type: Array })
  deck: Card[]; // Puedes ajustar el tipo según tu definición de carta

  @Prop({ type: Array })
  discardedCards: Card[]; // Puedes ajustar el tipo según tu definición de carta

  @Prop({ type: Object })
  activeColumn: Column;

  @Prop({ required: true })
  gameStarted: boolean;

  @Prop({ type: [String] })
  moves: string[];
}

export const GameSchema = SchemaFactory.createForClass(Game);
