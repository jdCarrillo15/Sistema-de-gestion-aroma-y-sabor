import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, LogOut, ChevronDown } from 'lucide-react';
import { getCurrentUser, logoutUser } from '../../services/login/authService';
import '../../styles/mesero/MeseroTopbar.css';

const MeseroTopbar: React.FC = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

 
  useEffect(() => {
    if (isDropdownOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="mesero-topbar">
      <div className="topbar-container">
        <div className="topbar-search">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar mesa..."
            className="search-input"
          />
        </div>

        <div className="topbar-right">
          <div className="topbar-user-dropdown" ref={dropdownRef}>
            <button 
              className="topbar-user-button"
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <div className="user-avatar">
                <User size={20} />
              </div>
              <div className="user-info">
                <span className="user-name">{user?.email?.split('@')[0] || 'Mesero'}</span>
                <span className="user-role">Mesero</span>
              </div>
              <ChevronDown 
                className={`dropdown-icon ${isDropdownOpen ? 'open' : ''}`} 
                size={20} 
              />
            </button>

            {isDropdownOpen && (
              <>
                {/* Backdrop para móvil */}
                <div className="dropdown-backdrop" onClick={() => setIsDropdownOpen(false)}></div>
                
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="dropdown-name">{user?.email?.split('@')[0] || 'Mesero'}</p>
                        <p className="dropdown-email">{user?.email || ''}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button 
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MeseroTopbar;