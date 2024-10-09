import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth.context';
import { useNavigate } from 'react-router-dom';
import '../../css/users/ProfilePage.css';

import { BsFillPencilFill } from "react-icons/bs";
import { HiStatusOnline } from "react-icons/hi";
import { GiCardDraw } from "react-icons/gi";

function ProfilePage() {
  const {
    user,
    loading,
    error,
    authenticated,
    connectionTime,
    deleteUserAccount,
  } = useAuth();

  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!authenticated && !loading) {
      navigate('/auth/login');
    }
  }, [authenticated, loading, navigate]);

  const handleDeleteAccount = async () => {

    const isConfirmed = window.confirm('¿Estás seguro de que deseas eliminar tu cuenta?');

    if (!isConfirmed) return;
  
    try {

      await deleteUserAccount(user.profile.username);

      setSuccessMessage('Cuenta eliminada correctamente.');

      setTimeout(() => navigate('/'), 2000);

    } catch (error) {

      alert('Error al eliminar la cuenta. Inténtalo de nuevo más tarde.');

    }
  };

  return (
    <div className="profile-container">
      <h2>Perfil de usuario</h2>
      {loading ? (
        <p>Cargando perfil...</p>
      ) : error && error.message ? (
        <p>Error al cargar el perfil: {error.message}</p>
      ) : (
        <div className="profile-info">
        {successMessage && <div className="alert">{successMessage}</div>}
        {user && user.profile && (
          <div className="user-details">
          <div className="profile-picture">
          {user.profile.profilePicture && (
          <img className='photo' src={`http://localhost:3000/${user.profile.profilePicture}`} alt="Foto de perfil"
          onClick={() => navigate(`/users/profile/${user.profile.username}/update-profile-picture`)}
          />)}
          <div className="connection-status">
            <HiStatusOnline className="status-icon" />
            <p>{connectionTime !== null ? connectionTime : 'No disponible'}</p>
          </div>
          </div>

              <div className="user-data">
                <p><strong>Nombre y Apellidos:</strong> {user.profile.fullname}</p>
                <p><strong>Nombre de usuario:</strong> {user.profile.username}</p>
                <p>
                  <strong>Correo electrónico:</strong> {user.profile.email}
                  <BsFillPencilFill
                    className="update-icon"
                    title="Actualizar correo electrónico"
                    onClick={() =>
                      navigate(`/users/profile/${user.profile.username}/change-email`)
                    }
                  />
                </p>
              </div>

              <div className="user-stats">
              <GiCardDraw className = "icon-game"/>
              <p className='games'>Partidas jugadas: {user.profile.gamesPlayed}</p>
              <p className='games'>Partidas ganadas: {user.profile.gamesWon}</p>
              <p className='games'>Partidas perdidas: {user.profile.gamesLost}</p>
              </div>
              <div className="user-actions">
              <button className="button-password" onClick={() => navigate(`/users/profile/${user.profile.username}/change-password`)}>Actualizar contraseña</button>
              <button className="button-delete" onClick={handleDeleteAccount}>Eliminar cuenta</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
