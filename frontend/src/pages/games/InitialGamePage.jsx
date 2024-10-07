import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../context/GameProvider';
import { useAuth } from '../../context/auth.context';
import '../../css/games/InitialGamePage.css';

const InitialGamePage = () => {
  const navigate = useNavigate();
  const store = useGameStore();
  const { user } = useAuth();
  const [hasGame, setHasGame] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
  }, [user, navigate]);


  useEffect(() => {
    const checkUserGame = async () => {
      if (user) {
        try {
          const userGame = await store.fetchUserGame(user.username); 
          setHasGame(!!userGame);
          
          if (userGame) {
            setHasGame(true);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <h1>¡Empiece a jugar!</h1>
      <div className='buttons'>
      {!hasGame && (
        <button className = "create-game" style={{ backgroundColor: colors[colorIndex] }} onClick={handleCreateGame}>Crear</button>
      )}
        <button className = "join-game" style={{ backgroundColor: colors[colorIndex] }} onClick={handleJoinGame}>Unirse</button>
    </div>
    </div>
  );
};


export default InitialGamePage;
