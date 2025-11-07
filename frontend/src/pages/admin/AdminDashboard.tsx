import React, { useEffect, useState } from "react";
import styles from "../../styles/admin/AdminDashboard.module.css";
import { Package, Users, DollarSign, Utensils } from "lucide-react";
import { useSocket } from "../../context/socketContext";
import { getDashboardStatsWithFallback } from "../../services/admin/dashboardService";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, iconClass }) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLeft}>
        <div className={`${styles.statIcon} ${styles[iconClass]}`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className={styles.statValue}>{value}</h3>
          <p className={styles.statLabel}>{label}</p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { connectedUsers } = useSocket();
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeUsers: 0,
    totalSalesToday: 0,
    totalTables: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Usar el servicio con fallback automático
        const data = await getDashboardStatsWithFallback();
        
        setStats({
          totalProducts: data.totalProducts || 0,
          activeUsers: data.totalUsers || 0,
          totalSalesToday: data.totalSalesToday || 0,
          totalTables: data.totalTables || 0,
        });

      } catch (error: any) {
        console.error("Error cargando estadísticas del dashboard:", error);
        setError(error.message || "Error al cargar las estadísticas");
        
        // Mantener valores en 0 si hay error
        setStats({
          totalProducts: 0,
          activeUsers: 0,
          totalSalesToday: 0,
          totalTables: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const statsCards = [
    {
      label: "Productos",
      value: stats.totalProducts,
      icon: Package,
      iconClass: "productos"
    },
    {
      label: "Usuarios",
      value: stats.activeUsers,
      icon: Users,
      iconClass: "usuarios"
    },
    {
      label: "Ventas Hoy",
      value: `$${stats.totalSalesToday.toLocaleString("es-CO")}`,
      icon: DollarSign,
      iconClass: "ventas"
    },
    {
      label: "Mesas",
      value: stats.totalTables,
      icon: Utensils,
      iconClass: "mesas"
    },
  ];

  return (
    <section className={styles.dashboardPage}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Dashboard</h1>
          <p className={styles.dashboardSub}>Bienvenido de vuelta, Admin</p>
        </div>
      </div>

      {/* Notificaciones */}
      {connectedUsers.length > 0 && (
        <div className={styles.adminNotif}>
          <h4>Últimas conexiones</h4>
          <ul>
            {connectedUsers.slice(-5).map((u, i) => {
              const user = u as unknown as {
                role: string;
                timestamp: string;
                name: string
              };
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

      {/* Mensaje de error si ocurre */}
      {error && !isLoading && (
        <div className={styles.errorMessage}>
          <p>⚠️ {error}</p>
          <p className={styles.errorSubtext}>Mostrando valores por defecto</p>
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsGrid}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Users size={48} className={styles.loadingIcon} />
            <p>Cargando estadísticas...</p>
          </div>
        ) : (
          statsCards.map((stat, index) => (
            <StatCard
              key={index}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              iconClass={stat.iconClass}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default AdminDashboard;