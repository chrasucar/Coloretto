import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameStore } from '../../context/GameProvider';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth.context';

const GameList = observer(() => {
  const store = useGameStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    store.fetchGames();
    store.initSocket(); 

    // Actualización de partidas.

    const handleRefresh = () => {
      store.fetchGames();
    };

    const handleGameUpdated = (updatedGame) => {
      console.log('Juego actualizado:', updatedGame);
      store.fetchGames();
    };

    store.socket.on('gameCreated', handleRefresh);
    store.socket.on('gameUpdated', handleGameUpdated);
    store.socket.on('gameDeleted', handleRefresh);

    return () => {
      store.socket.off('gameCreated', handleRefresh);
      store.socket.off('gameUpdated', handleGameUpdated);
      store.socket.off('gameDeleted', handleRefresh);
    };
  }, [store, navigate
  ]);

  const handleJoinGame = async (gameName) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await store.joinGame(gameName, user.username);
      navigate(`/play/${gameName}`);
    } catch (error) {
      console.error('Error al unirse al juego:', error);
    }
  };

  const isLastPage = () => store.currentPage >= store.totalPages;

  const isInAnyGame = store.games.some(game =>
    game.players.includes(user.username) || game.owner === user.username
  );

  // Ordenar partidas, primero por el que creó el usuario y luego las demás partidas de otros usuarios.
  
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
                    <button
                      onClick={() => handleJoinGame(game.gameName)}
                      disabled={
                        (isInAnyGame && !game.players.includes(user.username) && game.owner !== user.username) ||
                        (game.players.length >= game.maxPlayers && user.username !== game.owner)
                      }
                    >
                      {(game.players.includes(user.username) || game.owner === user.username) ? 'Unido' : 'Unirse'}
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
    </div>
  );
});

export default GameList;
