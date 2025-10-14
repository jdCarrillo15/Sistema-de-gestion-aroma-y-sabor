import React from 'react';
import { Calendar } from 'lucide-react';
import { getCurrentUser } from '../../services/login/authService';
import '../../styles/cocina/CocinaCajaTopbar.css';

const CocinaCajaTopbar: React.FC = () => {
  const user = getCurrentUser();
  const userName = user?.email?.split('@')[0] || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <header className="cocina-caja-topbar">
      <div className="topbar-container">
        <div className="topbar-left">
          <h3 className="topbar-title">Sistema de Pedidos</h3>
        </div>

        <div className="topbar-right">
          <button className="topbar-calendar-button" aria-label="Calendario">
            <Calendar className="topbar-icon" />
          </button>

          <div className="topbar-user">
            <div className="topbar-avatar">
              {userInitial}
            </div>
            <span className="topbar-username">
              {userName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default CocinaCajaTopbar;