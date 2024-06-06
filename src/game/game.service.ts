import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameState } from './game.state';
import { Socket } from 'socket.io';
import { Game, GameDocument } from './game.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class GameService {
  games: { [key: string]: GameState } = {};

  constructor(
    @Inject(forwardRef(() => GameGateway))
    private readonly gameGateway: GameGateway,
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
  ) {}

  // Obtener id del estado del juego.

  async getGameState(userId: string): Promise<GameState | undefined> {
    const gameId = userId;
    return this.games[gameId];
  }

  // Seleccionar número de jugadores.

  async selectNumberOfPlayers(numberOfPlayers: number): Promise<GameState> {
    const newGame = new this.gameModel({
      numberOfPlayers,
      players: [], // Inicialmente no hay jugadores
      deck: [], // Inicialmente el mazo está vacío
      discardedCards: [], // Inicialmente no hay cartas descartadas
      activeColumn: { cards: [], selected: false }, // Inicialmente no hay columna activa
      gameStarted: false, // La partida no ha comenzado todavía
      moves: [], // Lista de movimientos vacía
    });
    const result = await newGame.save();
    return result.toObject() as GameState; 
  }

  // Unirse a una partida.

  async joinGame(client: Socket, gameId: string) {
    if (!gameId) {
      console.error('El id de juego es nulo o indefinido.');
      return;
    }

    if (!this.games[gameId]) {
      this.games[gameId] = this.initializeGameState(gameId);
    }

    const gameState = this.games[gameId];

    const existingPlayer = gameState.players.find(player => player.name === `Player ${client.id}`);

    if (!existingPlayer) {

      gameState.players.push({ name: `Player ${client.id}`, moves: [], hand: [], score: 0 });

    }

    client.join(gameId); 

    this.gameGateway.emitGameState(gameId, gameState);

  }

  // Jugador realiza un movimiento.

  async makeMove(client: Socket, gameId: string, move: string) {
    const gameState = await this.getGameState(gameId);

    if (gameState && gameState.players) {
      gameState.moves.push(move);
      this.recordMove(gameState, client.id, move);
      this.updateGameState(gameId);

    } 
    
    else {

      console.error('Los jugadores o el estado del juego son indefinidos.', gameId);

    }
  }

  // Función privada: Lanzar movimientos.

  private recordMove(gameState: GameState, playerId: string, move: string) {
    if (gameState && gameState.players) {
      const player = gameState.players.find(player => player.name === playerId);
      if (player) {
        player.moves.push(move);
      }

      // Modo de ejemplo, se añadirán más.

      if (move.toLowerCase() === 'arriba') {
        gameState.currentPlayer = playerId;
      }
    } else {
      console.error('Los jugadores o el estado del juego son indefinidos.');
    }
  }

  // Actualizar estado del juego.

  async updateGameState(gameId: string) {
    const gameState = this.games[gameId];
    if (gameState) {
      this.gameGateway.emitGameState(gameId, gameState);
    } else {
      console.error('gameState is undefined for game', gameId);
    }
  }

  // Datos al iniciar la partida.

  private initializeGameState(gameId: string): GameState {
    return {
      gameId: gameId,
      currentPlayer: '',
      players: [],
      deck: [],
      discardedCards: [],
      activeColumn: { cards: [], selected: false },
      gameStarted: false,
      moves: []
    };
  }
}