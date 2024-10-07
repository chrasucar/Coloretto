import React, { useState } from 'react';
import { useAuth } from '../../context/auth.context';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/users/EmailFormPage.css';

import { FaEnvelope } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

function EmailFormPage() {

  const { handleUpdateEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { username } = useParams();
  const navigate = useNavigate();

  // Actualizar email correctamente.

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await handleUpdateEmail(username, password, email);

      navigate(`/users/profile/${username}`);

    } catch (error) {

      setError(error.message);

    }
  };

  // Cancelar ventana.

  const handleCancel = () => {
    navigate(`/users/profile/${username}`);
  };

  return (
    <div className="email-form">
      <h2>Actualizar correo</h2>
      {error && <p className='error'>{error}</p>}
      <form onSubmit={handleSubmit}>
          <div className = "inputsEmailUpdate">
          <input
            name="password"
            type="password"
            placeholder='Contraseña actual'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <RiLockPasswordFill className="icon"/> 
          </div>
          <div className = "inputsEmailUpdate">
          <input
            name="password"
            type="email"
            placeholder='Nuevo correo electrónico'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FaEnvelope className="icon"/>
          </div>
          <div className="button-container">
          <button type="submit" className='button-update'>Actualizar</button>
          <button type="button" className='button-cancel' onClick={handleCancel}>Cancelar</button>
          </div>
      </form>
    </div>
  );
}

export default EmailFormPage;
