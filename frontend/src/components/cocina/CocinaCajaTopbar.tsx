import React from 'react';
import { Clock, User } from 'lucide-react';
import { getCurrentUser } from '../../services/login/authService';
import '../../styles/cocina/CocinaCajaTopbar.css';

const CocinaCajaTopbar: React.FC = () => {
  const user = getCurrentUser();

  return (
    <header className="cocina-caja-topbar">
      <div className="topbar-container">
        <div className="topbar-left">
          <h2 className="topbar-title">Sistema de Pedidos</h2>
        </div>

        <div className="topbar-right">
          <Clock className="clock-icon" size={20} />
          <div className="topbar-user">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <span className="user-name">
                {user?.email?.split('@')[0] || 'Usuario'}
              </span>
              <span className="user-role"></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CocinaCajaTopbar;