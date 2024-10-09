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

  public async makeAiMove(gameName: string): Promise<void> {
    const game = await this.gameService.getCurrentGame(gameName);

    if (!game) {
      throw new Error('Juego no encontrado');
    }

    const totalHumanPlayers = game.players.length;
    
    if (game.currentPlayerIndex >= totalHumanPlayers) {
      const aiPlayerIndex = game.currentPlayerIndex - totalHumanPlayers;
      const aiPlayer = game.aiPlayers[aiPlayerIndex];

      if (!aiPlayer) {
        throw new Error('No se encontró el jugador IA');
      }

      const availableColumns = game.columns.filter(col => col.cards.length < 3);

      if (availableColumns.length > 0) {
        const randomColumnIndex = Math.floor(Math.random() * availableColumns.length);
        await this.gameService.revealCard(gameName, aiPlayer.name, randomColumnIndex);
      } else {
        const randomColumnIndex = Math.floor(Math.random() * game.columns.length);
        await this.gameService.takeColumn(gameName, aiPlayer.name, randomColumnIndex);
      }
    } else {
      throw new Error('No es el turno de un jugador IA');
    }
}
}