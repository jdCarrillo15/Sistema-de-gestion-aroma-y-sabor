import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  Coffee,
  Users,
  Clock,
  Package,
  TrendingUp,
} from 'lucide-react';
import '../../styles/admin/AdminMobileNav.css';

const menuItems = [
  { to: '/admin', label: 'Dashboard', icon: Activity },
  { to: '/admin/productos', label: 'Productos', icon: Coffee },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/turnos', label: 'Turnos', icon: Clock },
  { to: '/admin/inventario', label: 'Inventario', icon: Package },
  { to: '/admin/ventas', label: 'Ventas', icon: TrendingUp },
];

const AdminMobileNav: React.FC = () => {
  return (
    <nav className="admin-mobile-nav">
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
            <Icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default AdminMobileNav;