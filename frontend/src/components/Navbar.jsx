import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.context';
import '../css/Navbar.css';
import camaleonGif from '../assets/gifs/camaleon1.gif';

function Navbar() {
  const { authenticated, logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  return (
    <nav
      className={
        location.pathname === '/auth/login' ||
        location.pathname === '/users/register'
          ? 'hide-menu'
          : ''
      }
    >
        <h1>
          <Link to="/">Coloretto <img src = {camaleonGif} alt = "Camaleón animado 1" className = "camaleon"></img></Link>
        </h1>
      <ul>
        {authenticated ? (
          <>
            <li>
              <Link to="/play">Jugar</Link>
            </li>
            <li>
              <Link to="/chat">Chat</Link>
            </li>
            <li>
              <Link to={`/users/profile/${user.username}`}>Mi Perfil</Link>
            </li>
            <li>
              <Link to="/faqs">Preguntas frecuentes</Link>
            </li>
            <li>
              <Link to="/" onClick={handleLogout}>
                Cerrar sesión
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/auth/login">Iniciar Sesión</Link>
            </li>
            <li>
              <Link to="/users/register">Registrarse</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;
