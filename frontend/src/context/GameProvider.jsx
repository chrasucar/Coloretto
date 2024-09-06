// src/context/GameProvider.jsx
import React from 'react';
import { createContext, useContext } from 'react';
import gameStore from './GameStore';

const GameContext = createContext(gameStore);

export const GameProvider = ({ children }) => {
  return (
    <GameContext.Provider value={gameStore}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameStore = () => useContext(GameContext);