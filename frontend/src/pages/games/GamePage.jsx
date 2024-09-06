import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameStore } from '../../context/GameProvider';
import { useAuth } from '../../context/auth.context';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

// Iteración 4: Jugar al juego de forma básica.

const GamePage = observer(() => {
  const store = useGameStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { gameName } = useParams();
  const [selectedGame, setSelectedGame] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      await store.fetchGames();
      if (gameName) {
        setSelectedGame(gameName);
        store.setCurrentGameName(gameName);
        store.setCurrentUserGame(gameName);
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

    const handlePlayerRejoined = (data) => {
      const username = data?.username || 'Desconocido';
      toast.info(`${username} ha regresado a la partida.`);
    };

    store.socket.on('playerJoined', handlePlayerJoined);
    store.socket.on('playerLeft', handlePlayerLeft);
    store.socket.on('playerRejoined', handlePlayerRejoined);

    return () => {
      store.socket.off('playerJoined', handlePlayerJoined);
      store.socket.off('playerLeft', handlePlayerLeft);
      store.socket.off('playerRejoined', handlePlayerRejoined);
    };
  }, [store, gameName, user, navigate]);

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
      toast.info(`${user.username} ha salido de la partida.`);
  
      if (!store.currentUserGame) {
        navigate('/play/join');
      } else {
        navigate(`/play/${store.currentGameName}`);
      }
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  };

  return (
    <div>
      <h1>Detalles del Juego</h1>
      <button onClick={handleLeaveGame}>Abandonar Partida</button>
      <ToastContainer />
    </div>
  );
});

export default GamePage;
