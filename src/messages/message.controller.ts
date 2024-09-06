import { Controller, Get } from '@nestjs/common';
import { MessagesService } from './message.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  // Obtener todos los mensajes.

  @Get()
  async findAll() {
    return this.messagesService.findAllMessages();
  }
}
