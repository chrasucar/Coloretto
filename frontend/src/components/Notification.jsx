import React, { useState } from 'react';
import { useAuth } from '../context/auth.context';
import { AiOutlineBell } from 'react-icons/ai';
import '../css/Notification.css';

const Notification = ({ notifications = [] }) => {
  
  const { authenticated } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleBellClick = () => {
    setShowNotifications(!showNotifications);
  };

  if (!authenticated) {
    return null;
  }

  return (
    <div className="notification-bell-container">
      <div className="notification-bell" onClick={handleBellClick}>
        <AiOutlineBell size={24} />
      </div>
      {showNotifications && (
        <div className="notification-dropdown">
          {notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <p key={index}>{notification}</p>
            ))
          ) : (
            <p>No tienes notificaciones.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
