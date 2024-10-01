import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type CardDocument = Card & Document;

@Schema()
export class Card {

  // Color de la carta o wild para comodín.

  @Prop({ required: true })
  color: string; 

  // Indica si es carta de final de ronda.

  @Prop({ required: false })
  isEndRound: boolean; 

}

export const CardSchema = SchemaFactory.createForClass(Card);

CardSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export type ColumnDocument = Column & Document;

@Schema()
export class Column {

  @Prop({ type: [CardSchema], default: [] })
  cards: Card[];

}

export const ColumnSchema = SchemaFactory.createForClass(Column);

ColumnSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});