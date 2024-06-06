// GamePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/auth.context';
import { useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

const GamePage = () => {
  const location = useLocation();
  const { numPlayers, optionalRules } = location.state;
  const { user, fetchGameState } = useAuth();
  const [gameState, setGameState] = useState(null);
  const [moveInput, setMoveInput] = useState('');
  const socketRef = useRef(null);

  useEffect(() => {
    
    if (!socketRef.current) {
      const newSocket = io('http://localhost:3000');
      socketRef.current = newSocket;

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
      });

      newSocket.on('disconnect', (reason) => {
        console.warn('Disconnected from WebSocket:', reason);
        if (reason === 'io server disconnect') {
          newSocket.connect();
        }
      });

      newSocket.current.on('gameStateUpdate', (gameStateData) => {
        console.log('Game state updated:', gameStateData);
        setGameState(gameStateData);
    });

      newSocket.on('error', (error) => {
        console.error('Error al recibir el gameState:', error);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (socketRef.current && user && user.gameId) {
      socketRef.current.emit('joinGame', user.gameId, user._id, numPlayers, optionalRules);
    }
  }, [user, numPlayers, optionalRules]);

  useEffect(() => {
    const updateGameState = async () => {
        if (fetchGameState && user) {
            try {
                const newGameState = await fetchGameState(user.gameId);
                setGameState(newGameState);
            } catch (error) {
                console.error('Error fetching game state:', error);
            }
        }
    };

    updateGameState();
}, [fetchGameState, user]);

  const handleNewGame = (gameId) => {
    if (socketRef.current && user.gameId) {
      socketRef.current.emit('newGame', user.gameId, numPlayers, optionalRules );
    }
  };
  
  const handleMakeMove = (move) => {
    if (socketRef.current && user && user.gameId) {
      socketRef.current.emit('makeMove', user.gameId, move, user._id );
    } else {
      console.error('gameId is null or undefined');
    }
  };  

  window.socketRef = socketRef.current;

  if (!user) {
    return <div>Loading...</div>;
  }

  if (!gameState) {
    return <div>Loading game state...</div>;
  }

  return (
    <div>
      <h1>Bienvenido a la partida, {user.username}!</h1>
      <div>Jugador actual: {gameState.currentPlayer}</div>

      {gameState.players.map((player, index) => (
        <div key={index}>
          <h2>Jugador: {player.name}</h2>
          <ul>
            {player.hand.map((card, cardIndex) => (
              <li key={cardIndex}>{card}</li>
            ))}
          </ul>
        </div>
      ))}

      <div>
        <h2>Columna activa</h2>
        <ul>
          {gameState.activeColumn.cards.map((card, cardIndex) => (
            <li key={cardIndex}>{card}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Mazo</h2>
        <ul>
          {gameState.deck.map((card, cardIndex) => (
            <li key={cardIndex}>{card}</li>
          ))}
        </ul>
        <h2>Cartas descartadas</h2>
        <ul>
          {gameState.discardedCards.map((card, cardIndex) => (
            <li key={cardIndex}>{card}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Movimientos realizados</h2>
        <ul>
          {gameState.moves.map((move, moveIndex) => (
            <li key={moveIndex}>{move}</li>
          ))}
        </ul>
      </div>

      <div>
        <input
          type="text"
          value={moveInput}
          onChange={(e) => setMoveInput(e.target.value)}
        />
        <button onClick={() => handleMakeMove(moveInput)}>Hacer Movimiento</button>
      </div>

      <button onClick={handleNewGame}>Nueva Partida</button>
    </div>
  );
};

export default GamePage;
