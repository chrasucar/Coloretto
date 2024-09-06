import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { useGameStore } from '../context/GameProvider';
import { useAuth } from '../context/auth.context';

// Función para manejar el timeout

function useTimeout(callback, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setTimeout(() => savedCallback.current(), delay);
      return () => clearTimeout(id); 
    }
  }, [delay]);
}

const AppWrapper = observer(({ children }) => {
  const store = useGameStore();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const inactivityTimer = useRef(null);
  const [isInactive, setIsInactive] = useState(false);
  const [isLeavingGame, setIsLeavingGame] = useState(false);
  const [hasManuallyLeft, setHasManuallyLeft] = useState(false);

  // Manejar la autenticación.

  useEffect(() => {
    if (!user) {
      console.log('Usuario no autenticado, redirigiendo al inicio.');
      navigate('/');
    }
  }, [user, navigate]);

  // Verificar si el usuario está en una página de juego

  const isInGamePage = /^\/play\/[^/]+$/.test(location.pathname) && !/^\/play\/(join|create)$/.test(location.pathname);

  useTimeout(() => {
    if (isInactive && !isLeavingGame && !hasManuallyLeft) {
      setIsLeavingGame(true);
      store.leaveGame(store.currentUserGame, user.username)
        .then(() => {
          runInAction(() => {
            store.setCurrentUserGame('');
          });
          alert('Has abandonado la partida.');
        })
        .catch(error => {
          console.error('Error al abandonar la partida:', error);
        })
        .finally(() => {
          setIsLeavingGame(false);
        });
    }
  }, isInactive ? 5000 : null); // Prueba de 5 segundos, se pondrá a 1 minuto en un futuro.

  // Manejar la navegación fuera de la página de juego.

  useEffect(() => {
    if (!isInGamePage && store.currentUserGame) {
      setIsInactive(true);
    } else {
      setIsInactive(false);
    }
  }, [location.pathname, store.currentUserGame]);

  // Manejar el abandono manual de la partida.

  useEffect(() => {
    if (hasManuallyLeft) {
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = null;
      setIsInactive(false);
    }
  }, [hasManuallyLeft]);

  return <>{children}</>;
});

export default AppWrapper;
