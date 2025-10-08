import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { logoutUser } from '../../services/login/authService';
import { Coffee, UtensilsCrossed, LogOut, Menu, X } from 'lucide-react';
import '../../styles/mesero/MeseroSidebar.css';

const menuItems = [
  { to: '/mesero', label: 'Mesas', icon: UtensilsCrossed },
];

const MeseroSidebar: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <>
      
      <button 
        className="toggle-sidebar-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`mesero-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-box">
            <Coffee className="logo-icon" />
          </div>
          <div className="brand-box">
            <h3 className="brand-title">Aroma y Sabor</h3>
            <p className="brand-sub">Panel Mesero</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/mesero'}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="link-icon" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Button 
            type="button" 
            variant="primary" 
            className="logout-btn"
            onClick={handleLogout}
          >
            <LogOut className="link-icon" />
            <span>Cerrar Sesión</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export default MeseroSidebar;
