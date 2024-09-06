import React, { useState } from 'react';
import { useAuth } from '../../context/auth.context';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/PasswordFormPage.css';

function PasswordFormPage() {

  const { handleUpdatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const { username } = useParams();
  const navigate = useNavigate();

  // Cambiar de contraseña correctamente.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await handleUpdatePassword(
        username,
        password,
        newPassword,
        verifyPassword,
      );
      navigate(`/users/profile/${username}`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  // Cancelar ventana.

  const handleCancel = () => {
    navigate(`/users/profile/${username}`);
  };

  return (
    <div className="password-form">
      <h2>Actualizar contraseña</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Contraseña actual:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Nueva contraseña:
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Verifica la nueva contraseña:
          <input
            type="password"
            value={verifyPassword}
            onChange={(e) => setVerifyPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Guardar cambios</button>
        <button type="button" onClick={handleCancel}>
          Cancelar
        </button>
      </form>
    </div>
  );
}

export default PasswordFormPage;
