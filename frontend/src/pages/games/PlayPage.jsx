import React from 'react';
import { Link } from 'react-router-dom';

function PlayPage() {
  return (
    <div>
      <h2>Selecciona una opción</h2>
      <Link to="/join-game">Unirse a una Partida</Link>
      <Link to="/create-game">Crear una Nueva Partida</Link>
    </div>
  );
}

export default PlayPage;
