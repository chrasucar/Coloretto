import { MessagesService } from './message.service';
import { Message } from './message.schema';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    findAll(): Promise<Message[]>;
    findAllGame(gameName: string): Promise<Message[]>;
}
