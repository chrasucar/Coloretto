import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../context/GameProvider';
import { useAuth } from '../../context/auth.context';

const InitialGamePage = () => {
  const navigate = useNavigate();
  const store = useGameStore();
  const { user } = useAuth();
  const [hasGame, setHasGame] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Inicio del botón Jugar, elegir entre Crear partida o unirse. 
  // Si ya tiene una partida, directamente va a la lista de partidas.

  useEffect(() => {
    const checkUserGame = async () => {
      if (user) {
        try {
          const userGame = await store.fetchUserGame(user.username); 
          setHasGame(!!userGame);
          
          if (userGame) {
            navigate('/play/join');
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            setHasGame(false);
          } else {
            console.error('Error obteniendo la partida del usuario:', error);
            setHasGame(false); 
          }
        }
      }
    };
    
    checkUserGame();
  }, [user, store, navigate]);

  const handleCreateGame = () => {
    navigate('/create');
  };

  const handleJoinGame = () => {
    navigate('/play/join');
  };

  return (
    <div>
      <h1>¿Quiere jugar? ¡Elige la opción que más desee!</h1>
      {!hasGame && (
        <button onClick={handleCreateGame}>
          Crear Partida
        </button>
      )}
      <button onClick={handleJoinGame}>Unirse</button>
    </div>
  );
};

export default InitialGamePage;
