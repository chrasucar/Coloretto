import React, { useState } from 'react';
import { useAuth } from '../../context/auth.context';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/users/PasswordFormPage.css';

import { RiLockPasswordFill, RiLockPasswordLine } from "react-icons/ri";
import { TbPasswordUser } from "react-icons/tb";

function PasswordFormPage() {

  const { handleUpdatePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [error, setError] = useState(null);
  const { username } = useParams();
  const navigate = useNavigate();

  // Cambiar de contraseña correctamente.

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const res = await handleUpdatePassword(username, password, newPassword, verifyPassword);

      navigate(`/users/profile/${username}`);

      if (!res) {

        throw new Error('Debe proporcionar una contraseña válida.');

      }

    } catch (error) {

      setError(error.message);

    }
  };

  // Cancelar ventana.

  const handleCancel = () => {
    navigate(`/users/profile/${username}`);
  };

  return (
    <div className="password-form">
      <h2>Actualizar contraseña</h2>
      {error && <p className='error'>{error}</p>}
      <form onSubmit={handleSubmit}>
          <div className = "inputsPasswordUpdate">
          <input
            type="password"
            name="password"
            placeholder='Contraseña actual'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <RiLockPasswordFill className="icon"/> 
          </div>
          <div className = "inputsPasswordUpdate">
          <input
            type="text"
            name="newPassword"
            value={newPassword}
            placeholder='Nueva contraseña'
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TbPasswordUser className="icon"/> 
          </div>
          <div className = "inputsPasswordUpdate">
          <input
            type="password"
            name="verifyPassword"
            value={verifyPassword}
            placeholder='Verifica la contraseña'
            onChange={(e) => setVerifyPassword(e.target.value)}
            required
          />
          <RiLockPasswordLine className="icon"/> 
          </div>
        <div className="button-container">
        <button type="submit" className='button-update'>Actualizar</button>
        <button type="button" className='button-cancel' onClick={handleCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}

export default PasswordFormPage;
