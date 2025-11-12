import React, { useState, useEffect } from "react";
import { DollarSign, Clock, Package, AlertCircle } from "lucide-react";
import { getShifts, type Shift } from "../../services/admin/shiftService";
import { getUsers } from "../../services/admin/userService";
import AlertModal from "../../components/common/AlertModal";
import Button from "../../components/common/Button";
import styles from "../../styles/admin/VentasPage.module.css";
import modalStyles from "../../styles/admin/users/CreateUserModal.module.css";

const VentasPage: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

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

  const filteredShifts = selectedUserId === "all"
    ? shifts
    : shifts.filter(shift => shift.user_id === selectedUserId);

  const totalSales = filteredShifts.reduce((sum, shift) => sum + shift.total_sales, 0);
  const totalBills = filteredShifts.reduce((sum, shift) => sum + shift.total_bills, 0);

  const formatDate = (dateString: any) => {
    try {
      let date: Date;

      if (dateString && typeof dateString === 'object' && '_seconds' in dateString) {
        date = new Date(dateString._seconds * 1000);
      }
      else if (typeof dateString === 'string') {
        date = new Date(dateString);
      }
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

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("es-ES")}`;
  };

  const handleViewDetails = (shift: Shift) => {
    setSelectedShift(shift);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setSelectedShift(null);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedShift(null);
    }
  };

  return (
    <div className={styles.ventasPage}>
      {/* Header */}
      <div className={styles.ventasHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Ventas por Turnos</h1>
        </div>
        <div className={styles.filtroUsuario}>
          <label htmlFor="filtro-usuario">Filtrar por usuario:</label>
          <select
            id="filtro-usuario"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className={styles.selectFiltro}
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

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <div className={`${styles.statIcon} ${styles.ventas}`}>
              <DollarSign size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{formatCurrency(totalSales)}</div>
              <div className={styles.statLabel}>Ventas Totales</div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLeft}>
            <div className={`${styles.statIcon} ${styles.facturas}`}>
              <Package size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{totalBills}</div>
              <div className={styles.statLabel}>Cuentas Totales</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de turnos */}
      <div className={styles.ventasTablaContainer}>
        {isLoading && filteredShifts.length === 0 ? (
          <div className={styles.loadingState}>
            <Clock size={48} className={styles.loadingIcon} />
            <p>Cargando turnos...</p>
          </div>
        ) : filteredShifts.length === 0 ? (
          <div className={styles.emptyState}>
            <AlertCircle size={48} className={styles.emptyIcon} />
            <h3>No hay turnos registrados</h3>
            <p>Los turnos aparecerán aquí una vez que se registren en el sistema</p>
          </div>
        ) : (
          <table className={styles.ventasTabla}>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Cuentas</th>
                <th>Total Ventas</th>
                <th className={styles.accionesCol}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.map((shift) => (
                <tr key={shift.id}>
                  <td className={styles.usuarioNombre}>{users[shift.user_id] || "Sin asignar"}</td>
                  <td>{formatDate(shift.started_at)}</td>
                  <td>{shift.finished_at ? formatDate(shift.finished_at) : "-"}</td>
                  <td className={styles.textCenter}>{shift.total_bills}</td>
                  <td className={styles.ventasAmount}>{formatCurrency(shift.total_sales)}</td>
                  <td className={styles.textCenter}>
                    <Button
                      className={styles.btnNuevoProducto}
                      onClick={() => handleViewDetails(shift)}
                      disabled={isLoading}
                    >
                      Detalles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de detalles del turno */}
      {selectedShift && (
        <div
          className={modalStyles.modalBackdrop}
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div className={modalStyles.modalContainer}>
            <div className={modalStyles.modalContent}>
              <div className={modalStyles.modalHeader}>
                <div></div>
                <button
                  className={modalStyles.closeButton}
                  onClick={() => setSelectedShift(null)}
                  aria-label="Cerrar"
                  type="button"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className={modalStyles.modalIcon}>
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>

              <h2 className={modalStyles.modalTitle}>Detalles del Turno</h2>
              <p className={modalStyles.modalDescription}>
                Información detallada sobre el turno seleccionado
              </p>

              <div className={modalStyles.modalForm}>
                <div className={modalStyles.formGroup}>
                  <label className={modalStyles.formLabel}>Usuario</label>
                  <div className={modalStyles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                    {users[selectedShift.user_id] || "Sin asignar"}
                  </div>
                </div>

                <div className={modalStyles.formGroup}>
                  <label className={modalStyles.formLabel}>Fecha Inicio</label>
                  <div className={modalStyles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                    {formatDate(selectedShift.started_at)}
                  </div>
                </div>

                {selectedShift.finished_at && (
                  <div className={modalStyles.formGroup}>
                    <label className={modalStyles.formLabel}>Fecha Fin</label>
                    <div className={modalStyles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                      {formatDate(selectedShift.finished_at)}
                    </div>
                  </div>
                )}

                <div className={modalStyles.formGroup}>
                  <label className={modalStyles.formLabel}>Total Cuentas</label>
                  <div className={modalStyles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                    {selectedShift.total_bills}
                  </div>
                </div>

                <div className={modalStyles.formGroup}>
                  <label className={modalStyles.formLabel}>Total Ventas</label>
                  <div className={modalStyles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default', fontWeight: '600', color: '#059669' }}>
                    {formatCurrency(selectedShift.total_sales)}
                  </div>
                </div>

                {Object.keys(selectedShift.products_summary).length > 0 && (
                  <>
                    <div className={modalStyles.formGroup} style={{ marginTop: '1rem' }}>
                      <label className={modalStyles.formLabel} style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                        Resumen de Productos
                      </label>
                      <div className={styles.productsSummaryContainer}>
                        {Object.entries(selectedShift.products_summary).map(([productName, quantity]) => (
                          <div key={productName} className={styles.productSummaryItem}>
                            <span className={styles.productName}>{productName}</span>
                            <span className={styles.productQuantity}>x{quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={modalStyles.modalButtons}>
                <Button type="button" variant="primary" onClick={() => setSelectedShift(null)}>
                  Cerrar
                </Button>
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