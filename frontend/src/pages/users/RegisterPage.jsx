import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/auth.context';
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../css/RegisterPage.css';
import ModalSuccessRegister from './ModalSuccessRegister';

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

  const handleRegisterSuccess = () => {
    setLocalError(null);
    setShowModal(true);
    const timer = setTimeout(() => {
      navigate('/auth/login');
    }, 5000);
    return () => clearTimeout(timer);
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const isSuccess = await signUp(values);
      if (isSuccess) {
        handleRegisterSuccess();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        setLocalError(error.response.data.message);
      } else {
        setLocalError('Ha ocurrido un error al procesar la solicitud.');
      }
    }
  });

  const Register = () => {
    useEffect(() => {
      if (authenticated) {
        navigate('/');
      }
    });
  
    return null;
  };

  return (
    <div className="register-container">
      <h2>Registro</h2>
      {registerError.map((error, i) => (
        <div key={i}>{error}</div>
      ))}
      <Register />
      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Nombre y apellidos"
          {...register('fullname', {
            required: true,
            minLength: 3,
            maxLength: 30,
          })}
        />
        {errors.fullname && <p>Nombre y apellidos requerido.</p>}
        <input
          type="text"
          placeholder="Usuario"
          {...register('username', { required: true })}
        />
        {errors.username && <p>Usuario requerido.</p>}
        <input
          type="email"
          placeholder="Correo electrónico"
          {...register('email', { required: true })}
        />
        {errors.email && <p>Correo electrónico requerido.</p>}
        <input
          type="password"
          placeholder="Contraseña"
          {...register('password', { required: true })}
        />
        {errors.password && <p>Contraseña requerida.</p>}
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
