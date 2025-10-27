import React, { useState, useEffect } from "react";
import { DollarSign, Clock, TrendingUp, Package, AlertCircle } from "lucide-react";
import { getShifts, type Shift } from "../../services/admin/shiftService";
import { getUsers } from "../../services/admin/userService";
import AlertModal from "../../components/common/AlertModal";
import "../../styles/admin/VentasPage.css";

const VentasPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  // Cargar turnos al montar el componente
  useEffect(() => {
    loadShifts();
  }, []);

  const loadShifts = async () => {
    setIsLoading(true);
    try {
      const [shiftsResponse, usersResponse] = await Promise.all([
        getShifts(),
        getUsers()
      ]);
      
      const shiftsData = shiftsResponse.shifts || [];
      setShifts(shiftsData);
      
      // Crear un mapa de user_id -> user_name
      const usersData = usersResponse.users || [];
      const usersMap: Record<string, string> = {};
      usersData.forEach((user: any) => {
        usersMap[user.id] = user.user_name;
      });
      setUsers(usersMap);
      
    } catch (error: any) {
      console.error("Error cargando turnos:", error);
      setAlertMessage(error.message || "Error al cargar los turnos");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estadísticas
  const filteredShifts = selectedUserId === "all" 
    ? shifts 
    : shifts.filter(shift => shift.user_id === selectedUserId);
    
  const totalSales = filteredShifts.reduce((sum, shift) => sum + shift.total_sales, 0);
  const totalBills = filteredShifts.reduce((sum, shift) => sum + shift.total_bills, 0);
  const openShifts = filteredShifts.filter(s => s.state === "open").length;
  const closedShifts = filteredShifts.filter(s => s.state === "closed").length;

  // Formatear fecha
  const formatDate = (dateString: any) => {
    try {
      let date: Date;
      
      // Si es un objeto Timestamp de Firebase
      if (dateString && typeof dateString === 'object' && '_seconds' in dateString) {
        date = new Date(dateString._seconds * 1000);
      } 
      // Si es un string
      else if (typeof dateString === 'string') {
        date = new Date(dateString);
      }
      // Si ya es una fecha
      else if (dateString instanceof Date) {
        date = dateString;
      }
      else {
        return "-";
      }
      
      if (isNaN(date.getTime())) {
        return "-";
      }
      
      return date.toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "-";
    }
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("es-ES")}`;
  };

  // Mostrar detalles del turno
  const handleViewDetails = (shift: Shift) => {
    setSelectedShift(shift);
  };

  return (
    <div className="ventas-page">
      {/* Header */}
      <div className="ventas-header">
        <div>
          <h1 className="dashboard-title">Ventas por Turnos</h1>
          <p className="dashboard-sub">Resumen de todos los turnos y ventas</p>
        </div>
        <div className="filtro-usuario">
          <label htmlFor="filtro-usuario">Filtrar por usuario:</label>
          <select 
            id="filtro-usuario"
            value={selectedUserId} 
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="select-filtro"
          >
            <option value="all">Todos los usuarios</option>
            {Object.entries(users).map(([userId, userName]) => (
              <option key={userId} value={userId}>
                {userName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon ventas">
              <DollarSign size={20} />
            </div>
            <div>
              <div className="stat-value">{formatCurrency(totalSales)}</div>
              <div className="stat-label">Ventas Totales</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon facturas">
              <Package size={20} />
            </div>
            <div>
              <div className="stat-value">{totalBills}</div>
              <div className="stat-label">Cuentas Totales</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon activos">
              <Clock size={20} />
            </div>
            <div>
              <div className="stat-value">{openShifts}</div>
              <div className="stat-label">Turnos Abiertos</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon cerrados">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="stat-value">{closedShifts}</div>
              <div className="stat-label">Turnos Cerrados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de turnos */}
      <div className="ventas-tabla-container">
        {isLoading && filteredShifts.length === 0 ? (
          <div className="loading-state">
            <Clock size={48} className="loading-icon" />
            <p>Cargando turnos...</p>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={48} className="empty-icon" />
            <h3>No hay turnos registrados</h3>
            <p>Los turnos aparecerán aquí una vez que se registren en el sistema</p>
          </div>
        ) : (
          <table className="ventas-tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th>Cuentas</th>
                <th>Total Ventas</th>
                <th className="acciones-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.map((shift) => (
                <tr key={shift.id}>
                  <td className="usuario-nombre">{users[shift.user_id] || "Sin asignar"}</td>
                  <td>{formatDate(shift.started_at)}</td>
                  <td>{shift.finished_at ? formatDate(shift.finished_at) : "-"}</td>
                  <td>
                    <span className={`estado ${shift.state === "open" ? "abierto" : "cerrado"}`}>
                      {shift.state === "open" ? "Abierto" : "Cerrado"}
                    </span>
                  </td>
                  <td className="text-center">{shift.total_bills}</td>
                  <td className="ventas-amount">{formatCurrency(shift.total_sales)}</td>
                  <td className="text-center">
                    <button
                      className="btn-ver-detalles"
                      onClick={() => handleViewDetails(shift)}
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de detalles del turno */}
      {selectedShift && (
        <div className="modal-backdrop" onClick={() => setSelectedShift(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <button
                  className="close-button"
                  onClick={() => setSelectedShift(null)}
                  aria-label="Cerrar"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="modal-icon">
                <DollarSign size={64} />
              </div>

              <h2 className="modal-title">Detalles del Turno</h2>
              <p className="modal-description">
                Información detallada sobre el turno seleccionado
              </p>

              <div className="shift-details">
                <div className="detail-row">
                  <span className="detail-label">Usuario:</span>
                  <span className="detail-value">{users[selectedShift.user_id] || "Sin asignar"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Estado:</span>
                  <span className={`estado ${selectedShift.state === "open" ? "abierto" : "cerrado"}`}>
                    {selectedShift.state === "open" ? "Abierto" : "Cerrado"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Fecha Inicio:</span>
                  <span className="detail-value">{formatDate(selectedShift.started_at)}</span>
                </div>
                {selectedShift.finished_at && (
                  <div className="detail-row">
                    <span className="detail-label">Fecha Fin:</span>
                    <span className="detail-value">{formatDate(selectedShift.finished_at)}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Total Cuentas:</span>
                  <span className="detail-value">{selectedShift.total_bills}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Ventas:</span>
                  <span className="detail-value ventas-highlight">
                    {formatCurrency(selectedShift.total_sales)}
                  </span>
                </div>

                {Object.keys(selectedShift.products_summary).length > 0 && (
                  <>
                    <div className="detail-divider">
                      <h3>Resumen de Productos</h3>
                    </div>
                    <div className="products-summary">
                      {Object.entries(selectedShift.products_summary).map(([productName, quantity]) => (
                        <div key={productName} className="product-summary-row">
                          <span className="product-name">{productName}</span>
                          <span className="product-quantity">x{quantity}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de alertas */}
      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Error"
        message={alertMessage}
        type="error"
        buttonText="Cerrar"
      />
    </div>
  );
};

export default VentasPage;