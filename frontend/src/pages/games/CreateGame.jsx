import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useGameStore } from '../../context/GameProvider';
import { useAuth } from '../../context/auth.context';
import { useNavigate } from 'react-router-dom';

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
      }, 1000);
    } catch (error) {
      setError('Error creando la partida. Intenta de nuevo.');
      console.error('Error creando la partida:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Crear Partida</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input 
        type="text" 
        placeholder="Nombre de la partida" 
        value={gameName} 
        onChange={(e) => setGameName(e.target.value)} 
      />
      <input 
        type="number" 
        placeholder="Máximo de jugadores" 
        value={maxPlayers} 
        min={2} 
        max={5}
        onChange={(e) => setMaxPlayers(Number(e.target.value))} 
      />
      <label>
        ¿Jugar contra la IA?
        <input 
          type="checkbox" 
          checked={isAiControlled} 
          onChange={(e) => setIsAiControlled(e.target.checked)} 
        />
      </label>

      <div>
        <label>
          Nivel de dificultad:
          <select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)}>
            <option value="Básico">Básico</option>
            <option value="Experto">Experto</option>
          </select>
        </label>
      </div>

      {isGameCreated ? (
        <p>Ha creado la partida. Redirigiendo...</p>
      ) : (
        <button onClick={handleCreateGame} disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear'}
        </button>
      )}
    </div>
  );
});

export default CreateGame;
