import React, { useEffect } from 'react';
import { useAuth } from '../../context/auth.context';
import { useNavigate } from 'react-router-dom';
import '../../css/ProfilePage.css';

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

  useEffect(() => {
    if (!authenticated && !loading) {
      navigate('/auth/login');
    }
  }, [authenticated, loading, navigate]);

  const handleDeleteAccount = async () => {

    const isConfirmed = window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.');

    if (!isConfirmed) return;
  
    try {

      await deleteUserAccount(user.profile.username);

      navigate('/');

    } catch (error) {

      alert('Error al eliminar la cuenta. Inténtalo de nuevo más tarde.');

    }
  };

  return (
    <div className="profile-container">
      <h2>Perfil de Usuario</h2>
      {loading ? (
        <p>Cargando perfil...</p>
      ) : error && error.message ? (
        <p>Error al cargar el perfil: {error.message}</p>
      ) : (
        <>
          {user && user.profile && (
            <div>
              <p>Nombre y Apellidos: {user.profile.fullname}</p>
              <p>Nombre de Usuario: {user.profile.username}</p>
              <p>Correo Electrónico: {user.profile.email}</p>
              <p>Foto:</p>
              {user.profile.profilePicture && (
                <img
                  src={`http://localhost:3000/${user.profile.profilePicture}`}
                  alt="Foto"
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              )}
              <button onClick={() => navigate(`/users/profile/${user.profile.username}/change-email`)}>Actualizar correo electrónico</button>
              <button onClick={() => navigate(`/users/profile/${user.profile.username}/change-password`)}>Actualizar contraseña</button>
              <button onClick={() => navigate(`/users/profile/${user.profile.username}/update-profile-picture`)}>Actualizar foto de perfil</button>
            
              <p>Partidas jugadas: {user.profile.gamesPlayed}</p>
              <p>Partidas ganadas: {user.profile.gamesWon}</p>
              <p>Partidas perdidas: {user.profile.gamesLost}</p>
              <p>{connectionTime !== null ? connectionTime : 'No disponible'}</p>
              <button onClick={handleDeleteAccount}>Eliminar cuenta</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProfilePage;
