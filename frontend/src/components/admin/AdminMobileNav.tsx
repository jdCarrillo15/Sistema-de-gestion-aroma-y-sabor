import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Coffee,
  Users,
  Clock,
  Package,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react';
import '../../styles/admin/AdminMobileNav.css';

const menuItems = [
  { to: '/admin', label: 'Inicio', icon: Activity },
  { to: '/admin/productos', label: 'Productos', icon: Coffee },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/turnos', label: 'Turnos', icon: Clock },
  { to: '/admin/inventario', label: 'Inventario', icon: Package },
  { to: '/admin/ventas', label: 'Ventas', icon: TrendingUp },
  { to: '/admin/mesas', label: 'Mesas', icon: UtensilsCrossed },
];

const AdminMobileNav: React.FC = () => {
  return (
    <nav className="admin-mobile-nav">
      <div className="mobile-nav-scroll">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin'}
              className={({ isActive }) =>
                `mobile-nav-btn ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default AdminMobileNav;