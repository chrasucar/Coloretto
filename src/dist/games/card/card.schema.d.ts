import mongoose, { Document, Types } from 'mongoose';
export type CardDocument = Card & Document;
export declare class Card {
    color: string;
    isEndRound: boolean;
}
export declare const CardSchema: mongoose.Schema<Card, mongoose.Model<Card, any, any, any, mongoose.Document<unknown, any, Card> & Card & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Card, mongoose.Document<unknown, {}, mongoose.FlatRecord<Card>> & mongoose.FlatRecord<Card> & {
    _id: Types.ObjectId;
}>;
export type ColumnDocument = Column & Document;
export declare class Column {
    cards: Card[];
}
export declare const ColumnSchema: mongoose.Schema<Column, mongoose.Model<Column, any, any, any, mongoose.Document<unknown, any, Column> & Column & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, Column, mongoose.Document<unknown, {}, mongoose.FlatRecord<Column>> & mongoose.FlatRecord<Column> & {
    _id: Types.ObjectId;
}>;
