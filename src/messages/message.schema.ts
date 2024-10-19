import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/user.schema';
import { v4 as uuidv4 } from 'uuid';

export type MessageDocument = Message & Document;

@Schema()
export class Message {

  @Prop({ type: String })
  gameName: string;

  @Prop({ type: String, default: () => uuidv4(), unique: true })
  messageId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: User;

  @Prop()
  senderProfilePicture: string;

  @Prop({ required: true, type: String })
  text: string;

  @Prop({ type: Date, default: () => new Date() })
  sentAt: Date;

  @Prop({ type: Map, of: [String], default: {} })
  reactions: Map<string, string[]>;

  @Prop({ type: [String], default: [] })
  references: string[]; 
  
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});
