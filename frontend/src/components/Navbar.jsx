import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.context';
import '../css/Navbar.css';

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
      {location.pathname !== '/auth/login' && (
        <h1>
          <Link to="/">Coloretto</Link>
        </h1>
      )}
      <ul>
        {authenticated ? (
          <>
            <li>Bienvenido {user.username}</li>
            <li>
              <Link to={`/users/profile/${user.username}`}>Mi Perfil</Link>
            </li>
            <li>
              <Link to="/users/play">Jugar</Link>
            </li>
            <li>
              <Link to="/" onClick={handleLogout}>
                Cerrar Sesión
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
