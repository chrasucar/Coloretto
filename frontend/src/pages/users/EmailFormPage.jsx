import React, { useState } from 'react';
import { useAuth } from '../../context/auth.context';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/EmailFormPage.css';

function EmailFormPage() {
  const { handleUpdateEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const { username } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      await handleUpdateEmail(username, password, email);

      navigate(`/users/profile/${username}`);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleCancel = () => {
    navigate(`/users/profile/${username}`);
  };

  return (
    <div className="email-form">
      <h2>Actualizar correo electrónico</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Contraseña:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label>
          Nuevo correo electrónico:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

export default EmailFormPage;
