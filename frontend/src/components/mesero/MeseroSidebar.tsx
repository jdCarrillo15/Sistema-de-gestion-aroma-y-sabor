import React from 'react';
import { NavLink } from 'react-router-dom';
import { Coffee, UtensilsCrossed } from 'lucide-react';
import '../../styles/mesero/MeseroSidebar.css';

const menuItems = [
  { to: '/mesero', label: 'Mesas', icon: UtensilsCrossed },
];

const MeseroSidebar: React.FC = () => {
  return (
    <aside className="mesero-sidebar">
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
              >
                <Icon className="link-icon" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </nav>
    </aside>
  );
};

export default MeseroSidebar;