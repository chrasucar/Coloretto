import { Types } from 'mongoose';
import { faker } from '@faker-js/faker';
import { GameService } from './game.service';

export class AiService {
  constructor(private readonly gameModel: any,
              private readonly gameService: GameService
  ) {}

  public generateAiPlayers(count: number): { _id: Types.ObjectId, name: string }[] {
    const aiPlayers: { _id: Types.ObjectId, name: string }[] = [];
  
    for (let i = 0; i < count; i++) {
      const aiPlayerId = new Types.ObjectId();
      const aiPlayerName = faker.person.firstName();
      aiPlayers.push({ _id: aiPlayerId, name: aiPlayerName });
    }
  
    return aiPlayers;
  }

  public adjustAiDifficulty(level: 'Básico' | 'Experto'): void {
    if (level === 'Experto') {
      console.log("Dificultad a experto. Prueba en IA de dificultad");
    }
}
}