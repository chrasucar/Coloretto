import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  BadRequestException,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  NotFoundException,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GameService } from './game.service';
import { Game, GameDocument } from './game.schema';
import { CreateGameDto } from './dto/create-game-dto';

@Controller('games')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  // Obtener las partidas disponibles.

  @Get()
  async getAvailableGames(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(3), ParseIntPipe) pageSize: number,
  ): Promise<{ games: Game[]; total: number }> {
    return this.gameService.getAvailableGames(page, pageSize);
  }

  // Obtener el nombre del juego.

  @Get(':gameName')
  async getGameByName(@Param('gameName') gameName: string): Promise<Game | { message: string }> {

    const game = this.gameService.findGameByName(gameName);

    if (!game) {

      return { message: `Juego con nombre '${gameName}' no encontrado.` };

    }

    return game;
    
  }

  // Obtener si un usuario es dueño de una partida.

  @Get('owner/:owner')
  async getUserGame(@Param('owner') owner: string): Promise<Game | null> {
    const game = await this.gameService.findGameByUser(owner);
    if (!game) {
      return null;
    }
    return game;
  }

  // Unirse a una partida.

  @Post('join')
  async joinGame(@Body() body: { gameName: string; username: string }) {
    try {
      const { gameName, username } = body;
      const game = await this.gameService.joinGame(gameName, username);
      return game;
    } catch (error) {
      throw error;
    }
  }

  // Crear una partida.

  @Post('create')
  async createGame(@Body() createGameDto: CreateGameDto) {
    if (createGameDto.isAiControlled) {
      if (
        createGameDto.aiPlayersCount < 2 ||
        createGameDto.aiPlayersCount > 5
      ) {
        throw new BadRequestException(
          'El número de jugadores IA tiene que ser entre 2 y 5.',
        );
      }
    }

    const gameData = {
      ...createGameDto,
      players: [createGameDto.owner],
    };

    const newGame = await this.gameService.createGame(gameData);

    return newGame;
  }

  // Abandonar una partida.

  @Delete('leave/:gameName/:username')
  async leaveGame(@Param('gameName') gameName: string, @Param('username') username: string) {
  const game = await this.gameService.findGameByName(gameName);

  if (!game) {
    throw new NotFoundException('Partida no encontrada.');
  }

  if (!game.players.includes(username)) {
    throw new BadRequestException('El jugador no está en la partida.');
  }

  await this.gameService.leaveGame(gameName, username);

  return { message: 'El jugador ha abandonado la partida.' };
}


  // ------------------------------------------ Juego ------------------------------

  // Tiempo restante para preparar la partida automáticamente.

  @Get(':gameName/preparation-time')
  async getPreparationTimeRemaining(@Param('gameName') gameName: string): Promise<{ timeRemaining: number }> {
  try {
    const timeRemainingMillis = await this.gameService.getPreparationTimeRemaining(gameName);
    return { timeRemaining: timeRemainingMillis };
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw new NotFoundException('Juego no encontrado.');
    }
    return null;
  }
}

  // Preparar partida.

  @Post(':gameName/prepare')
  async prepareGame(@Param('gameName') gameName: string, @Body('level') level: string): Promise<Game> {
    try {
      if (level !== 'Básico' && level !== 'Experto') {
        throw new BadRequestException('Nivel de dificultad inválido.');
      }
      const game = await this.gameService.prepareGame(gameName, level);
      return game;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('Juego no encontrado.');
      }
      return null;
    }
  }

  // Seleccionar dificultad.

  @Post(':gameName/select-difficulty')
  async selectDifficultyAndPrepareGame(
    @Param('gameName') gameName: string,
    @Body('level') level: 'Básico' | 'Experto'
  ): Promise<Game> {
    try {
      const game = await this.gameService.selectDifficultyAndPrepareGame(gameName, level);
      return game;
    } catch (error) {
      return null;
    }
  }

  // Revelar carta.

  @Post(':gameName/reveal-card')
  async revealCard(@Param('gameName') gameName: string, @Body('playerName') playerName: string, 
  @Body('columnIndex') columnIndex: number): Promise<GameDocument> {
    try {
      return await this.gameService.revealCard(gameName, playerName, columnIndex);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      }
    }
  }

  // Siguiente turno.
  
  @Post(':gameName/next-turn')
  async nextTurn(@Param('gameName') gameName: string): Promise<void> {
    await this.gameService.nextTurn(gameName);
  }

  // Tomar una columna.

  @Post(':gameName/take-column')
  async takeColumn(@Param('gameName') gameName: string, @Body('playerName') playerName: string, @Body('columnIndex') columnIndex: number
  ): Promise<GameDocument> {
    try {
       return await this.gameService.takeColumn(gameName, playerName, columnIndex);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw new NotFoundException(error.message);
        } else if (error instanceof BadRequestException) {
          throw new BadRequestException(error.message);
        }
      }
    }

  // Finalizar y calcular puntuaciones, determinando el ganador o ganadores.

  @Post(':gameName/finalize-scores')
  async finalizeScores(@Param('gameName') gameName: string): Promise<GameDocument> {
    try {
      return await this.gameService.finalizeAndCalculateScores(gameName);
    } catch (error) {
      return null;
    }
  }
}
