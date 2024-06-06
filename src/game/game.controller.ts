import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { GameService } from './game.service';
import { GameState } from './game.state';
import { PlayerSelectionDto } from './dto/game.dto';

@Controller('users/game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // Obtener el estado de juego de un usuario.

  @Get('/state/:userId')
  async getGameState(@Param('userId') userId: string): Promise<GameState> {
    return this.gameService.getGameState(userId);
  }

  // Seleccionar número de jugadores.

  @Post('select-number-players')
  async selectPlayers(@Body() playerSelectionDto: PlayerSelectionDto) {
    return this.gameService.selectNumberOfPlayers(
      playerSelectionDto.numberOfPlayers,
    );
  }
}
