// GameSetupPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/GameSetup.css';

function GameSetup() {
  const [numPlayers, setNumPlayers] = useState(2);
  const [optionalRules, setOptionalRules] = useState({
    bonusCard: false,
    doublePoints: false,
  });
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/game', {
      state: { numPlayers, optionalRules },
    });
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setOptionalRules((prevRules) => ({
      ...prevRules,
      [name]: checked,
    }));
  };

  return (
    <div className="game-setup">
      <h2>Configurar partida</h2>
      <label>
        Número de jugadores:
        <select
          value={numPlayers}
          onChange={(e) => setNumPlayers(e.target.value)}
        >
          <option value={2}>2 jugadores</option>
          <option value={3}>3 jugadores</option>
          <option value={4}>4 jugadores</option>
        </select>
      </label>
      <div>
        <label>
          <input
            type="checkbox"
            name="bonusCard"
            checked={optionalRules.bonusCard}
            onChange={handleChange}
          />
          Carta de bonificación al final de la partida
        </label>
        <label>
          <input
            type="checkbox"
            name="doublePoints"
            checked={optionalRules.doublePoints}
            onChange={handleChange}
          />
          Puntuación doble para ciertos colores
        </label>
      </div>
      <button onClick={handleStartGame}>Iniciar partida</button>
    </div>
  );
}

export default GameSetup;
