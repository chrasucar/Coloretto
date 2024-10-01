import React, { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameStore } from '../../context/GameProvider';
import { useAuth } from '../../context/auth.context';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Chat from '../chats/Chat';

const GamePage = observer(() => {
  const store = useGameStore();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gameName } = useParams();
  const [selectedGame, setSelectedGame] = useState('');
  const [gameDetails, setGameDetails] = useState(null);
  const [prepTime, setPrepTime] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);
  const inactivityTimeout = 10000; // Cambiar a 30 segundos cuando termine la iteración.
  const inactivityTimerRef = useRef(null);

  useEffect(() => {

    if (!user) {

      navigate('/');

      return;

    }

    const fetchData = async () => {

      if (gameName) {

        try {
          
          await store.fetchGames();
          const gameData = await store.getGameDetails(gameName);

          if (gameData) {

            setSelectedGame(gameName);
            setGameDetails(gameData);
            store.setCurrentGameName(gameName);
            store.setCurrentUserGame(gameName);
            setPrepTime(gameData.preparationTime);
          } 
          
          else {

            toast.error('No se pudo obtener la información de la partida.');
            navigate('/play/join');

          }
        } catch (error) {

          toast.error('Error al obtener los detalles de la partida.');
          navigate('/play/join');
        }
      }
    };

    fetchData();

    const handlePlayerJoined = (data) => {
      const username = data?.username || 'Desconocido';
      toast.info(`${username} se ha unido a la partida.`);
    };

    const handlePlayerLeft = (data) => {
      const username = data?.username || 'Desconocido';
      toast.warning(`${username} ha abandonado la partida.`);
    };

    const handleRevealCardFinal = () => {
      toast.dark('La carta fin de ronda ha sido revelada.');
    }

    const handleFinalize = async () => {
  
      const updatedGameDetails = await store.getGameDetails(gameName);
    
      if (updatedGameDetails.isFinished) {
        toast.dark('La partida ha terminado.');
      }
    };

    store.socket.on('playerJoined', handlePlayerJoined);
    store.socket.on('playerLeft', handlePlayerLeft);
    store.socket.on('roundEnd', handleRevealCardFinal);
    store.socket.on('gameFinalized', handleFinalize);

    return () => {
      store.socket.off('playerJoined', handlePlayerJoined);
      store.socket.off('playerLeft', handlePlayerLeft);
      store.socket.off('roundEnd', handleRevealCardFinal);
      store.socket.off('gameFinalized', handleFinalize);
    };
  }, [store, gameName, user, navigate]);


  useEffect(() => {
    const notifyPreparationTime = () => {

      if (prepTime) {

        const preparationTime = new Date(prepTime).getTime();
        const currentTime = Date.now();
        const timeRemaining = preparationTime - currentTime;

        if (timeRemaining > 0) {

          const seconds = Math.floor(timeRemaining / 1000);
          const minutes = Math.floor(seconds / 60);
          const secondsLeft = seconds % 60;
          toast.info(`La partida comienza en ${minutes}m ${secondsLeft}s`);

        }

        else if (!gameStarted) {

          toast.info('La partida ha comenzado.');
          setGameStarted(true);

        }
      }
    };

    notifyPreparationTime();

    const intervalId = setInterval(notifyPreparationTime, 1000);

    return () => clearInterval(intervalId);

  }, [prepTime, gameStarted]);

  const currentPlayerIndex = gameDetails ? gameDetails.currentPlayerIndex : null;
  const currentUserIndex = gameDetails && user ? gameDetails.players.indexOf(user.username) : -1;

  const handleColumnClick = (index) => {

    const column = gameDetails.columns[index];

    if (column.cards.length === 0) {
      return;
    }

    setSelectedColumnIndex(index);

    resetInactivityTimer();

  };

  const handleRevealCard = async () => {

    if (!user) {

      toast.error('Necesitas iniciar sesión para revelar una carta.');
      return;
    }

    if (selectedColumnIndex === null) {

      toast.error('No se ha seleccionado ninguna columna.');
      return;
    }

    try {
      const response = await store.revealCard(selectedGame, user.username, selectedColumnIndex);
  
      if (response) {
          toast.success('Carta revelada con éxito.');
          resetInactivityTimer();
        }
      } catch (error) {

        const errorMessage = error.message;
    
        toast.error(errorMessage);
      }
    };

  const handleTakeColumn = async () => {

    if (!user) {
      toast.error('Necesitas iniciar sesión para tomar una columna.');
      return;
    }

    if (selectedColumnIndex === null) {
      toast.error('No se ha seleccionado ninguna columna.');
      return;
    }

    try {

      const response = await store.takeColumn(selectedGame, user.username, selectedColumnIndex);
  
      if (response) {

        toast.info(`Columna ${selectedColumnIndex} tomada.`);

        resetInactivityTimer();

      }

    } catch (error) {

      const errorMessage = error.message;
  
      toast.error(errorMessage);
    }
  };

  const handleLeaveGame = async () => {

    if (!user) {
      toast.error('Necesitas iniciar sesión para abandonar una partida.');
      return;
    }
  
    if (!selectedGame) {
      toast.error('No se ha seleccionado ninguna partida.');
      return;
    }
  
    try {

      await store.leaveGame(selectedGame, user.username);
      toast.info(`${user.username} ha dejado la partida.`);
      setSelectedGame('');
      setTimeout(() => {
        navigate('/play/join');
      }, 0);

     } catch (error) {

        if (error.response && error.response.data && error.response.data.message) {

          toast.error(error.response.data.message);

        } else {  

          toast.error('Ocurrió un error al abandonar partida.');
    }

          console.error('Error abandonando partida:', error);

  }
};

  const resetInactivityTimer = () => {

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      handleForceEndTurn();
    }, inactivityTimeout);
  };

  let isTakingColumn = false;

  const handleForceEndTurn = async () => {

  if (gameDetails && user) {

    const currentUserIndex = gameDetails.players.indexOf(user.username);
    const currentPlayerIndex = gameDetails.currentPlayerIndex;
    const playersWhoHaveNotTakenColumn = gameDetails.players.filter(player => !gameDetails.playersTakenColumn.includes(player));

    if (playersWhoHaveNotTakenColumn.length === 1) {

      const lastPlayer = playersWhoHaveNotTakenColumn[0];

    setTimeout(async () => {

      if (isTakingColumn) return;

        isTakingColumn = true;

    try {

      const updatedGameDetails = await store.getGameDetails(selectedGame);

      const stillInactive = updatedGameDetails.players.filter(player => 
      !updatedGameDetails.playersTakenColumn.includes(player)).length === 1;

      if (stillInactive) {

        const availableColumns = updatedGameDetails.columns.filter((column, index) => column &&
          column.cards.length > 0 && !updatedGameDetails.playersTakenColumn.includes(index));

        if (availableColumns.length > 0 && !updatedGameDetails.playersTakenColumn.includes(lastPlayer)) {

          const columnToTakeIndex = updatedGameDetails.columns.indexOf(availableColumns[0]);

        if (columnToTakeIndex !== null && !updatedGameDetails.playersTakenColumn.includes(lastPlayer)) {

          const columnColor = availableColumns[0].cards[0]?.color;

          if (columnColor) {

            const isColumnStillAvailable = updatedGameDetails.columns[columnToTakeIndex].cards.length > 0;

            if (isColumnStillAvailable && !gameDetails.playersTakenColumn.includes(user.username)) {

              await store.takeColumn(selectedGame, lastPlayer, columnToTakeIndex);

              toast.info(`${lastPlayer} ha tomado la columna ${columnToTakeIndex} automáticamente por inactividad.`);

            }
          }
        }
      }
    }
    } catch (error) {

      return null;

    }

  }, inactivityTimeout);

  return;
}

    if (currentUserIndex === currentPlayerIndex) {

      await store.nextTurn(gameName, user.username);

      toast.warning('Su turno ha finalizado por inactividad.');

    } else if (currentPlayerIndex !== -1 && gameDetails.players[currentPlayerIndex]) {

      const inactivePlayer = gameDetails.players[currentPlayerIndex];

      const nextPlayer = gameDetails.players[(currentPlayerIndex + 1) % gameDetails.players.length];

      try {

        await store.nextTurn(gameName, nextPlayer);

        toast.info(`Siguiente turno: ${nextPlayer}. Jugador ${inactivePlayer} inactivo.`);

      } catch (error) {

        toast.error('No se pudo pasar el turno. Intenta de nuevo.');
      }
    }
  }
};

  useEffect(() => {

      resetInactivityTimer();

    return () => {

      if (inactivityTimerRef.current) {

        clearTimeout(inactivityTimerRef.current);

     }
    };
  }, [currentPlayerIndex]);

  return (
    <div>
      <h1>Detalles del Juego</h1>
      {gameDetails ? (
        <div>
          <p><strong>Propietario:</strong> {gameDetails.owner}</p>
          <p><strong>Nombre del Juego:</strong> {gameDetails.gameName}</p>
          <p><strong>Máximo de Jugadores:</strong> {gameDetails.maxPlayers}</p>
          <p><strong>Jugadores:</strong> {gameDetails.players.join(', ')}</p>
          <p><strong>Jugadores IA:</strong> {gameDetails.aiPlayers.map(player => player.name).join(', ')}</p>
          <p><strong>¿Está preparado?:</strong> {gameDetails.isPrepared ? 'Sí' : 'No'}</p>
          <p><strong>¿Es controlado por IA?:</strong> {gameDetails.isAiControlled ? 'Sí' : 'No'}</p>
          <p><strong>Ronda actual:</strong> {gameDetails.currentRound}</p>
          <p><strong>Índice del jugador actual:</strong> {gameDetails.currentPlayerIndex}</p>
          <p><strong>Partida finalizada:</strong> {gameDetails.isFinished ? 'Sí' : 'No'}</p>

          <h3>Columnas:</h3>
          <ul>
            {gameDetails.columns.map((column, index) => (
              <li
              key={index}
              onClick={() => handleColumnClick(index)}
              style={{
                cursor: 'pointer',
                opacity: column.cards.length === 0 ? 0.5 : 1,
                backgroundColor: selectedColumnIndex === index ? '#cce5ff' : 'transparent',
                border: selectedColumnIndex === index ? '2px solid #007bff' : 'none', 
                transition: 'background-color 0.3s, border 0.3s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = column.cards.length > 0 ? '#e9ecef' : 'transparent'; }} 
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = selectedColumnIndex === index ? '#cce5ff' : 'transparent'; }}
            >
                <strong>Columna {index}:</strong>
                <ul>
                  {column.cards.length > 0 ? (
                    column.cards.map((card, cardIndex) => (
                      <li key={cardIndex}>
                        <span>Color: {card.color}</span>
                      </li>
                    ))
                  ) : (
                    <li>Sin cartas</li>
                  )}
                </ul>
              </li>
            ))}
          </ul>

          <h3>Mazo:</h3>
          <p>{gameDetails.deck.length} cartas restantes</p>

          <h3>Jugadores que han tomado una columna:</h3>
          {gameDetails.playersTakenColumn.length > 0 ? (
            <ul>
              {gameDetails.playersTakenColumn.map((player, index) => (
                <li key={index}>{player}</li>
              ))}
            </ul>
          ) : (
            <p>Ningún jugador ha tomado una columna aún.</p>
          )}

      <div>
      <h1>Puntuación de los jugadores</h1>
      <ul>
        {gameDetails.finalScores && Object.entries(gameDetails.finalScores).map(([player, score]) => (
          <li key={player}>
            {player}: {score} puntos.
          </li>
        ))}
      </ul>

      <h2>Ganadores</h2>
      {gameDetails.winner && gameDetails.winner.length > 0 ? (
        <ul>
          {gameDetails.winner.map((player) => (
            <li key={player}>{player}</li>
          ))}
        </ul>
      ) : (
        <p>Ningún ganador aún.</p>
      )}
    </div>

          <button onClick={handleRevealCard} disabled={selectedColumnIndex === null || currentUserIndex !== currentPlayerIndex}>
          Revelar Carta</button>

          <button onClick={handleTakeColumn} disabled={selectedColumnIndex === null || currentUserIndex !== currentPlayerIndex}>
          Tomar Columna</button>

          <button onClick={handleLeaveGame}>
          Abandonar Partida</button>

          {/*Poner esto: <Chat gameName={gameName} />*/}
          <ToastContainer />
        </div>

      ) : (
        <p>Cargando detalles del juego...</p>
      )}
    </div>
  );
});

export default GamePage;
