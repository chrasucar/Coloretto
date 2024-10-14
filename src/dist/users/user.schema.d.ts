import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    _id?: string;
    fullname: string;
    username: string;
    email: string;
    password: string;
    profilePicture: string;
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
    lastSeen: Date;
    isOnline: boolean;
    connectionStartTime: Date;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & Required<{
    _id: string;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & Required<{
    _id: string;
}>>;
