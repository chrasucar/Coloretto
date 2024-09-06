import { makeAutoObservable, runInAction } from 'mobx';
import io from 'socket.io-client';
import { getAvailableGames, getGameByUser, joinGame, createGame, leaveGame } from '../api/auth';

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
      this.socket = io('http://localhost:3000');

      this.socket.on('connect', () => console.log('WebSocket conectado:', this.socket.id));
      this.socket.on('disconnect', () => console.log('Desconectado del servidor WebSocket'));
      this.socket.on('gameCreated', () => this.fetchGames());
      this.socket.on('gameUpdated', () => this.fetchGames());
      this.socket.on('gameDeleted', () => this.fetchGames());
      this.socket.on('playerJoined', () => this.fetchGames());
      this.socket.on('playerLeft', () => this.fetchGames());
    }
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
      console.error('Error al obtener la partida:', error);
      return null;
    }
  }

  // Unirse a partida.

  async joinGame(gameName, username) {

    if (this.currentUserGame && this.currentUserGame !== gameName) {
      await this.leaveGame(this.currentUserGame, username);
    }

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

  async createGame(gameName, maxPlayers, isAiControlled, ownerUsername) {
    try {
      await createGame(gameName, maxPlayers, isAiControlled, ownerUsername);
      this.fetchGames();
    } catch (err) {
      this.setError('Fallo al unirse a la partida.');
    }
  }

  // Abandonar partida.

  async leaveGame(gameName, username) {
  try {
    if (this.isLeavingGame) {
      console.warn('Una operación de abandonar partida ya está en curso.');
      return;
    }

    this.isLeavingGame = true;

    const response = await leaveGame(gameName, username);

    if (response.status === 200) {
      runInAction(() => {
        this.currentUserGame = ''; 
        this.currentGameName = '';
        this.fetchGames();
      });
      console.log('Partida abandonada con éxito.');
      this.socket.emit('playerLeft', { username });
    } else {
      if (response.status === 400) {
        console.error('El usuario ya está en otra partida.');
      } else {
        this.setError('Error al abandonar la partida.');
      }
    }
  } catch (err) {
    this.setError('Error al abandonar la partida.');
    console.error('Error en el método leaveGame:', err);
  } finally {
    this.isLeavingGame = false;
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

export default new GameStore();
