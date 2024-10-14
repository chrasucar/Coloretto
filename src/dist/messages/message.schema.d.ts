import { Document } from 'mongoose';
export type MessageDocument = Message & Document;
export declare class Message {
    gameName: string;
    messageId: string;
    sender: string;
    text: string;
    sentAt: Date;
    reactions: Map<string, string[]>;
    references: string[];
}
export declare const MessageSchema: import("mongoose").Schema<Message, import("mongoose").Model<Message, any, any, any, Document<unknown, any, Message> & Message & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Message, Document<unknown, {}, import("mongoose").FlatRecord<Message>> & import("mongoose").FlatRecord<Message> & {
    _id: import("mongoose").Types.ObjectId;
}>;
