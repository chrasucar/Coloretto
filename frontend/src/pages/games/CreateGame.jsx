import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameStore } from '../../context/GameProvider';
import { useAuth } from '../../context/auth.context';
import { useNavigate } from 'react-router-dom';
import '../../css/games/CreateGame.css';

const CreateGame = observer(() => {
  const store = useGameStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gameName, setGameName] = useState('');
  const [error, setError] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [isAiControlled, setIsAiControlled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGameCreated, setIsGameCreated] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState('Básico');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const isInAnyGame = store.games.some(game =>
    game.players.includes(user.username) || game.owner === user.username
  );

  const handleCreateGame = async () => {

    if (isInAnyGame) {
      alert('Ya estás en una partida. No puedes crear otra hasta que abandones la actual.');
      navigate('/play/join');
      return;
    }

    if (!gameName.trim()) {
      setError('El nombre de la partida no puede estar vacío.');
      return;
    }

    if (maxPlayers < 2 || maxPlayers > 5) {
      setError('El número de jugadores debe estar entre 2 y 5.');
      return;
    }

    setError('');
    setIsLoading(true);
  
    try {
      await store.createGame(gameName, maxPlayers, isAiControlled, user.username, difficultyLevel);
      setIsGameCreated(true);
      setTimeout(() => {
        navigate(`/play/${gameName}`);
      }, 5000);
    } catch (error) {
      setError('Error creando la partida. Intenta de nuevo.');
      console.error('Error creando la partida:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-game-container">
      <h1>Crear Partida</h1>
      {error && <p className='error'>{error}</p>}
      <div className = "inputs">
      <input 
        type="text" 
        placeholder="Nombre de la partida" 
        value={gameName} 
        onChange={(e) => setGameName(e.target.value)} 
      />
      </div>
      <div className = "inputsPlayers">
      <label>
        Número de jugadores:
      <input 
        name="number"
        type="number" 
        placeholder="Máximo de jugadores" 
        value={maxPlayers} 
        min={2} 
        max={5}
        onChange={(e) => setMaxPlayers(Number(e.target.value))} 
      />
      </label>
      </div>
      <div className = "inputs">
      <label>
        <p className='verify'>¿Jugar contra la IA?</p>
        <input 
          name="verify"
          type="checkbox" 
          checked={isAiControlled} 
          onChange={(e) => setIsAiControlled(e.target.checked)} 
        />
      </label>
      </div>

      <div className = "inputsLevel">
        <label>
          Nivel de dificultad:
          <select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)}>
            <option className="option" value="Básico">Básico</option>
            <option className="option" value="Experto">Experto</option>
          </select>
        </label>
      </div>

      {isGameCreated ? (
        <p className = "gameCreate glow">Ha creado la partida. Redirigiendo...</p>
      ) : (
        <button className = "createGame"onClick={handleCreateGame} disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear'}
        </button>
      )}
    </div>
  );
});

export default CreateGame;
