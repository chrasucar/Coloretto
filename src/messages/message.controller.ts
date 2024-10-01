import { Controller, Get, Query } from '@nestjs/common';
import { MessagesService } from './message.service';
import { Message } from './message.schema';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Obtener todos los mensajes.

  @Get('/general')
  async findAll() {
    return this.messagesService.findAllMessages();
  }

  // Obtener todos los mensajes de una partida.

  @Get('/game')
  async findAllGame(@Query('gameName') gameName: string): Promise<Message[]> {
    return this.messagesService.findAllMessagesGame(gameName);
  }
}
