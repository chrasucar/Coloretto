import { Injectable } from '@nestjs/common';

@Injectable()
export class GameService {

  private games: { [key: string]: any } = {};

  joinGame(clientId: string, gameId: string) {

    if (!this.games[gameId]) {

      this.games[gameId] = {
        players: [],
        deck: this.generateDeck(), 
        hands: {}, 
        table: [], 
        score: {}, 

      };
    }

    if (!this.games[gameId].players.includes(clientId)) {

      this.games[gameId].players.push(clientId);
      this.games[gameId].hands[clientId] = []; // Inicializar la mano del jugador.
      this.games[gameId].score[clientId] = 0; // Inicializar la puntuación del jugador.

    }

    // Enviar el estado del juego actualizado a todos los jugadores.

    this.updateGameState(gameId);

  }

  makeMove(clientId: string, gameId: string, move: any) {

    if (!this.games[gameId]) {

      throw new Error(`Partida ${gameId} no encontrada.`);

    }

    // Lógica para realizar un movimiento, por ejemplo, tomar una carta del mazo.

    const card = this.takeCardFromDeck(gameId);

    // Añadir la carta a la mano del jugador.

    this.games[gameId].hands[clientId].push(card);

    // Envía el estado del juego actualizado a todos los jugadores.

    this.updateGameState(gameId);

  }

  getGameState(gameId: string) {

    return this.games[gameId];

  }

  // Función para generar un mazo de cartas.

  private generateDeck() {

    // Implementar la lógica para generar las cartas del juego
    // Definir la estructura de las cartas y su cantidad según las reglas de Coloretto.

    return [];

  }

  // Función para tomar una carta del mazo.

  private takeCardFromDeck(gameId: string) {

    // Implementa la lógica para tomar una carta del mazo y devolverla.

    return {};

  }

  // Función para enviar el estado del juego actualizado a todos los jugadores.

  private updateGameState(gameId: string) {

    // Implementar la lógica para enviar el estado del juego actualizado a todos los jugadores.

  }
}
