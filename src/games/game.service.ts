import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Game, GameDocument } from './game.schema';
import { User, UserDocument } from '../users/user.schema';
import { CreateGameDto } from './dto/create-game-dto';
import { GameGateway } from './game.gateway';
import { Card, CardDocument, Column, ColumnDocument } from './card/card.schema';
import { UsersService } from 'src/users/users.service';
import { AiService } from './game.ai';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(Game.name) private readonly gameModel: Model<GameDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Card.name) private readonly cardModel: Model<CardDocument>,
    @InjectModel(Column.name) private readonly columnModel: Model<ColumnDocument>,
    private readonly gameGateway: GameGateway,
    private readonly usersService: UsersService,
    private readonly aiService: AiService,
  ) {}

  // Crear partida.

  async createGame(createGameDto: CreateGameDto): Promise<Game> {

    const existingGame = await this.gameModel.findOne({ owner: createGameDto.owner }).exec();

    const ownerExists = await this.userModel.findOne({ username: createGameDto.owner }).exec();

     if (!ownerExists) {

      throw new Error('El dueño especificado no existe.');

     }

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

    const aiPlayers = this.aiService.generateAiPlayers(aiPlayersCount);
  
    const newGame = new this.gameModel({
      gameName: createGameDto.gameName,
      maxPlayers: createGameDto.maxPlayers,
      isAiControlled: createGameDto.isAiControlled,
      owner: createGameDto.owner,
      players: [createGameDto.owner],
      difficultyLevel: createGameDto.difficultyLevel,
      aiPlayers: aiPlayers,
      createdAt: new Date(),
      updatedAt: new Date(),
      preparationTime: new Date(Date.now() + 10000) 
    });
  
    const savedGame = await newGame.save();
    this.scheduleGamePreparation(savedGame);
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

  // Obtener tiempo restante para preparar partida automáticamente.

  async getPreparationTimeRemaining(gameName: string): Promise<number> {
    const game = await this.gameModel.findOne({ gameName }).exec();
    if (!game) {
      throw new NotFoundException('Juego no encontrado.');
    }
  
    const preparationTime = game.preparationTime.getTime();
    const currentTime = Date.now();
    const timeRemaining = Math.max(preparationTime - currentTime, 0);
  
    return timeRemaining;
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

    if(!game.isAiControlled) {
    if (!game.players.includes(username)) {
      game.players.push(username);
      const assignedSummaryCards = this.assignSummaryCards(game);
      game.summaryCards = assignedSummaryCards;
      await game.save();
      this.gameGateway.emitPlayerJoined(username);
      return game;
    }
  }

    // Elimina un jugador IA si hay
  
    if (game.players.length < game.maxPlayers && game.aiPlayers.length > 0) {
      const aiPlayer = game.aiPlayers.shift();
      if (aiPlayer) {
          const aiUsername = aiPlayer.name;
          const aiCollection = game.playerCollections.get(aiUsername) || [];
          const aiCollectionWildCards = game.wildCards.get(aiUsername) || [];
          let allColumnCards: Card[] = [];

          const columnCards = aiCollection.filter(card => 
              card.color.startsWith('brown_column') || 
              card.color.startsWith('green_column')

          );

          allColumnCards = allColumnCards.concat(columnCards);
  
          allColumnCards.forEach(card => {

              let column: Column;

              if (card.color.startsWith('green_column')) {

                const originalIndex = parseInt(card.color.split('_')[2]);
                
                if (originalIndex < game.columns.length && game.columns[originalIndex].cards.length < 3) {

                    column = game.columns[originalIndex];

                } else {
                    
                    column = game.columns.find(col => col.cards.length === 0);
                    
                    if (!column) {

                        column = game.columns.find(col => col.cards.length < 3);
                    }
                }

            } else {

                column = game.columns.find(col => !col.cards.some(c => c.color.startsWith('brown_column')) && col.cards.length < 3);

            }
  
              if (column && column.cards.length < 3) {

                      column.cards.push(card);

                  } else {

                    const indexToRemove = allColumnCards.indexOf(card);

                    if (indexToRemove !== -1) {

                        allColumnCards.splice(indexToRemove, 1);

                  }
                }
          });
  
      aiCollection.forEach(card => {
          if (!card.color.startsWith('brown_column') && !card.color.startsWith('green_column')) {
              game.deck.push(this.shuffleArray([card])[0]);
          }
      });
      
      aiCollectionWildCards.forEach(card => {
            game.deck.push(this.shuffleArray([card])[0]);
    });

        game.playerCollections.delete(aiUsername);
        game.summaryCards.delete(aiUsername);
        game.wildCards.delete(aiUsername);
        game.playersTakenColumn = game.playersTakenColumn.filter(player => player !== aiUsername);
      }
  
    game.players.push(username);
    const assignedSummaryCards = this.assignSummaryCards(game);
    game.summaryCards = assignedSummaryCards;
    await game.save();
    this.gameGateway.emitPlayerJoined(username);
  
    return game;
    }
  }

  // Dejar partida.

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
  
    // Eliminar al jugador de la lista de jugadores reales.

    game.players = game.players.filter(player => player !== username);

    // Eliminar al jugador de playersTakenColumn si está presente.

    game.playersTakenColumn = game.playersTakenColumn.filter(player => player !== username);

    // Transferir la propiedad (dueño) al siguiente jugador si hay más de uno.

    if (game.players.length > 0) {
      if (game.owner === username) {
        game.owner = game.players[0]; 
      }
    }

    // Actualizar la última actividad a la fecha y hora actual.

    game.lastActivity = new Date();

    game.summaryCards.delete(username);

    const playerCollection = game.playerCollections.get(username);

    if (playerCollection) {

          const userCollection = game.playerCollections.get(username) || [];
          const userCollectionWildCards = game.wildCards.get(username) || [];
          let allColumnCards: Card[] = [];
  
          // Recolectar cartas de columna eliminada.

          const columnCards = userCollection.filter(card => 
              card.color.startsWith('brown_column') || 
              card.color.startsWith('green_column')

          );

          allColumnCards = allColumnCards.concat(columnCards);
  
          // Reasignar las cartas de columna a las columnas disponibles.

          allColumnCards.forEach(card => {
              let column: Column;
              if (card.color.startsWith('green_column')) {
                const originalIndex = parseInt(card.color.split('_')[2]); 
                
                // Verificar si la columna original sigue disponible.

                if (originalIndex < game.columns.length && game.columns[originalIndex].cards.length < 3) {
                    // Si la columna original sigue disponible, reasignar la carta allí.

                    column = game.columns[originalIndex];

                } else {

                    // Buscar primero una columna vacía.

                    column = game.columns.find(col => col.cards.length === 0);
                    
                    // Si no hay columnas vacías, buscar la primera columna disponible con espacio.

                    if (!column) {
                        column = game.columns.find(col => col.cards.length < 3);
                    }
                }
            } else {

                // Para brown_column, buscar una columna que no tenga cartas brown_column y tenga espacio.

                column = game.columns.find(col => !col.cards.some(c => c.color.startsWith('brown_column')) && col.cards.length < 3);
            }
  
              if (column && column.cards.length < 3) {

                      column.cards.push(card);

                  } else {

                    const indexToRemove = allColumnCards.indexOf(card);

                    if (indexToRemove !== -1) {

                        allColumnCards.splice(indexToRemove, 1);
                  }
                }
          });
  
      // Devolver cartas restantes al mazo.

      userCollection.forEach(card => {
          if (!card.color.startsWith('brown_column') && !card.color.startsWith('green_column')) {
              game.deck.push(this.shuffleArray([card])[0]);
          }
      });

      userCollectionWildCards.forEach(card => {
            game.deck.push(this.shuffleArray([card])[0]);
    });

        game.playerCollections.delete(username);
        game.wildCards.delete(username);
      }

  await game.save();

  // Si no quedan jugadores reales, eliminar la partida después de 10 segundos.

  setTimeout(async () => {

    const updatedGame = await this.gameModel.findOne({ gameName }).exec();
    
    if (updatedGame && updatedGame.players.length === 0) {

      // Recalcular el tiempo de inactividad.

      const now = new Date().getTime();
      const lastActivityDate = new Date(updatedGame.lastActivity).getTime();
      const inactivityPeriod = 10 * 1000;

      if (now - lastActivityDate > inactivityPeriod) {

        try {

          // Elimina el juego si ha estado inactivo por más de 10 segundos y no hay jugadores.

          await this.gameModel.deleteOne({ gameName }).exec();

          this.gameGateway.emitGameDeleted(gameName);

        } catch (error) {
          console.error('Error eliminando la partida', error);
        }
      }
    }
  }, 10 * 1000);
  
    if (game.players.length === 1) {

      // Si queda un jugador real, completar con IA hasta alcanzar maxPlayers.

     if (game.isAiControlled) {

      while (game.players.length + game.aiPlayers.length < game.maxPlayers) {
        const aiPlayer = this.aiService.generateAiPlayers(1)[0];
        game.aiPlayers.push(aiPlayer);
        const assignedSummaryCards = this.assignSummaryCards(game);
        game.summaryCards = assignedSummaryCards;
        await game.save();
      }
    }
  }

    game.isAvailable = true;

    this.gameGateway.emitPlayerLeft(username);
  
    await game.save();
  }

  // ----------------------------------------- Juego --------------------------------------

  // Paso 1: Preparación de la partida.

  async prepareGame(gameName: string, level: string): Promise<GameDocument> {

    const game = await this.gameModel.findOne({ gameName }).exec();

    if (!game) {

      return null;

    }

    if (game.difficultyLevel !== level) {

      throw new BadRequestException(
        `No puedes cambiar el nivel del juego. El nivel actual es ${game.difficultyLevel}.`
      );
    }
  
    // Generar mazo.

    const deck = await this.createDeck(game.maxPlayers);

    // Verificación y eliminación de colores según el número de jugadores.

    if (game.maxPlayers === 2) {
      const colorsToRemove = this.getUniqueChameleonColors(2);
      game.deck = deck.filter(card => !colorsToRemove.includes(card.color));
    } 
    
    else if (game.maxPlayers === 3) {
      const colorToRemove = this.getUniqueChameleonColor();
      if (colorToRemove) {
          game.deck = deck.filter(card => card.color !== colorToRemove);
      }
    } else {
      game.deck = deck;
  }
  
    // Repartir cartas a jugadores (reales + IA) y guarda el mazo restante.

    const [columnsCards, remainingDeck] = this.setupColumnsAndDeck(game.deck, game.maxPlayers);
  
    // Columnas en el centro del juego.

    game.columns = columnsCards;
  
    // Barajar el mazo restante.

    const shuffledDeck = this.shuffleArray(remainingDeck);

    // Escoger la carta fin de ronda y colocarla en la posición 16 después de barajar.

    const endRoundCardIndex = shuffledDeck.findIndex(card => card.isEndRound);

    if (endRoundCardIndex !== -1) {

      const endRoundCard = shuffledDeck.splice(endRoundCardIndex, 1)[0];
      shuffledDeck.splice(5, 0, endRoundCard);

    }

    // Mazo al juego.

    game.deck = shuffledDeck;
  
    // Reparte las cartas de camaleón y de ayuda a los jugadores.

    const playerCollections = await this.assignHelpCardsAndChameleons([...game.players, ...game.aiPlayers.map(ai => ai.name)], gameName);

    game.playerCollections = playerCollections;

    // Cartas de resumen disponibles.
  
    game.summaryCards = this.assignSummaryCards(game);
  
    // Jugador inicial aleatorio.

    const playerNames = [...game.players, ...game.aiPlayers.map(ai => ai.name)];

    game.currentPlayerIndex = this.chooseStartingPlayer(playerNames);
  
    // Carta final (fin de ronda) no revelada inicialmente.

    game.isRoundCardRevealed = false;
  
    // Partida preparada para jugar.

    game.isPrepared = true;
  
    await game.save();

    this.gameGateway.emitGamePrepared(game);

    this.gameGateway.emitCardsAssigned(game);
  
    return game;

  }

  // Método privado: Añadir cartas resumen según la dificultad de la partida.

  private assignSummaryCards(game: Game): Map<string, Card[]> {

    const summaryCards: Card[] = game.difficultyLevel === 'Básico'
        ? [{ color: 'summary_brown', isEndRound: false }]
        : [{ color: 'summary_violet', isEndRound: false }];

    const shuffledSummaryCards = this.shuffleArray(summaryCards);
    const playerNames = [...game.players, ...game.aiPlayers.map(ai => ai.name)];

    this.adjustAiDifficulty(game.difficultyLevel);

    const assignedSummaryCards: Map<string, Card[]> = new Map();

    playerNames.forEach((player, index) => {
        assignedSummaryCards.set(player, [shuffledSummaryCards[index % shuffledSummaryCards.length]]);
    });

    return assignedSummaryCards;
}

  // Paso 2: Desarrollo de la partida.

  // Opción 2.1: Revelar una carta.

  async revealCard(gameName: string, playerName: string, columnIndex: number): Promise<GameDocument> {

    const game = await this.getCurrentGame(gameName);
    
    if (!game) {
        throw new NotFoundException('Juego no encontrado.');
    }

    const totalPlayers = game.players.length + game.aiPlayers.length;
    if (game.currentPlayerIndex < 0 || game.currentPlayerIndex >= totalPlayers) {
        throw new BadRequestException('Índice de jugador actual inválido.');
    }

    // Obtener el jugador actual
    const allPlayers = [...game.players, ...game.aiPlayers.map(ai => ai.name)];
    const currentPlayer = allPlayers[game.currentPlayerIndex];

    if (currentPlayer !== playerName) {
      throw new BadRequestException('No es tu turno.');
    }

    if (game.deck.length === 0) {
      throw new BadRequestException('El mazo está vacío.');
    }

    if (columnIndex < 0 || columnIndex >= game.columns.length) {
      throw new BadRequestException('Índice de columna inválido.');
    }

    if (game.isRoundCardRevealed) {
      throw new BadRequestException('No se pueden revelar más cartas, la ronda ha terminado.');
    }

    const revealedCard = game.deck.shift();
    
    if (!revealedCard) {
      throw new BadRequestException('No se pudo revelar la carta.');
    }

    const selectedColumn = game.columns[columnIndex];

    if (selectedColumn.cards.length === 0 && revealedCard.color !== "endRound") {
      throw new BadRequestException(`La columna ${columnIndex} está vacía y no se puede revelar una carta aquí.`);
    }

    if (game.isFinished) {
      throw new BadRequestException('La partida ha finalizado.');
    }

    if (revealedCard.isEndRound) {
      game.isRoundCardRevealed = true;
      game.currentRound++;
      await this.nextTurn(gameName);
      this.gameGateway.emitRoundEnd(game);
      await game.save();
      return game;
    }
  
  else {

    const wildCards: Card[] = [];
    const normalCards: Card[] = [];

    if (revealedCard.color === 'wild' || revealedCard.color === 'golden_wild') {
      let columnFound = false;

    if (game.columns[columnIndex].cards.length < 3) {
      game.columns[columnIndex].cards.push(revealedCard);
      columnFound = true;
    }

    if (!columnFound) {
      for (let i = 0; i < game.columns.length; i++) {
        if (game.columns[i].cards.length < 3 && game.columns[i].cards.length !== 0) {
          game.columns[i].cards.push(revealedCard);
          columnFound = true;
          break;
      }
    }
  }

    if (!columnFound) {
      wildCards.push(revealedCard);
    }


    if (revealedCard.color === 'golden_wild' && game.deck.length > 0) {
      const nextCard = game.deck.shift();

    if (nextCard && nextCard.isEndRound) {
      game.isRoundCardRevealed = true;
      game.currentRound++;
      game.currentPlayerIndex = (game.currentPlayerIndex + 1) % (game.players.length + game.aiPlayers.length);
      await this.nextTurn(gameName);
      this.gameGateway.emitRoundEnd(game);
      await game.save();
      return game;

     } else if (nextCard) {
      if (nextCard.color === 'wild') {
        let columnFound = false;

      if (game.columns[columnIndex].cards.length < 3) {
        game.columns[columnIndex].cards.push(nextCard);
        columnFound = true;
     }

      if (!columnFound) {
        for (let i = 0; i < game.columns.length; i++) {
          if (game.columns[i].cards.length < 3 && game.columns[i].cards.length !== 0) {
            game.columns[i].cards.push(nextCard);
            columnFound = true;
            break;
      }
    }
  }

      if (!columnFound) {
        wildCards.push(nextCard);
      }
      } else {
        const playerCollectionsObj = game.playerCollections instanceof Map ? Object.fromEntries(game.playerCollections)
        : game.playerCollections;
        const playerCards = playerCollectionsObj[playerName] || [];
        playerCards.push(nextCard);
        playerCollectionsObj[playerName] = playerCards;
        game.playerCollections = new Map(Object.entries(playerCollectionsObj));
      }
    }
  }

  } else {
      if (game.columns[columnIndex].cards.length >= 3) {
        throw new BadRequestException('La columna está llena.');
  }

  game.columns[columnIndex].cards.push(revealedCard);

}

  const updatedPlayerCollections = game.playerCollections;
  const currentPlayerCards = updatedPlayerCollections.get(playerName) || [];
  updatedPlayerCollections.set(playerName, [
    ...currentPlayerCards,
    ...normalCards
  ]);

   updatedPlayerCollections.get(playerName)?.sort((cardA, cardB) => {
    return cardA.color.localeCompare(cardB.color);
  });

  if (!game.wildCards[playerName]) {
    game.wildCards[playerName] = [];
  }

  const playerWildCards = game.wildCards.get(playerName) || [];

  playerWildCards.push(...wildCards);
  
  game.wildCards.set(playerName, playerWildCards);  

  }

  await game.save();
    
  this.gameGateway.emitCardRevealed(game, revealedCard);

  await this.nextTurn(gameName);

  return game;

}

  // Opción 2.2: Tomar una columna.

  async takeColumn(gameName: string, playerName: string, columnIndex: number): Promise<GameDocument> {

    const game = await this.getCurrentGame(gameName);
    
    if (!game) {
      throw new NotFoundException('Juego no encontrado.');
    }
  
    const allPlayers = [...game.players, ...game.aiPlayers.map(ai => ai.name)];
    const currentPlayer = allPlayers[game.currentPlayerIndex];

    if (currentPlayer !== playerName) {
      throw new BadRequestException('No es tu turno.');
    }

    const selectedColumn = game.columns[columnIndex];
  
    if (selectedColumn.cards.length === 0) {
      throw new BadRequestException('La columna seleccionada está vacía.');
    }

    if (game.playersTakenColumn.includes(playerName)) {
      throw new BadRequestException('Ya has tomado una columna en esta ronda.');
  }

    if (game.isFinished) {
      throw new BadRequestException('La partida ha finalizado, no se pueden tomar más columnas.');
  }
  
    const cardsToTake = [...selectedColumn.cards];

    const wildCards: Card[] = [];
    const normalCards: Card[] = [];

    cardsToTake.forEach(card => {
      if (card.color === 'wild' || card.color === 'golden_wild') {
        wildCards.push(card);
      } else if (card.color === "endRound") {
        game.isRoundCardRevealed = true;
        return;
      } else {
        normalCards.push(card);
      }
    });

    if (!game.playerCollections.has(playerName)) {
      game.playerCollections.set(playerName, []);
    }

   const updatedPlayerCollections = game.playerCollections;
   updatedPlayerCollections.set(playerName, [
     ...(updatedPlayerCollections.get(playerName) || []),
     ...normalCards
   ]); 

   updatedPlayerCollections.get(playerName)?.sort((cardA, cardB) => {
    return cardA.color.localeCompare(cardB.color);
   });

  if (!game.wildCards[playerName]) {
    game.wildCards[playerName] = [];
  }

  const playerWildCards = game.wildCards.get(playerName) || [];

  playerWildCards.push(...wildCards);
  
  game.wildCards.set(playerName, playerWildCards);  
    
  selectedColumn.cards = [];

  game.playersTakenColumn.push(playerName);

  const allPlayersInGame = [...game.players, ...game.aiPlayers].length;

  if (game.isRoundCardRevealed && game.playersTakenColumn.length === allPlayersInGame) {

    if (normalCards.length > 0) {
      updatedPlayerCollections.set(currentPlayer, [
          ...(updatedPlayerCollections.get(currentPlayer) || []),
          ...normalCards
      ]);
    }
      
      game.columns.forEach(column => {
        column.cards = [];
    });

    await game.save();
      
    this.finalizeAndCalculateScores(gameName);
    
    } else {

    const allPlayersInGame = [...game.players, ...game.aiPlayers].length;

    if (game.playersTakenColumn.length === allPlayersInGame) {

         game.currentRound++;
         game.playersTakenColumn = [];
         const isFirstRound = game.currentRound === 1;

        if (allPlayersInGame === 2 && isFirstRound) {
          const remainingColumnIndex = game.columns.findIndex(column => column.cards.length > 0);
          if (remainingColumnIndex !== -1) {
              game.columns.splice(remainingColumnIndex, 1);
          }
        }
  
  let allColumnCards: Card[] = [];

  game.playerCollections.forEach((cards, playerName) => {
      const columnCards = cards.filter(card => 
          card.color.startsWith('brown_column') || 
          card.color.startsWith('green_column')
      );
      allColumnCards = allColumnCards.concat(columnCards);
  });

  game.columns.forEach(column => {
      column.cards = [];
  });

  game.playerCollections.forEach((cards, playerName) => {
    game.playerCollections.set(playerName, cards.filter(card => 
        !card.color.startsWith('brown_column') && 
        !card.color.startsWith('green_column')
      ));
  });

  allColumnCards.forEach((card, index) => {
      const columnIndex = index % game.columns.length;
      game.columns[columnIndex].cards.push(card);
  });
     
    } else {
        
          let nextPlayerIndex = (game.currentPlayerIndex + 1) % allPlayers.length;
          
          while (game.playersTakenColumn.includes(allPlayers[nextPlayerIndex])) {
              nextPlayerIndex = (nextPlayerIndex + 1) % allPlayers.length;
              if (nextPlayerIndex === game.currentPlayerIndex) {
                  break;
              }
          }
  
          game.currentPlayerIndex = nextPlayerIndex;
      }
      
    // Guardar el estado del juego
    await game.save();

    // Emitir el evento de columna tomada
    this.gameGateway.emitColumnTaken(game, columnIndex, playerName);

    return game;
}
}

  // ----------------------------------------- Métodos privados adicionales ----------------------------

  // Ajustar la dificultad de la IA.

  private adjustAiDifficulty(level: 'Básico' | 'Experto'): void {

    this.aiService.adjustAiDifficulty(level); 
    
  }

  // Selección del nivel de dificultad y preparación del juego.

  async selectDifficultyAndPrepareGame(gameName: string, level: 'Básico' | 'Experto'): Promise<GameDocument> {

    const game = await this.gameModel.findOne({ gameName }).exec();

    if (!game) {
      throw new NotFoundException('Juego no encontrado.');
    }

    game.difficultyLevel = level;

    await game.save();

    this.scheduleGamePreparation(game);

    return game;

  }

  // Generar mazo.

  private async createDeck(numberOfPlayers: number): Promise<Card[]> {

    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'brown'];

    const deck: Card[] = [];
    
    // Cartas de camaleones de colores.

    for (const color of colors) {
      for (let i = 0; i < 9; i++) {
        deck.push({
          color,
          isEndRound: false,
        });
      }
    }
    
    // Cartas de algodón.

    for (let i = 0; i < 10; i++) {
      deck.push({
        color: 'cotton',
        isEndRound: false,
      });
    }
    
    // Comodínes.

    for (let i = 0; i < 2; i++) {
      deck.push({
        color: 'wild',
        isEndRound: false,
      });
    }

    // Comodín dorado.

    for (let i = 0; i < 1; i++) {
      deck.push({
        color: 'golden_wild',
        isEndRound: false,
      });
    }
    
    // Carta fin de ronda.

    deck.push({
      color: 'endRound',
      isEndRound: true,
    });

    // Cartas de columna. 

    // Solo marrón si hay más de 2 jugadores, verdes si solo hay 2 jugadores.

    if (numberOfPlayers > 2) {
      for (let i = 0; i < 5; i++) {
        deck.push({
          color: 'brown_column',
          isEndRound: false,
        });
      }

    } else if (numberOfPlayers === 2) {
      deck.push({
        color: 'green_column_0',
        isEndRound: false,
      });
      deck.push({
        color: 'green_column_1',
        isEndRound: false,
      });
      deck.push({
        color: 'green_column_2',
        isEndRound: false,
      });
    }
    
    return deck;
  }

  // Generar columnas y configurar el mazo.

  private setupColumnsAndDeck(deck: Card[], numberOfPlayers: number): [Column[], Card[]] {

    // Barajar el mazo.

    const shuffledDeck = this.shuffleArray(deck);
    
    // Inicializar variables para cartas especiales.

    let endRoundCard: Card | null = null;

    // Buscar y extraer cartas especiales del mazo.

    const remainingDeck = shuffledDeck.filter(card => {
        if (card.isEndRound) {
            endRoundCard = card;
            return false;
        }
        return true; 
    });

    // Filtrar y seleccionar cartas de columna para las columnas.

    const columnCards = remainingDeck.filter(card => card.color.startsWith('green_column') || card.color.startsWith('brown_column'));
    
    // Inicializar columnas vacías.

    let columns: Column[] = [];

   // Seleccionar cartas de columna basadas en el número de jugadores.
   if (numberOfPlayers === 2) {
       // Para 2 jugadores, asignar las 3 columnas verdes en orden específico.
       const greenColumn1 = columnCards.find(card => card.color === 'green_column_0');
       const greenColumn2 = columnCards.find(card => card.color === 'green_column_1');
       const greenColumn3 = columnCards.find(card => card.color === 'green_column_2');
       
       // Asignar las columnas en orden.
       columns = [
           { cards: greenColumn1 ? [greenColumn1] : [] },
           { cards: greenColumn2 ? [greenColumn2] : [] },
           { cards: greenColumn3 ? [greenColumn3] : [] },
       ];
    } else if (numberOfPlayers > 2) {
       const selectedColumnCards = columnCards.slice(0, numberOfPlayers);
       columns = selectedColumnCards.map(card => ({
           cards: [card]
       }));
   }

    // Eliminar cartas de columna del mazo.

    const deckWithoutColumns = remainingDeck.filter(card => 
        !card.color.startsWith('green_column') && 
        !card.color.startsWith('brown_column')
    );

    // Combinación del mazo final con las cartas iniciales y el resto del mazo.

    const first16Cards = deckWithoutColumns.splice(0, 16);
    const finalDeck = [...first16Cards, ...deckWithoutColumns];

    // Inserción de la carta de fin de ronda en la posición 16, si existe.

    if (endRoundCard) {

        finalDeck.splice(3, 0, endRoundCard);

    }

    return [columns, finalDeck];
    
}

  // Asignar a los jugadores cartas resumen y camaleones de distinto color.

  private async assignHelpCardsAndChameleons(players: string[], gameName: string): Promise<Map<string, Card[]>> {

    const playerCollections = new Map<string, Card[]>();

    const chameleonColors = this.getUniqueChameleonColors(players.length * 2);

    let colorIndex = 0;

    for (const player of players) {
        const chameleonCards: Card[] = [];

        const cardsToAssign = players.length === 2 ? 2 : 1;

        for (let i = 0; i < cardsToAssign; i++) {
            if (colorIndex < chameleonColors.length) {
                chameleonCards.push({
                    color: chameleonColors[colorIndex++],
                    isEndRound: false,
                });
            }
        }

        playerCollections.set(player, chameleonCards);
    }

    const game = await this.gameModel.findOne({ gameName }).exec();

    if (game) {
        game.playerCollections = playerCollections;
        await game.save();
    }

    return playerCollections;

}


  // Generar colores aleatorios de cada camaleón asignado.

  private getUniqueChameleonColor(): string {

    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'brown'];
  
    const randomIndex = Math.floor(Math.random() * colors.length);

    return colors[randomIndex];

  }

  private getUniqueChameleonColors(count: number): string[] {
    const allColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'brown'];

    count = Math.min(count, allColors.length);

    const shuffledColors = [...allColors];
    for (let i = shuffledColors.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledColors[i], shuffledColors[j]] = [shuffledColors[j], shuffledColors[i]];
    }

    return shuffledColors.slice(0, count);

}
  
  // Barajar mazo.

  private shuffleArray(array: Card[]): Card[] {

    for (let i = array.length - 1; i > 0; i--) {

      const j = Math.floor(Math.random() * (i + 1));

      [array[i], array[j]] = [array[j], array[i]];

    }

    return array;

  }
  
  // Elegir aleatoriamente el jugador inicial.

  private chooseStartingPlayer(players: string[]): number {

    return Math.floor(Math.random() * players.length);

  }

  // Obtener el estado actual del juego.

  async getCurrentGame(gameName: string): Promise<GameDocument> {

    const game = await this.gameModel.findOne({ gameName }).exec();

    if (!game) {
      throw new NotFoundException('La partida no existe.');
    }

    return game;

  }

  // Pasar al siguiente turno.

  async nextTurn(gameName: string): Promise<void> {

    const game = await this.getCurrentGame(gameName);

    if (!game) {
        throw new NotFoundException('Juego no encontrado.');
    }

    if (game.players.length === 0 && game.aiPlayers.length === 0) {
        throw new BadRequestException('No hay jugadores en el juego.');
    }

    const totalPlayers = game.players.length + game.aiPlayers.length;
    const allPlayers = [...game.players, ...game.aiPlayers.map(ai => ai.name)];

    let nextPlayerIndex = (game.currentPlayerIndex + 1) % totalPlayers;
    while (game.playersTakenColumn.includes(allPlayers[nextPlayerIndex])) {
        nextPlayerIndex = (nextPlayerIndex + 1) % totalPlayers;
    }

    game.currentPlayerIndex = nextPlayerIndex;
    
    await game.save();

    this.gameGateway.emitNextTurn(game);
}

  // Preparar la partida una vez creada después de 1 minuto.

  private async scheduleGamePreparation(game: GameDocument) {

    const preparationTime = game.preparationTime;
    const now = Date.now();
    let delay = Math.max(preparationTime.getTime() - now, 0);

    const prepareGameAndUpdate = async () => {

        if (!game.isPrepared) {
            await this.prepareGame(game.gameName, game.difficultyLevel);
        }

        game.preparationTime = new Date(); 
        await game.save();

    };

    setTimeout(async () => {
        await prepareGameAndUpdate();
    }, delay);

    const updateRemainingTime = async () => {

        const currentTime = Date.now();
        const timeRemaining = Math.max(preparationTime.getTime() - currentTime, 0);

        if (timeRemaining > 0) {
            await this.updatePreparationTime(game, new Date(currentTime + timeRemaining));
            setTimeout(updateRemainingTime, 1000);
        }
    };

    updateRemainingTime();
}

private async updatePreparationTime(game: GameDocument, newPreparationTime: Date) {

    game.preparationTime = newPreparationTime;
    await game.save(); 

}

// Paso 3: Finalización de partida.

async finalizeAndCalculateScores(gameName: string): Promise<GameDocument> {

  const game = await this.getCurrentGame(gameName);

  if (!game) {
    throw new NotFoundException('Juego no encontrado.');
  }

  if (!game.isRoundCardRevealed) {
    throw new BadRequestException('La carta de fin de ronda no ha sido revelada.');
  }

  const scores: Record<string, number> = {};

  const allPlayers = [...game.players, ...game.aiPlayers.map(ai => ai.name)]; 

  const playerCollectionsObj = game.playerCollections instanceof Map
  ? Object.fromEntries(game.playerCollections)
  : game.playerCollections;

  for (const playerName of allPlayers) {

    const playerCards = playerCollectionsObj[playerName] || [];
    const wildCards = game.wildCards.get(playerName) || [];
    const summaryCards = game.summaryCards.get(playerName) || [];
    const cardCountByColor: { [color: string]: number } = {};

    playerCards.forEach((card) => {
      if (card.color !== 'green_column_0' && card.color !== 'green_column_1' &&
        card.color !== 'green_column_2' && card.color !== 'brown_column') {
        cardCountByColor[card.color] = (cardCountByColor[card.color] || 0) + 1;
      }
    });

     const maxColor = Object.entries(cardCountByColor)
     .filter(([color]) => color !== 'cotton')
     .sort(([, a], [, b]) => b - a)
     .shift();

    const availableColors = Object.keys(cardCountByColor).filter(color => color !== 'cotton');

    for (let i = wildCards.length - 1; i >= 0; i--) {
      const wildCard = wildCards[i];
      const availableColorsWithoutCotton = availableColors.filter(color => color !== 'cotton');
      const assignedColor = maxColor ? maxColor[0] : availableColorsWithoutCotton[Math.floor(Math.random() * availableColorsWithoutCotton.length)];


      if (wildCard.color === 'wild' || wildCard.color === 'golden_wild') {
        wildCard.color = assignedColor;
        playerCards.push(wildCard);
        cardCountByColor[assignedColor] = (cardCountByColor[assignedColor] || 0) + 1;
        wildCards.splice(i, 1);
    }
    }

    const positiveColors = this.selectPositiveColors(cardCountByColor).filter(color => color !== 'cotton');

    let totalScore = 0;

    const summaryCardType = summaryCards[0].color;

    for (const color in cardCountByColor) {
      const count = cardCountByColor[color];

    if (color !== 'cotton') {
      const isPositive = positiveColors.includes(color);

    let score = this.calculateScore(count, isPositive, { color: summaryCardType });

    totalScore += score

    }
    }

    const bonusPoints = playerCards.filter((card) => card.color === 'cotton').length * 2;
    totalScore += bonusPoints;

    scores[playerName] = totalScore;

    if (Array.isArray(playerCards) && playerCards.every(card => card.color)) {

      playerCollectionsObj[playerName] = playerCards.sort((a, b) => a.color.localeCompare(b.color));

    } else {

      return null;

    }
  };

  game.finalScores = scores;

  const maxScore = Math.max(...Object.values(scores));
  game.winner = Object.keys(scores).filter((playerName) => scores[playerName] === maxScore);

  game.playerCollections = new Map(Object.entries(playerCollectionsObj));

  for (const playerName of allPlayers) {

    const user = await this.userModel.findOne({ username: playerName }).exec();

    if (!user) {

      continue;

    }

    user.gamesPlayed += 1;

    if (game.winner.includes(playerName)) {

      user.gamesWon += 1;

    }

    else {

      user.gamesLost += 1;

    }

    await user.save();

  }

  game.isFinished = true;

  await game.save();

  this.gameGateway.emitGameFinalization(gameName, scores, game.winner);

  return game;

}

private selectPositiveColors(cardCountByColor: { [color: string]: number }): string[] {

  return Object.entries(cardCountByColor)
    .filter(([color]) => color !== 'cotton')
    .sort(([colorA, countA], [colorB, countB]) => {

      if (countB !== countA) {
        return countB - countA;
      }
      return colorA.localeCompare(colorB);
    })

    .slice(0, 3)
    .map(([color]) => color); 

}

private calculateScore(count: number, isPositive: boolean, summaryCard: { color: string } | null): number {

  const scoringTables: Record<string, number[]> = {
    'summary_brown': [0, 1, 3, 6, 10, 15, 21],
    'summary_violet': [0, 1, 4, 8, 7, 6, 5]
  };


  let score = 0;

  if (summaryCard) {
    const table = scoringTables[summaryCard.color];
    if (table) {
      score = table[Math.min(count, table.length - 1)];
    }
  }

  return isPositive ? score : -score;
}
}
