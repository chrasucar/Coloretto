import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/auth.context';
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../css/users/RegisterPage.css';
import ModalSuccessRegister from '../../components/ModalSuccessRegister';

import { FaHouseUser, FaUser, FaEnvelope } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";

function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { signUp, authenticated, error: registerError } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Registrarse correctamente.

  const onSubmit = async (values) => {

    try {

      await signUp(values);
      setLocalError(null);
      setShowModal(true);
      const timer = setTimeout(() => { navigate('/auth/login');}, 5000);
      return () => clearTimeout(timer);

    } catch (error) {

      if (error.response && error.response.data) {

        setLocalError(error.response.data.message);

      } else {

        setLocalError("Ocurrió un error al registrarse.");

      }
    }
  };

  useEffect(() => {
    if (authenticated) {
      navigate('/');
    }
  }, [authenticated, navigate]);

  return (
    <div className="register-container">
      <h2>Registro</h2>
       {Array.isArray(registerError) && registerError.length > 0 ? (
        registerError.map((error, i) => (
          <div key={i}>{error}</div>
        ))
      ) : (
        registerError && <div>{registerError}</div>
      )}
      {localError && <p>{localError}</p>}
      <form onSubmit={handleSubmit(onSubmit)}>
        {errors.fullname && <p className='error'>{errors.fullname.message}</p>}
        <div className = "inputsRegister">
        <input
          type="text"
          name="fullname"
          placeholder="Nombre y apellidos"
          {...register('fullname', {
            required: 'Por favor, introduce nombre y apellidos.',
            minLength: 3,
            maxLength: 30,
          })}
        />
        <FaHouseUser className="icon"/>
        </div>
        {errors.username && <p className='error'>{errors.username.message}</p>}
        <div className = "inputsRegister">
        <input
          type="text"
          placeholder="Usuario"
          name="username"
          {...register('username', { required: 'Por favor, introduce un usuario.' })}
        />
        <FaUser className="icon"/>
        </div>
        {errors.email && <p className='error'>{errors.email.message}</p>}
        <div className = "inputsRegister">
        <input
          type="email"
          name="email"
          placeholder="Correo electrónico"
          {...register('email', { required: 'Por favor, introduce tu correo electrónico.' })}
        />
        <FaEnvelope className="icon" />
        </div>
        {errors.password && <p className='error'>{errors.password.message}</p>}
        <div className = "inputsRegister">
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          {...register('password', { required: 'Por favor, introduce una contraseña.' })}
        />
        <RiLockPasswordFill className="icon"/>   
        </div>
        <button type="submit">Registrarse</button>
      </form>
      <p>
        ¿Tienes una cuenta de usuario?{' '}
        <Link to="/auth/login">Inicia sesión aquí.</Link>
      </p>
      {showModal && <ModalSuccessRegister />}
    </div>
  );
}

export default RegisterPage;
