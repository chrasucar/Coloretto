import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Game, GameDocument } from './game.schema';
import { User, UserDocument } from '../users/user.schema';
import { faker } from '@faker-js/faker';
import { CreateGameDto } from './dto/create-game-dto';
import { GameGateway } from './game.gateway';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly gameGateway: GameGateway,
  ) {}

  // Crear partida.

  async createGame(createGameDto: CreateGameDto): Promise<Game> {

    const existingGame = await this.gameModel.findOne({ owner: createGameDto.owner }).exec();
    if (existingGame) {
      throw new BadRequestException('Ya se ha creado una partida.');
    }
  
    // Calcular el número de jugadores IA necesario
  
    const totalPlayers = createGameDto.maxPlayers;

     // El único jugador al inicio es el dueño.

    const currentPlayers = 1;
    
    const aiPlayersCount = createGameDto.isAiControlled
      ? Math.max(totalPlayers - currentPlayers, 0)
      : 0;
  
    // Generar jugadores IA si se requiere

    const aiPlayers = this.generateAiPlayers(aiPlayersCount);
  
    const newGame = new this.gameModel({
      gameName: createGameDto.gameName,
      maxPlayers: createGameDto.maxPlayers,
      isAiControlled: createGameDto.isAiControlled,
      owner: createGameDto.owner,
      players: [createGameDto.owner],
      aiPlayers: aiPlayers,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  
    const savedGame = await newGame.save();
    this.gameGateway.emitGameCreated(savedGame);
    return savedGame;
  }

  // Encontrar una partida por su nombre.

  async findGameByName(gameName: string): Promise<Game> {
    const game = await this.gameModel.findOne({ gameName }).exec();
    if (!game) {
      throw new NotFoundException('Partida no encontrada.');
    }
    return game;
  }

  // Encontrar partida por usuario que la creó.

  async findGameByUser(owner: string): Promise<Game | null> {
    const game = await this.gameModel.findOne({ owner }).exec();
    if (!game) {
      return null;
    }
    return game;
  }

  // Obtener lista de partidas (3 por página).
  
  async getAvailableGames(page: number = 1, pageSize: number = 3): Promise<{ games: Game[], total: number }> {

    if (page < 1) {
      page = 1;
    }
    if (pageSize < 1) {
      pageSize = 3;
    }
    
    const skip = (page - 1) * pageSize;
    const total = await this.gameModel.countDocuments({ isAvailable: true }).exec();
    const games = await this.gameModel.find({ isAvailable: true })
      .skip(skip)
      .limit(pageSize)
      .exec();
    
    return { games, total };
  }

  // Unirse a partida.

  async joinGame(gameName: string, username: string): Promise<Game | null> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) throw new NotFoundException('Usuario no encontrado.');
  
    const game = await this.gameModel.findOne({ gameName }).exec();
    if (!game || !game.isAvailable) throw new NotFoundException('Partida no disponible.');
  
    // Permitir al usuario unirse si es el creador de la partida

    if (game.owner === username) {

      // Permitir que el creador se una puesto que es el que ha creado la partida.

      if (!game.players.includes(username)) {
        game.players.push(username);
        await game.save();
        this.gameGateway.emitPlayerJoined(username);
      }
      return game;
    }

    // Volver el jugador a la partida si se va sin abandonar.

    const isInGame = game.players.includes(username);
    if (isInGame) {
      this.gameGateway.emitPlayerRejoined(username);
      return game;
    }

    // Elimina un jugador IA si hay
  
    if (game.players.length < game.maxPlayers) {
      if (game.aiPlayers.length > 0) game.aiPlayers.shift(); 
  
      game.players.push(username);
  
      await game.save();
      this.gameGateway.emitPlayerJoined(username);

      // Generar jugador IA reemplazando al real si se va, o viceversa.
  
      while (game.players.length + game.aiPlayers.length < game.maxPlayers) {
        const aiPlayer = this.generateAiPlayers(1)[0];
        game.aiPlayers.push(aiPlayer);
      }
  
      await game.save();
      return game;
    } else {
      throw new BadRequestException('La partida no permite más jugadores.');
    }
  }

  // Dejar partida

  async leaveGame(gameName: string, username: string): Promise<void> {
    const game = await this.gameModel.findOne({ gameName }).exec();
  
    if (!game) {
      throw new NotFoundException('Partida no encontrada.');
    }
  
    if (!game.isAvailable) {
      throw new NotFoundException('Partida no disponible.');
    }
  
    if (!game.players.includes(username)) {
      throw new BadRequestException('El jugador no está en la partida.');
    }
  
    // Eliminar al jugador de la lista de jugadores reales

    game.players = game.players.filter(player => player !== username);

    // Transferir la propiedad (dueño) al siguiente jugador si hay más de uno.

    if (game.players.length > 0) {
      if (game.owner === username) {
        game.owner = game.players[0]; 
      }
    } else {

      // Si no quedan jugadores reales, eliminar la partida

      await this.gameModel.deleteOne({ gameName }).exec();
      this.gameGateway.emitGameDeleted(game._id.toString());
      return;
    }
  
    if (game.players.length === 1) {

      // Si queda un jugador real, completar con IA hasta alcanzar maxPlayers

      while (game.players.length + game.aiPlayers.length < game.maxPlayers) {
        const aiPlayer = this.generateAiPlayers(1)[0];
        game.aiPlayers.push(aiPlayer);

      }
    } else if (game.isAiControlled) {

      // Si hay más de un jugador real, agregar IA si es necesario

      while (game.players.length + game.aiPlayers.length < game.maxPlayers) {
        const aiPlayer = this.generateAiPlayers(1)[0];
        game.aiPlayers.push(aiPlayer);
      }
    }

    game.isAvailable = true;

    this.gameGateway.emitPlayerLeft(username);
  
    await game.save();
  }
  
  // Método privado: Generar jugadores IA con nombres automáticos.

  private generateAiPlayers(count: number): { _id: Types.ObjectId, name: string }[] {
    const aiPlayers: { _id: Types.ObjectId, name: string }[] = [];
  
    for (let i = 0; i < count; i++) {
      const aiPlayerId = new Types.ObjectId();
      const aiPlayerName = faker.person.firstName();
      aiPlayers.push({ _id: aiPlayerId, name: aiPlayerName });
    }
  
    return aiPlayers;
  }
}
