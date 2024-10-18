import React, { useEffect, useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameStore } from '../../context/GameProvider';
import { useAuth } from '../../context/auth.context';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Chat from '../chats/Chat';
import '../../css/games/GamePage.css';

import reverse from '../../assets/cards/reverse.png';

import summary_brown from '../../assets/cards/summary_brown.png';
import summary_violet from '../../assets/cards/summary_violet.png';

import brown_column from '../../assets/cards/brown_column.png';
import green_column_0 from '../../assets/cards/green_column_0.png';
import green_column_1 from '../../assets/cards/green_column_1.png';
import green_column_2 from '../../assets/cards/green_column_2.png';

import chameleonBlue from '../../assets/cards/chameleonBlue.png';
import chameleonBrown from '../../assets/cards/chameleonBrown.png';
import chameleonGreen from '../../assets/cards/chameleonGreen.png';
import chameleonPurple from '../../assets/cards/chameleonPurple.png';
import chameleonYellow from '../../assets/cards/chameleonYellow.png';
import chameleonRed from '../../assets/cards/chameleonRed.png';
import chameleonOrange from '../../assets/cards/chameleonOrange.png';

import cotton from '../../assets/cards/cotton.png';
import wild from '../../assets/cards/wild.png';
import golden_wild from '../../assets/cards/golden_wild.png';
import endRound from '../../assets/cards/endRound.png';

import trophy from '../../assets/trophy.png';

const GamePage = observer(() => {
  const store = useGameStore();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gameName } = useParams();
  const [selectedGame, setSelectedGame] = useState('');
  const [gameDetails, setGameDetails] = useState(null);
  const [prepTime, setPrepTime] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showEndRoundCard, setShowEndRoundCard] = useState(false);
  const [showScoreTable, setShowScoreTable] = useState(false);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);
  const inactivityTimeout = 30000;
  const inactivityTimerRef = useRef(null);
  const pollingIntervalRef = useRef(null);

   // Polling para obtener los detalles del juego periódicamente.

   const startPolling = () => {

    pollingIntervalRef.current = setInterval(async () => {

      try {

        const updatedGameDetails = await store.getGameDetails(gameName);

        if (updatedGameDetails) {

          setGameDetails(updatedGameDetails);

          if (updatedGameDetails.isFinished) {

            setShowScoreTable(true);

            toast.info('La partida ha finalizado.');

            clearInterval(pollingIntervalRef.current);

          }
        }

      } catch (error) {

        console.error('Error al obtener los detalles del juego:', error);

      }
    }, 5000);
  };

  const stopPolling = () => {

    if (pollingIntervalRef.current) {

      clearInterval(pollingIntervalRef.current);

    }
  };

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
            startPolling();
          } else {
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

    const notifyEndRound = () => {
      setShowEndRoundCard(true);
      toast.dark('Fin de ronda!', {
        onClose: () => setShowEndRoundCard(false),
      });
    };

    const handleRevealCardFinal = () => {
      notifyEndRound();
    };

    const handleFinalize = async () => {
      const updatedGameDetails = await store.getGameDetails(gameName);

      if (updatedGameDetails.isFinished) {
        toast.dark('La partida ha terminado.');
        setShowScoreTable(true);
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
      stopPolling();
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
        } else if (!gameStarted) {
          toast.info('La partida ha comenzado.');
          setGameStarted(true);
        }
      }
    };

    notifyPreparationTime();

    const intervalId = setInterval(notifyPreparationTime, 1000);

    return () => clearInterval(intervalId);
  }, [prepTime, gameStarted]);

  const currentPlayerIndex = gameDetails
    ? gameDetails.currentPlayerIndex
    : null;

  const handleColumnClick = (index) => {
    const column = gameDetails.columns[index];
    if (column.cards.length === 0) {
      return;
    }

    if (selectedColumnIndex === index) {
      setSelectedColumnIndex(null);
    } else {
      setSelectedColumnIndex(index);
    }

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
      const response = await store.revealCard(
        selectedGame,
        user.username,
        selectedColumnIndex,
      );
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
      const response = await store.takeColumn(
        selectedGame,
        user.username,
        selectedColumnIndex,
      );

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
      navigate('/play/join');
      await store.fetchGames();
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
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
      const playersWhoHaveNotTakenColumn = gameDetails.players.filter(
        (player) => !gameDetails.playersTakenColumn.includes(player),
      );

      if (playersWhoHaveNotTakenColumn.length === 1) {
        const lastPlayer = playersWhoHaveNotTakenColumn[0];

        setTimeout(async () => {
          if (isTakingColumn) return;

          isTakingColumn = true;

          try {
            const updatedGameDetails = await store.getGameDetails(selectedGame);

            const stillInactive =
              updatedGameDetails.players.filter(
                (player) =>
                  !updatedGameDetails.playersTakenColumn.includes(player),
              ).length === 1;

            if (stillInactive) {
              const availableColumns = updatedGameDetails.columns.filter(
                (column, index) =>
                  column &&
                  column.cards.length > 0 &&
                  !updatedGameDetails.playersTakenColumn.includes(index),
              );

              if (
                availableColumns.length > 0 &&
                !updatedGameDetails.playersTakenColumn.includes(lastPlayer)
              ) {
                const columnToTakeIndex = updatedGameDetails.columns.indexOf(
                  availableColumns[0],
                );

                if (
                  columnToTakeIndex !== null &&
                  !updatedGameDetails.playersTakenColumn.includes(lastPlayer)
                ) {
                  const columnColor = availableColumns[0].cards[0]?.color;

                  if (columnColor) {
                    const isColumnStillAvailable =
                      updatedGameDetails.columns[columnToTakeIndex].cards
                        .length > 0;

                    if (
                      isColumnStillAvailable &&
                      !gameDetails.playersTakenColumn.includes(user.username)
                    ) {
                      await store.takeColumn(
                        selectedGame,
                        lastPlayer,
                        columnToTakeIndex,
                      );

                      toast.info(
                        `${lastPlayer} ha tomado la columna ${columnToTakeIndex} automáticamente por inactividad.`,
                      );
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
      } else if (
        currentPlayerIndex !== -1 &&
        gameDetails.players[currentPlayerIndex]
      ) {
        const inactivePlayer = gameDetails.players[currentPlayerIndex];

        const nextPlayer =
          gameDetails.players[
            (currentPlayerIndex + 1) % gameDetails.players.length
          ];

        try {
          await store.nextTurn(gameName, nextPlayer);

          toast.info(
            `Siguiente turno: ${nextPlayer}. Jugador ${inactivePlayer} inactivo.`,
          );
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

  function getCardImage(cardType) {
    switch (cardType) {
      // Cartas resumen

      case 'summary_brown':
        return summary_brown;
      case 'summary_violet':
        return summary_violet;

      // Cartas columna

      case 'green_column_0':
        return green_column_0;
      case 'green_column_1':
        return green_column_1;
      case 'green_column_2':
        return green_column_2;
      case 'brown_column':
        return brown_column;

      // Cartas camaleón

      case 'red':
        return chameleonRed;
      case 'blue':
        return chameleonBlue;
      case 'yellow':
        return chameleonYellow;
      case 'green':
        return chameleonGreen;
      case 'purple':
        return chameleonPurple;
      case 'orange':
        return chameleonOrange;
      case 'brown':
        return chameleonBrown;

      // Cartas extra

      case 'golden_wild':
        return golden_wild;
      case 'wild':
        return wild;
      case 'cotton':
        return cotton;
      case 'endRound':
        return endRound;

      // Mazo

      case 'deck':
        return reverse;

      default:
        return null;
    }
  }

  return (
    <div className="game-page">
      {showEndRoundCard && (
        <div className="final-card-notification">
          <img src={getCardImage('endRound')} alt="Carta fin de ronda" />
        </div>
      )}
      <ToastContainer />
      {gameDetails && (
        <div className="game-details">
          <div className="game-board">
          <img src={trophy} alt="trofeo" className="trophy-icon" />
            <h4>Puntuaciones:</h4>
            <ul className='points'>
              {Object.entries(gameDetails.finalScores).map(
                ([username, score]) => (
                  <li className='pointsUser' key={username}>
                    {username}: {score}
                  </li>
                ),
              )}
            </ul>
            <h4>Ganadores: {gameDetails.winner.join(', ')}</h4>
            <div className="left-container">
              <div className="deck-container">
                {gameDetails.deck.length > 0 && (
                  <>
                    {gameDetails.deck.map((card, index) => (
                      <img
                        key={index}
                        src={getCardImage('deck')}
                        alt={`Carta ${index + 1}`}
                        className="deck"
                        style={{
                          position: 'absolute',
                          transform: `translateY(${index * 5}px)`,
                          opacity: Math.max(0, 1 - index * 0.3),
                          zIndex: gameDetails.deck.length - index,
                        }}
                        onClick={() => {}}
                      />
                    ))}
                  </>
                )}
              </div>

              <div className="columns-container">
                {gameDetails.columns.map((column, index) => (
                  <div
                    key={index}
                    className={`column ${selectedColumnIndex === index ? 'selected' : ''}`}
                    onClick={() => handleColumnClick(index)}
                  >
                    <h2 className="column-name">Columna {index + 1}</h2>
                    <div className="cards">
                      {column.cards.map((card, cardIndex) => (
                        <img
                          key={cardIndex}
                          src={getCardImage(card.color)}
                          alt={card.color}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="right-container">
              {Object.keys(gameDetails.playerCollections).map((username) => (
                <div className="player-card-container" key={username}>
                  <div className="player-collection">
                    <h4>Colección de {username}</h4>
                    {gameDetails.playerCollections[username]?.map(
                      (card, index) => (
                        <img
                          key={index}
                          src={getCardImage(card.color)}
                          alt={card.color}
                        />
                      ),
                    )}
                  </div>

                  <div className="wild-cards">
                    <h4>Comodines de {username}</h4>
                    {gameDetails.wildCards[username]?.map((card, index) => (
                      <img
                        key={index}
                        src={getCardImage('wild')}
                        alt="wild card"
                      />
                    ))}
                  </div>

                  <div className="player-summary">
                    <h4>Resumen de {username}</h4>
                    {gameDetails.summaryCards[username]?.map((card, index) => (
                      <img
                        key={index}
                        src={getCardImage(card.color)}
                        alt={card.color}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="game-actions">
              <button className="buttonGamePage" onClick={handleRevealCard}>
                Revelar Carta
              </button>
              <button className="buttonGamePage" onClick={handleTakeColumn}>
                Tomar Columna
              </button>
              <button className="buttonGamePage" onClick={handleLeaveGame}>
                Abandonar Partida
              </button>
            </div>
          </div>
        </div>
      )}
      <Chat/>
    </div>
  );
  
});

export default GamePage;
