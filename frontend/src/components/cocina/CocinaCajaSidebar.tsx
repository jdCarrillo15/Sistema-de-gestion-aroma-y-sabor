import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { logoutUser } from '../../services/login/authService';
import { Coffee, ChefHat, DollarSign, LogOut } from 'lucide-react';
import '../../styles/cocina/CocinaCajaSidebar.css';
import { useUser } from '../../context/userContext';

const menuItems = [
  { to: '/cocina', label: 'Cocina', icon: ChefHat },
  { to: '/caja', label: 'Caja', icon: DollarSign },
];

const CocinaCajaSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleLogout = () => {
    (async () => {
      try {
        await logoutUser();
      } finally {
        try {
          setUser(null);
        } catch (err) {
        }
        navigate('/');
      }
    })();
  };

  return (
    <aside className="cocina-caja-sidebar">
      <div className="sidebar-header">
        <div className="logo-box">
          <Coffee className="logo-icon" />
        </div>
        <div className="brand-box">
          <h3 className="brand-title">Aroma y Sabor</h3>
          <p className="brand-sub">Panel de cocina</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/cocina'}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
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
  );
};

export default CocinaCajaSidebar;