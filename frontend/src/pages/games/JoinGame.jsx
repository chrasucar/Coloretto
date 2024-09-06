import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../context/GameProvider';
import { useAuth } from '../../context/auth.context';

const JoinGamePage = () => {
  const [gameName, setGameName] = useState('');
  const store = useGameStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    store.fetchGames();
  }, [store]);

  const handleJoinGame = async (gameName) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const encodedGameName = encodeURIComponent(gameName);
      await store.joinGame(encodedGameName, user.username);
      navigate(`/play/${encodedGameName}`);
    } catch (error) {
      console.error('Error al unirse a la partida:', error);
    }
  };

  return (
    <div>
      <h1>Seleccione una partida para comenzar a jugar.</h1>
      <input type="text" value={gameName} onChange={(e) => setGameName(e.target.value)} placeholder="Nombre de la partida" />
      <button onClick={() => handleJoinGame(gameName)}>Unirse</button>
    </div>
  );
};

export default JoinGamePage;
