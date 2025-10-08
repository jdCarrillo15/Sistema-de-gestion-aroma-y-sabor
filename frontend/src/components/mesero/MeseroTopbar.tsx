import React from 'react';
import { Search, User } from 'lucide-react';
import { getCurrentUser } from '../../services/login/authService';
import '../../styles/mesero/MeseroTopbar.css';

const MeseroTopbar: React.FC = () => {
  const user = getCurrentUser();

  return (
    <header className="mesero-topbar">
      <div className="topbar-container">
        <div className="topbar-search">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar mesa..."
            className="search-input"
          />
        </div>

        <div className="topbar-right">
          <div className="topbar-user">
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.email?.split('@')[0] || 'Mesero'}</span>
              <span className="user-role">Mesero</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MeseroTopbar;