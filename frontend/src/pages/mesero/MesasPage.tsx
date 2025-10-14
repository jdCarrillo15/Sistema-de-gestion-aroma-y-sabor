import React, { useState, useEffect } from 'react';
import { mockTables } from '../../services/mesero/mockData';
import { Table } from '../../types/mesero';
import TableCard from '../../components/mesero/TableCard';
import TableModal from '../../components/mesero/TableModal';
import { getActiveBills } from '../../services/mesero/billService';
import { connectSocket } from '../../services/sockets/socket';
import styles from '../../styles/mesero/MesasPage.module.css';

const MesasPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit("joinRoom", "waiter");

    socket.on("cuentaActualizada", ({ id, data }) => {
      console.log("Cuenta actualizada en tiempo real:", id, data);
      setTables(prev =>
        prev.map(table =>
          table.current_bill_id === id
            ? { ...table, ...{ current_bill_data: data } }
            : table
        )
      );
    });

    return () => {
      socket.emit("leaveRoom", "waiter");
      socket.off("cuentaActualizada");
    };
  }, []);

  useEffect(() => {
    const loadTablesWithActiveBills = async () => {
      try {
        const activeBills = await getActiveBills();
        console.log(activeBills);


        const updatedTables: Table[] = mockTables.map(table => {
          const matchingBill = activeBills.find(
            (bill: { table: string; state?: string }) =>
              bill.state === 'open' && (
                bill.table === String(table.number) ||
                bill.table === `Mesa ${table.number}` ||
                bill.table.endsWith(`${table.number}`)
              )
          );

          if (matchingBill) {
            return {
              ...table,
              status: 'occupied' as const,
              current_bill_id: matchingBill.id,
            };
          } else {
            return {
              ...table,
              status: 'free' as const,
              current_bill_id: null,
            };
          }
        });

        setTables(updatedTables);
      } catch (err) {
        console.error("Error cargando mesas:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTablesWithActiveBills();
  }, []);

  if (loading) {
    return (
      <div className={styles.mesasPage}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Cargando mesas...</p>
        </div>
      </div>
    );
  }

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
  };

  const handleUpdateTable = (tableId: string, updates: Partial<Table>) => {
    setTables(prev =>
      prev.map(table =>
        table.id === tableId
          ? { ...table, ...updates }
          : table
      )
    );

    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable({ ...selectedTable, ...updates });
    }
  };

  return (
    <div className={styles.mesasPage}>
      <div className={styles.mesasHeader}>
        <h1 className={styles.mesasTitle}>Gestión de Mesas</h1>
        <p className={styles.mesasSubtitle}>Administra las mesas del restaurante</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statTotal}`}>
          <div className={styles.statLeft}>
            <div>
              <p className={styles.statValue}>{tables.length}</p>
              <p className={styles.statLabel}>Mesas Totales</p>
            </div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statOccupied}`}>
          <div className={styles.statLeft}>
            <div>
              <p className={styles.statValue}>{tables.filter(t => t.status === 'occupied').length}</p>
              <p className={styles.statLabel}>Mesas Ocupadas</p>
            </div>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statFree}`}>
          <div className={styles.statLeft}>
            <div>
              <p className={styles.statValue}>{tables.filter(t => t.status === 'free').length}</p>
              <p className={styles.statLabel}>Mesas Libres</p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mesasSection}>
        <h2 className={styles.sectionTitle}>Mesas del Restaurante</h2>
        <div className={styles.mesasGrid}>
          {tables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              onClick={() => handleTableClick(table)}
            />
          ))}
        </div>
      </div>

      {selectedTable && (
        <TableModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          table={selectedTable}
          onUpdateTable={handleUpdateTable}
        />
      )}
    </div>
  );
};

export default MesasPage;
