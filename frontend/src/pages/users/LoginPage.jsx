import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/auth.context';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ModalSuccessLogin from '../../components/ModalSuccessLogin';
import '../../css/LoginPage.css';

function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { loading, user, signIn, error: loginError, authenticated } = useAuth();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoginSuccessful, setIsLoginSuccessful] = useState(false);

  // Iniciar sesión correctamente.

  const onSubmit = handleSubmit(async (values) => {
    try {
      const isSuccess = await signIn(values);
      if (isSuccess) {
        setShowModal(true);
        setIsLoginSuccessful(true);
        setTimeout(() => {
          setShowModal(false);
          navigate('/');
        }, 5000);
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

  useEffect(() => {
    if (authenticated && !loading && user && !isLoginSuccessful) {
      navigate('/');
    }
  }, [authenticated, loading, user, isLoginSuccessful, navigate]);

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      {localError && <p className="error-message">{localError}</p>}
      {Array.isArray(loginError) &&
        loginError.map((error, i) => (
          <div key={i} className="error-message">
            {error}
          </div>
        ))}

      <form onSubmit={onSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          {...register('username', { required: true })}
        />
        {errors.username && <p className="error-message">Usuario requerido.</p>}

        <input
          type="password"
          placeholder="Contraseña"
          {...register('password', { required: true })}
        />
        {errors.password && (
          <p className="error-message">Contraseña requerida.</p>
        )}

        <button type="submit">Iniciar Sesión</button>
      </form>

      <p>
        ¿No tienes una cuenta de usuario?{' '}
        <Link to="/users/register">Regístrate aquí.</Link>
      </p>
      {showModal && <ModalSuccessLogin />}
    </div>
  );
}

export default LoginPage;
