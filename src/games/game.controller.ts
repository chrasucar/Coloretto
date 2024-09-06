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
  HttpCode,
} from '@nestjs/common';
import { GameService } from './game.service';
import { Game } from './game.schema';
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
  async getGameByName(@Param('gameName') gameName: string): Promise<Game> {
    return this.gameService.findGameByName(gameName);
  }

  // Obtener si un usuario es dueño de una partida.

  @Get('owner/:owner')
  async getUserGame(@Param('owner') owner: string): Promise<Game | null> {
    console.log('Comprobando si el usuario tiene una partida creada:', owner);
    const game = await this.gameService.findGameByUser(owner);
    console.log('Partida encontrada:', game); 
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

  @Post('leave')
  @HttpCode(200)
  async leaveGame(@Body() body: { gameName: string; username: string }) {
    const { gameName, username } = body;
    const game = await this.gameService.findGameByName(gameName);

    console.log('Partida encontrada:', game);

    if (!game) {
      throw new NotFoundException('Partida no encontrada.');
    }

    if (!game.players.includes(username)) {
      throw new BadRequestException('El jugador no está en la partida.');
    }

    await this.gameService.leaveGame(gameName, username);

    return { message: 'El jugador ha abandonado la partida.' };
  }
}
