// Datos del estado del juego.

export interface GameState {
  gameId: string; // Id de la partida actual
  currentPlayer: string; // Nombre del jugador actual
  players: Player[]; // Lista de jugadores en la partida
  deck: Card[]; // Mazo de cartas restantes
  discardedCards: Card[]; // Cartas descartadas
  activeColumn: Column; // Columna activa en el juego
  gameStarted: boolean; // Indicador de si la partida ha comenzado
  moves: string[];
}

// Datos del jugador.

export interface Player {
  name: string; // Nombre del jugador
  hand: Card[]; // Cartas en la mano del jugador
  score: number; // Puntuación del jugador
  moves: string[];
}

// Datos de cada carta.

export interface Card {
  color: string; // Color de la carta
  number: number; // Número de la carta
}

// Datos de cada carta en la columna.

export interface Column {
  cards: Card[]; // Cartas en la columna
  selected: boolean; // Indicador de si la columna está seleccionada por un jugador
}
