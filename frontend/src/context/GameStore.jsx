import { makeAutoObservable, runInAction } from 'mobx';
import io from 'socket.io-client';
import { getAvailableGames, getGameByUser, getGameByName, joinGame, createGame, getPreparationTimeRemaining, prepareGame, 
  leaveGame, selectDifficultyAndPrepareGame, revealedCard, nextTurns, takedColumn, finalizeScores } from '../api/auth';

class GameStore {
  games = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = false;
  error = '';
  currentGameName = '';
  currentUserGame = ''; 
  notifications = [];
  socket = null;

  constructor() {
    makeAutoObservable(this, {
      fetchGames: true,
      joinGame: true,
      createGame: true,
      selectDifficultyAndPrepareGame: true,
      leaveGame: true,
      fetchUserGame: true,
      setError: true,
      setGames: true,
      setCurrentPage: true,
      setTotalPages: true,
      setLoading: true,
      setCurrentGameName: true,
      setCurrentUserGame: true,
      addNotification: true,
      initSocket: true,
    });

    this.initSocket();
  }

  initSocket() {
    if (!this.socket) {
      this.socket = io('http://localhost:3000' || process.env.FRONTEND_URL);

      this.socket.on('connect', () => {});
      this.socket.on('disconnect', () => {});
      this.socket.on('gameCreated', () => this.fetchGames());
      this.socket.on('gameUpdated', () => this.fetchGames());
      this.socket.on('gameDeleted', () => this.fetchGames());
      this.socket.on('playerJoined', () => this.fetchGames());
      this.socket.on('playerLeft', () => this.fetchGames());

      this.socket.on('gamePrepared', () => {});
      this.socket.on('cardsAssigned', () => {});
      this.socket.on('nextTurn', () => {});
      this.socket.on('cardRevealed', () => {});
      this.socket.on('columnTaken', () => {});
      this.socket.on('roundEnd', () => {});
      this.socket.on('gameFinalized', () => {});
      };
    }

  // Obtener las partidas.

  async fetchGames(page = 1) {
    this.setLoading(true);
    try {
      const response = await getAvailableGames(page);
      const totalGames = response.data.total;
      const gamesPerPage = 3;
      const totalPages = Math.ceil(totalGames / gamesPerPage);

      runInAction(() => {
        this.setGames(response.data.games);
        this.setTotalPages(totalPages);
        this.setCurrentPage(page);
        this.setError('');
      });
    } catch (err) {
      runInAction(() => {
        this.setError('Error al obtener las partidas.');
      });
    } finally {
      runInAction(() => {
        this.setLoading(false);
      });
    }
  }

  // Obtener la partida creada por el usuario.

  async fetchUserGame(owner) {
    try {
      const response = await getGameByUser(owner);
      return response.data;
    } catch (error) {
      return null;
    }
  }

   // Comprobar si la partida existe.

   async getGameDetails(gameName) {
    try {
      const response = await getGameByName(gameName);
      return response.data;
    } catch (error) {
      return false;
    }
  }

  // Unirse a partida.

  async joinGame(gameName, username) {

    try {
      const response = await joinGame(gameName, username);
      if (response.status === 200) {
        runInAction(() => {
          this.setCurrentGameName(gameName);
          this.setCurrentUserGame(gameName);
        });
        this.fetchGames();
      }
    } catch (err) {
      if (err.response && err.response.status === 400) {
        const message = 'No puedes unirte a una partida ya que estás en otra.';
        this.setError(message);
        alert(message);
        return; 
      } else {
        this.setError('Fallo al unirse a la partida.');
      }
    }
  }

  // Crear una partida.

  async createGame(gameName, maxPlayers, isAiControlled, ownerUsername, difficultyLevel) {
    try {
      await createGame(gameName, maxPlayers, isAiControlled, ownerUsername, difficultyLevel);
      this.fetchGames();
    } catch (err) {
      this.setError('Fallo al unirse a la partida.');
    }
  }

  // Preparación de la partida.

  async getPreparationTimeRemaining(gameName) {
    try {
      const response = await getPreparationTimeRemaining(gameName);
      return response.data.timeRemaining;
    } catch (error) {
      return null;
    }
  }

  // Seleccionar dificultad y preparar la partida.

  async selectDifficultyAndPrepareGame(gameName, level) {
    try {
      const response = await selectDifficultyAndPrepareGame(gameName, level);
      if (response.data) {
        runInAction(() => {
          this.setCurrentGameName(gameName);
          this.setCurrentUserGame(gameName);
        });
        this.fetchGames();
        return response.data;
      } else {
        this.setError('No se pudo preparar la partida.');
      }
    } catch (error) {
      this.setError('Error al seleccionar dificultad y preparar la partida.');
      console.error('Error al elegir dificultad:', error);
    }
  }


  async prepareGame(gameName) {
    try {
      const response = await prepareGame(gameName);
      if (response.data) {
        runInAction(() => {
          this.setCurrentGameName(gameName);
          this.setCurrentUserGame(gameName);
        });
        this.fetchGames();
        return response.data;
      } else {
        this.setError('No se pudo preparar la partida.');
      }
    } catch (err) {
      this.setError('Fallo al preparar la partida.');
      console.error('Error al preparar la partida:', err);
    }
  }

  // Abandonar partida.

  async leaveGame(gameName, username) {
  try {

    this.isLeavingGame = true;

    const response = await leaveGame(gameName, username);

    if (response.status === 200) {
      runInAction(() => {
        this.setCurrentUserGame('');
      });
      this.socket.emit('playerLeft', { username });
    } else {
      if (response.status === 400) {
        console.error('El usuario ya está en otra partida.');
        alert('No puedes abandonar la partida: ' + response.data.message);
      } else {
        this.setError('Error al abandonar la partida.');
      }
    }
  } catch (err) {
    this.setError('Error al abandonar la partida.');
    console.error(err.stack);
    console.error('Error abandonando partida:', err);
  } finally {
    runInAction(() => {
      this.isLeavingGame = false;
    });
  }
}

async revealCard(gameName, playerName, columnIndex) {

  try {
    const response = await revealedCard(gameName, playerName, columnIndex);
    return response.data;  
  } catch (error) {
    let message = '';
    if (error.response) {
      message = error.response.data.message || message;
    }
    this.setError(message);
    throw new Error(message);
  }
}


async nextTurn(gameName) {
  try {
    const response = await nextTurns(gameName);
    if (response.data) {
      return response.data;
    } else {
      this.setError('No se pudo cambiar de turno.');
      return null;
    }
  } catch (error) {
    this.setError('Error al cambiar de turno.');
    return null;
  }
}


async takeColumn(gameName, playerName, columnIndex) {
  try {
    const response = await takedColumn(gameName, playerName, columnIndex);
    return response.data;
  } catch (error) {
    let message = '';
    if (error.response) {
      message = error.response.data.message || message;
    }
    this.setError(message);
    throw new Error(message);
  }
}

async endScores(gameName) {
  try {
    const response = await finalizeScores(gameName);

    if (response.data) {
      const { finalScores, winners } = response.data;

      return { finalScores, winners};

    } else {
      this.setError('Error al finalizar el juego.');
    }
  } catch (error) {
    this.setError('Error al calcular los puntajes finales.');
    console.error('Error calculando puntos:', error);
  }
}

  setError(message) {
    this.error = message;
  }

  setGames(games) {
    this.games = games;
  }

  setCurrentPage(page) {
    this.currentPage = page;
  }

  setTotalPages(totalPages) {
    this.totalPages = totalPages;
  }

  setCurrentGameName(gameName) {
    this.currentGameName = gameName;
  }

  setCurrentUserGame(gameName) {
    this.currentUserGame = gameName;
  }

  addNotification(notification) {
    this.notifications.push(notification);
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
  }
}

const gameStoreInstance = new GameStore();

export default gameStoreInstance;
