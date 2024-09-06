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
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [isAiControlled, setIsAiControlled] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Crear partida correctamente.

  const handleCreateGame = async () => {

    if (maxPlayers < 1 || maxPlayers > 5) {
      alert('El número de jugadores debe de estar entre 1 y 5.');
      return;
    }
  
    try {
  
      await store.createGame(
        gameName, 
        maxPlayers, 
        isAiControlled, 
        user.username
      );
  
      alert('Partida creada correctamente.');
      navigate('/play/join');
    } catch (error) {
      console.error('Error creando la partida:', error);
    }
  };

  return (
    <div>
      <h1>Crear Partida</h1>

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
        min={1} 
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
      <button onClick={handleCreateGame}>Crear</button>
    </div>
  );
});

export default CreateGame;
