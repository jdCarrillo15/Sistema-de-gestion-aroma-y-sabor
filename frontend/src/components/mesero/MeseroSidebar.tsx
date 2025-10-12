import React from 'react';
import { NavLink } from 'react-router-dom';
import { Coffee, UtensilsCrossed } from 'lucide-react';
import styles from '../../styles/mesero/MeseroSidebar.module.css';

const menuItems = [
  { to: '/mesero', label: 'Mesas', icon: UtensilsCrossed },
];

const MeseroSidebar: React.FC = () => {
  return (
    <aside className={styles.meseroSidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logoBox}>
          <Coffee className={styles.logoIcon} />
        </div>
        <div className={styles.brandBox}>
          <h3 className={styles.brandTitle}>Aroma y Sabor</h3>
          <p className={styles.brandSub}>Panel Mesero</p>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/mesero'}
                className={({ isActive }) =>
                  `${styles.sidebarLink} ${isActive ? styles.active : ''}`
                }
              >
                <Icon className={styles.linkIcon} />
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