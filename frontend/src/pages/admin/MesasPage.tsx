import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Eye, UtensilsCrossed } from "lucide-react";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import CreateTableModal from "../../components/admin/tables/CreateTableModal";
import EditTableModal from "../../components/admin/tables/EditTableModal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import AlertModal from "../../components/common/AlertModal";
import ViewTableModal from "../../components/admin/tables/ViewTableModal";
import styles from "../../styles/admin/tables/TablesPage.module.css";
import { getTables, createTable, updateTable, deleteTable } from "../../services/admin/tableService";

export type Table = {
  id: string;
  number: number;
  capacity: number;
  status: "free" | "occupied";
  current_bill_id: string | null;
  created_at?: string;
};

const MesasPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const totalTables = tables.length;

  const loadTables = async () => {
    setIsLoading(true);
    try {
      const response = await getTables();
      const tablesData = Array.isArray(response) ? response : response?.tables || [];
      
      const compareTables = (a: Table, b: Table) => (Number(a.number) || 0) - (Number(b.number) || 0);
      tablesData.sort(compareTables);
      setTables(tablesData);
    } catch (error: any) {
      console.error("Error cargando mesas:", error);
      setAlertMessage(error.message || "Error al cargar las mesas");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const openViewModal = (table: Table) => {
    setSelectedTable(table);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTable(null);
  };

  const handleAddTable = async (tableData: any) => {
    try {
      setIsLoading(true);

      if (!tableData.number || !tableData.capacity) {
        throw new Error("Faltan campos obligatorios");
      }

      await createTable({
        number: tableData.number,
        capacity: tableData.capacity,
      });

      await loadTables();
      setIsModalOpen(false);

      setAlertMessage("Mesa creada exitosamente");
      setIsAlertOpen(true);

    } catch (error: any) {
      console.error("Error creando mesa:", error);
      setAlertMessage(error.message || "No fue posible crear la mesa");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTable = async (updatedTable: Table) => {
    try {
      setIsLoading(true);

      if (!updatedTable.number || !updatedTable.capacity) {
        throw new Error("Faltan campos obligatorios al editar");
      }

      await updateTable(updatedTable.id, {
        number: updatedTable.number,
        capacity: updatedTable.capacity,
        status: updatedTable.status,
      });

      await loadTables();
      setIsEditModalOpen(false);
      setSelectedTable(null);

      setAlertMessage("Mesa actualizada exitosamente");
      setIsAlertOpen(true);

    } catch (error: any) {
      console.error("Error editando mesa:", error);
      setAlertMessage(error.message || "No fue posible editar la mesa");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (table: Table) => {
    setSelectedTable(table);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTable(null);
  };

  const handleDeleteTable = async (id: string) => {
    try {
      setIsLoading(true);

      await deleteTable(id);

      await loadTables();
      setIsConfirmOpen(false);
      setTableToDelete(null);

      setAlertMessage("Mesa eliminada exitosamente");
      setIsAlertOpen(true);

    } catch (error: any) {
      console.error("Error eliminando mesa:", error);
      setAlertMessage(error.message || "No fue posible eliminar la mesa");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTableToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (tableToDelete !== null) {
      handleDeleteTable(tableToDelete);
    }
  };

  return (
    <div className="dashboard-page">
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className="dashboard-title">Gestión de Mesas</h1>
        </div>
        <Button
          className="primary-btn btn-compact"
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
        >
          <Plus className="icono" />
          Nueva Mesa
        </Button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon productos">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <div className="stat-value">{totalTables}</div>
              <div className="stat-label">Mesas Totales</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.productosGrid}>
        {isLoading && tables.length === 0 && (
          <div className={styles.loadingSpinner}>
            <LoadingSpinner message="Cargando mesas..." />
          </div>
        )}

        {tables.map((table) => (
          <div key={table.id} className={styles.productCard}>
            <div className={styles.productCardHeader}>
              <h3 className={styles.productName}>Mesa {table.number}</h3>
              <span
                className={`${styles.productStatus} ${
                  table.status === "free" ? styles.statusActive : styles.statusInactive
                }`}
              >
                {table.status === "free" ? "Libre" : "Ocupada"}
              </span>
            </div>

            <div className={styles.productCardBody}>
              <div className={styles.productPrice}>
                {table.capacity} personas
              </div>

              <div className={styles.productActions}>
                <Button
                  type="button"
                  variant="secondary"
                  className="btn-icon ver"
                  onClick={() => openViewModal(table)}
                  disabled={isLoading}
                >
                  <Eye size={16} />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="btn-icon editar"
                  onClick={() => openEditModal(table)}
                  disabled={isLoading}
                >
                  <Edit3 size={16} />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="btn-icon eliminar"
                  onClick={() => handleDeleteClick(table.id)}
                  disabled={isLoading}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {!isLoading && tables.length === 0 && (
          <div className={styles.emptyState}>
            <UtensilsCrossed size={48} className={styles.emptyIcon} />
            <h3>No hay mesas</h3>
            <p>Crea tu primera mesa para comenzar</p>
            <Button
              className="primary-btn"
              onClick={() => setIsModalOpen(true)}
              disabled={isLoading}
            >
              <Plus className="icono" />
              Crear Mesa
            </Button>
          </div>
        )}
      </div>

      <CreateTableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddTable}
        isLoading={isLoading}
      />

      {selectedTable && (
        <EditTableModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          table={selectedTable}
          onSubmit={handleEditTable}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar esta mesa?"
        onConfirm={handleConfirmDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {selectedTable && (
        <ViewTableModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          table={selectedTable}
        />
      )}

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertMessage.includes("exitosamente") ? "Éxito" : "Error"}
        message={alertMessage}
        type={alertMessage.includes("exitosamente") ? "success" : "error"}
        buttonText="Cerrar"
      />
    </div>
  );
};

export default MesasPage;