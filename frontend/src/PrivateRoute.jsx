import React, { useState, useEffect } from 'react';
import { useAuth } from './context/auth.context';
import { Navigate, Outlet } from 'react-router-dom';
import './css/PrivateRoute.css';

function PrivateRoute() {

  const { loading, authenticated } = useAuth();
  const [percentage, setPercentage] = useState(0);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {

    if (percentage < 100) {

      const interval = setInterval(() => {

        const increment = Math.floor(Math.random() * 10) + 1;

        setPercentage((prev) => Math.min(prev + increment, 100));

      }, 150);

      return () => clearInterval(interval);

    } else {

      setShowLoading(false);

    }

  }, [percentage]);


  if (loading || showLoading) {

    return (
      <div className="loading-container">
      <div className="circle">
        <h1>{percentage}%</h1>
      </div>
      </div>
    );
  }

  if (!authenticated) {

    return <Navigate to="/" replace />;
    
  }

  return <Outlet />;
}

export default PrivateRoute;
