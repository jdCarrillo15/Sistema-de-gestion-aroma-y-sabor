import React from "react";
import { NavLink, Link } from "react-router-dom";
import Button from "../Button.tsx";
import {
  Coffee,
  Users,
  Clock,
  Package,
  TrendingUp,
  Activity,
  LogOut,
} from "lucide-react";
import "../../styles/Sidebar.css";

const menuItems = [
  { to: "/admin", label: "Dashboard", icon: Activity },
  { to: "/admin/productos", label: "Gestión de Productos", icon: Coffee },
  { to: "/admin/usuarios", label: "Gestión de Usuarios", icon: Users },
  { to: "/admin/turnos", label: "Asignación de Turnos", icon: Clock },
  { to: "/admin/inventario", label: "Inventario", icon: Package },
  { to: "/admin/ventas", label: "Ventas por Turnos", icon: TrendingUp },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar open">
      <div className="sidebar-header">
        <div className="logo-box">
          <Coffee className="logo-icon" />
        </div>
        <div className="brand-box">
          <h3 className="brand-title">Aroma y Sabor</h3>
          <p className="brand-sub">Panel Administrativo</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
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
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button type="button" variant="primary" className="logout-btn">
            <LogOut className="link-icon" />
            <span>Cerrar Sesión</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
