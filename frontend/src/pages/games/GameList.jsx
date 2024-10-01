import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameStore } from '../../context/GameProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth.context';
import { toast, ToastContainer } from 'react-toastify';

const GameList = observer(() => {
  const store = useGameStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedGame] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
  });
  
  useEffect(() => {

    store.fetchGames();
    store.initSocket(); 

    const handleRefresh = () => {
      store.fetchGames();
    };

    const handleGameUpdated = (updatedGame) => {
      console.log('Juego actualizado:', updatedGame);
      store.fetchGames();
    };

    const handleGameDeleted = (deletedGameName) => {
      if (deletedGameName === selectedGame) {
        toast.info("La partida ha sido eliminada.");
        navigate('/play/join');
      }
    };

    store.socket.on('gameCreated', handleRefresh);
    store.socket.on('gameUpdated', handleGameUpdated);
    store.socket.on('gameDeleted', handleGameDeleted);

    return () => {
      store.socket.off('gameCreated', handleRefresh);
      store.socket.off('gameUpdated', handleGameUpdated);
      store.socket.off('gameDeleted', handleGameDeleted);
    };
  }, [store, navigate, selectedGame]);

  useEffect(() => {
    const handleGameDeletionTimer = () => {
      const checkGamesForDeletion = () => {
        store.games.forEach(game => {
          if (game.players.length === 0 && game.lastActivity) {
            const eliminationTime = 30 * 1000;
            const now = Date.now();
            const elapsed = now - new Date(game.lastActivity).getTime();
            const timeRemaining = Math.max(eliminationTime - elapsed, 0);
            if (timeRemaining <= 0) {
              store.leaveGame(game.gameName);
              toast.info(`La partida "${game.gameName}" ha sido eliminada.`);
              store.fetchGames();
            }
          }
        });
      };
    
  
      checkGamesForDeletion();
      const intervalId = setInterval(checkGamesForDeletion, 2000);
  
      return () => clearInterval(intervalId);
    };
  
    const cleanup = handleGameDeletionTimer();
  
    return cleanup;
  }, [store.games, store]);

  const formatPreparationTime = (time) => {
    if (!time) {
      return 'Tiempo no disponible';
    }
  
    const preparationTime = new Date(time).getTime();
    const currentTime = Date.now();
    const timeRemaining = preparationTime - currentTime;
  
    if (timeRemaining <= 0) {
      const elapsed = Math.abs(timeRemaining);
      const elapsedSeconds = Math.floor(elapsed / 1000);
      const elapsedMinutes = Math.floor(elapsedSeconds / 60);
      const secondsLeft = elapsedSeconds % 60;
      return `La partida ha comenzado hace ${elapsedMinutes}m ${secondsLeft}s`;
    }
  
    const seconds = Math.floor(timeRemaining / 1000);
    const minutes = Math.floor(seconds / 60);
    const secondsLeft = seconds % 60;
    return `${minutes}m ${secondsLeft}s para comenzar`;
  };

  const formatEmptyGameMessage = (game) => {
    if (game.players.length === 0) {
      const eliminationTime = 10 * 1000;
      const now = Date.now();
      const elapsed = now - new Date(game.lastActivity).getTime();
      const timeRemaining = Math.max(eliminationTime - elapsed, 0);
      const seconds = Math.floor(timeRemaining / 1000);
      return `Sin jugadores. Eliminando la partida en ${seconds}s`;
    }
    return null;
  };
  
  const handleJoinGame = async (gameName) => {
    if (!user) {
      navigate('/login');
      return;
    }
  
    const game = store.games.find(g => g.gameName === gameName);
  
    if (game.players.includes(user.username)) {
      navigate(`/play/${gameName}`);
      return;
    }
  
    try {

      if (game.players.length < game.maxPlayers || user.username === game.owner) {
        await store.joinGame(gameName, user.username);
        navigate(`/play/${gameName}`);
      } else {
        toast.error('La partida está llena.');
      }
    } catch (error) {
      console.error('Error al unirse al juego:', error);
      toast.error('No se ha podido unir a la partida.');
      if (error.response && error.response.status === 404) {
        toast.error('La partida no existe o ha sido eliminada.');
      }
    }
  };

  const isLastPage = () => store.currentPage >= store.totalPages;

  const isInAnyGame = store.games.some(game => game.players.includes(user.username) || game.owner === user.username);

    const isInCurrentGame = (gameName) => {
    const currentGame = store.games.find(g => g.gameName === gameName);
    
    if (currentGame) {
      return currentGame.players.includes(user.username) || currentGame.owner === user.username;
    }
    
    return false;

    };
    
    const canJoinGame = (game) => {

      if (!isInAnyGame) {
        return true;
      } 

      if (isInCurrentGame(game.gameName) && (user.username === game.owner || game.players.includes(user.username))) {
        return true;
      }

      if (isInAnyGame && game.players.length >= game.maxPlayers && user.username !== game.owner) {
        return false;
      }

      return !isInAnyGame;

    };

    return (
      <div>
        <h1>Partidas disponibles</h1>
        {store.isLoading ? (
          <div>Cargando...</div>
        ) : store.error ? (
          <div>{store.error}</div>
        ) : (
          <>
            {store.games.length === 0 ? (
              <p>No hay partidas disponibles.</p>
            ) : (
              <ul>
                {store.games
                  .slice()
                  .sort((gameA, gameB) => {
                    const isUserAOwner = gameA.owner === user?.username;
                    const isUserBOwner = gameB.owner === user?.username;
  
                    if (isUserAOwner && !isUserBOwner) return -1;
                    if (!isUserAOwner && isUserBOwner) return 1;
  
                    return gameA.gameName.localeCompare(gameB.gameName);
                  })
                  .map((game) => (
                    <li key={game._id}>
                      {game.gameName} - {game.players.length}/{game.maxPlayers}
                      {game.isFinished ? (
                      game.players.length === 0 ? (
                        <span> - Eliminando...</span>
                      ) : (
                        <span> - Partida finalizada, esperando al abandono de jugadores...</span>
                      )
                    ) : game.players.length === 0 ? (
                      <span> {formatEmptyGameMessage(game)}</span>
                      ) : (
                        game.preparationTime && <span> - {formatPreparationTime(game.preparationTime)}.</span>
                      )}
                      <button
                        onClick={() => handleJoinGame(game.gameName)}
                        disabled={game.players.length === 0 || !canJoinGame(game)}
                      >
                        {game.isFinished ? 'Partida finalizada' : (game.players.length === 0 ? 'Unirse' : isInCurrentGame(game.gameName) ? 'Unido' : 'Unirse')}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
            <div>
              <button disabled={store.currentPage <= 1} onClick={() => store.fetchGames(store.currentPage - 1)}>
                Anterior
              </button>
              <span>Página {store.currentPage} de {store.totalPages}</span>
              <button disabled={isLastPage()} onClick={() => store.fetchGames(store.currentPage + 1)}>
                Siguiente
              </button>
            </div>
          </>
        )}
      <ToastContainer/>
      </div>
    );
  });
  
  export default GameList;
