import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel('Message') private readonly messageModel: Model<Message>,
  ) {}

  // Crear mensaje.

  async createMessage(
    sender: string,
    text: string,
    references: string[] = [],
  ): Promise<Message> {
    const newMessage = new this.messageModel({ sender, text, references });
    return newMessage.save();
  }

  // Añadir reacción a un mensaje.

  async addReaction(
    messageId: string,
    emoji: string,
    user: string,
  ): Promise<MessageDocument> {

    const message = await this.messageModel.findOne({ messageId }).exec();
    if (!message) {
      throw new Error('Mensaje no encontrado.');
    }

    if (!message.reactions) {
      message.reactions = new Map();
    }

    if (!message.reactions.has(emoji)) {
      message.reactions.set(emoji, []);
    }

    const users = message.reactions.get(emoji);

    if (!users.includes(user)) {
      users.push(user);
      message.reactions.set(emoji, users);
    }

    return message.save();

  }

    // Obtener todos los mensajes ordenados por tiempo.

  async findAllMessages(): Promise<Message[]> {
    return this.messageModel.find().sort({ timestamp: 1 }).exec();
  }

  // Obtener mensaje por id.

  async findMessageById(messageId: string): Promise<Message> {
    return this.messageModel.findOne({ messageId }).exec();
  }

  // Obtener mensajes por usuario.

  async getMessagesForUser(username: string): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [{ sender: username }, { mentions: username }],
      })
      .exec();
    }

  // Eliminar reacción de un mensaje.

  async removeReaction(
    messageId: string,
    emoji: string,
    user: string,
  ): Promise<MessageDocument> {
    const message = await this.messageModel.findOne({ messageId }).exec();
    if (!message) {
      throw new Error('Mensaje no encontrado.');
    }

    if (message.reactions && message.reactions.has(emoji)) {
      const users = message.reactions.get(emoji);
      message.reactions.set(
        emoji,
        users.filter((u) => u !== user),
      );

      if (message.reactions.get(emoji).length === 0) {
        message.reactions.delete(emoji);
      }

      return message.save();
    }

    return null;
  }
}
