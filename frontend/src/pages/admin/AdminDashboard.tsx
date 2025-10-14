import React from "react";
import "../../styles/admin/AdminDashboard.css";
import { Package, Users, DollarSign, AlertTriangle } from "lucide-react";
import { useSocket } from "../../context/socketContext";

interface StatCardProps {
  label: string;
  value: string | number;
  change: string;
  icon: React.ElementType;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, icon: Icon, bgColor }) => {
  return (
    <div className="stat-card">
      <div className="stat-left">
        <div className="stat-icon" style={{ backgroundColor: bgColor }}>
          <Icon size={22} color="#333" />
        </div>
        <div>
          <h3 className="stat-value">{value}</h3>
          <p className="stat-label">{label}</p>
        </div>
      </div>
      <div className={`stat-change ${change.startsWith("-") ? "negative" : "positive"}`}>
        {change}
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { connectedUsers } = useSocket();
  const stats = [
    { label: "Productos Totales", value: 48, change: "+12%", icon: Package, bgColor: "#FFF4E6" },
    { label: "Usuarios Activos", value: connectedUsers.length, change: "+8%", icon: Users, bgColor: "#F0F6FF" },
    { label: "Ventas Hoy", value: "$1,248", change: "+15%", icon: DollarSign, bgColor: "#EFFFF3" },
    { label: "Inventario Bajo", value: 7, change: "-5%", icon: AlertTriangle, bgColor: "#FFF2F2" },
  ];

  return (
    <section className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-sub">Bienvenido de vuelta, Admin</p>
        </div>
        <button className="primary-btn">+ Nuevo Producto</button>
      </div>

      {/* Notificaciones */}
      {connectedUsers.length > 0 && (
        <div className="admin-notif">
          <h4>Últimas conexiones</h4>
          <ul>
            {connectedUsers.slice(-5).map((u, i) => {
              const user = (u as unknown) as { role: string; timestamp: string, name: string };
              return (
                <li key={i}>
                  <strong>{user.name}</strong> ({user.role}) conectado —{" "}
                  {new Date(user.timestamp).toLocaleTimeString()}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            icon={stat.icon}
            bgColor={stat.bgColor}
          />
        ))}
      </div>
    </section>
  );
};

export default AdminDashboard;
