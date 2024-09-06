import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth.context';
import ReactModal from 'react-modal';
import ProfilePictureFormWindow from './ProfilePictureFormWindow';
import { useNavigate } from 'react-router-dom';
import '../../css/ProfilePage.css';

function ProfilePage() {
  const {
    user,
    loading,
    error,
    fetchUserProfile,
    authenticated,
    connectionTime,
    deleteUserAccount,
  } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  useEffect(() => {
    if (!authenticated && !loading) {
      navigate('/auth/login');
    }
  }, [authenticated, loading, navigate]);

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
              <p>Contraseña: {user.profile.password}</p>
              <p>Foto:</p>
              {user.profile.profilePicture && (
                <img
                  src={`http://localhost:3000${user.profile.profilePicture}`}
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
              <button onClick={openModal}>Actualizar foto de perfil</button>
              <ReactModal
                isOpen={showModal}
                onRequestClose={closeModal}
                contentLabel="Actualizar Foto de Perfil"
              >
                <ProfilePictureFormWindow
                  onClose={closeModal}
                  username={user.profile.username}
                  onProfilePictureUpdate={fetchUserProfile}
                />
              </ReactModal>
              <button onClick={() => navigate(`/users/profile/${user.profile.username}/change-email`)}>Actualizar correo electrónico</button>
              <button onClick={() => navigate(`/users/profile/${user.profile.username}/change-password`)}>Actualizar contraseña</button>
            
              <p>Partidas jugadas: {user.profile.gamesPlayed}</p>
              <p>Partidas ganadas: {user.profile.gamesWon}</p>
              <p>Partidas perdidas: {user.profile.gamesLost}</p>
              <p>Tiempo de Conexión: {connectionTime || 'Cargando...'}</p>
              <button onClick={() => deleteUserAccount(user.profile.username).then(() => navigate('/'))}>
                Eliminar cuenta
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProfilePage;
