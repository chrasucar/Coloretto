import React, { useState, useEffect } from 'react';
import { useAuth } from './context/auth.context';
import { Navigate, Outlet } from 'react-router-dom';

function PrivateRoute() {
  const { loading, authenticated } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoading(false);
    }, 1500);

    return () => clearTimeout(timeout);
  }, []);

  if (loading || showLoading) {
    return <h1>Cargando...</h1>;
  }

  if (!authenticated) {
    return <Navigate to="/auth/login" replace state={{ from: window.location }} />;
  }

  return (
    <div>
      <Outlet />
    </div>
  );
}

export default PrivateRoute;
