import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth.context';
import ReactModal from 'react-modal';
import ProfilePictureFormWindow from './ProfilePictureFormWindow';
import { useNavigate } from 'react-router-dom';
import '../../css/ProfilePage.css';

function ConfirmDeleteModal({ onCancel, onConfirm }) {
  return (
    <ReactModal
      isOpen={true}
      onRequestClose={onCancel}
      contentLabel="Confirmar eliminación de cuenta"
    >
      <h2>¿Estás seguro de que deseas eliminar tu cuenta?</h2>
      <button onClick={onConfirm}>Eliminar</button>
      <button onClick={onCancel}>Cancelar</button>
    </ReactModal>
  );
}

function ProfilePage() {
  const {
    user,
    loading,
    error,
    fetchUserProfile,
    authenticated,
    connectionTime,
    contacts,
    deleteUserAccount,
  } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const navigate = useNavigate();

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const handleProfilePictureUpdate = async () => {
    await fetchUserProfile(user.profile.username);
  };

  const handleOpenEmailForm = () => {
    navigate(`/users/profile/${user.profile.username}/change-email`);
  };

  const handleOpenPasswordForm = () => {
    navigate(`/users/profile/${user.profile.username}/change-password`);
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  const handleConfirmDelete = async () => {
    await deleteUserAccount(user.profile.username);
    setShowConfirmDelete(false);
    navigate('/'); 
  };

  useEffect(() => {
    if (!authenticated && !loading) {
      navigate('/auth/login');
    }
    setAuthChecked(true);
  }, [authenticated, loading, navigate]);

  // Se quitará la contraseña del perfil más adelante. Ahora sirve para probar ejecuciones.

  return (
    <div className="profile-container">
      <h2>Perfil de Usuario</h2>
      {loading ? (
        <p>Cargando perfil...</p>
      ) : error && error.message ? (
        <p>Error al cargar el perfil: {error.message}</p>
      ) : (
        <>
          {user && user.profile ? (
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
                  onProfilePictureUpdate={handleProfilePictureUpdate}
                />
              </ReactModal>
              <button onClick={handleOpenEmailForm}>
                Actualizar correo electrónico
              </button>
              <button onClick={handleOpenPasswordForm}>
                Actualizar contraseña
              </button>
              <p>Contactos:</p>
              <ul className="contact-list">
                {contacts && contacts.length > 0 ? (
                  contacts.map((contact, index) => (
                    <li key={index}>
                      <p>{contact}</p>
                    </li>
                  ))
                ) : (
                  <li>No hay contactos.</li>
                )}
              </ul>
              <p>Partidas jugadas: {user.profile.gamesPlayed}</p>
              <p>Partidas ganadas: {user.profile.gamesWon}</p>
              <p>Partidas perdidas: {user.profile.gamesLost}</p>
              <div>
                <p>
                  Tiempo de Conexión:{' '}
                  {connectionTime === null
                    ? 'Cargando...'
                    : connectionTime === 'Conectado.'
                      ? 'Conectado'
                      : `Conectado hace ${connectionTime}`}
                </p>
              </div>
              <button onClick={handleDeleteClick}>Eliminar cuenta</button>
            </div>
          ) : (
            <p>No se encontraron datos de perfil</p>
          )}
        </>
      )}
      {showConfirmDelete && (
        <ConfirmDeleteModal
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

export default ProfilePage;
