import React, { useState, useEffect } from 'react';
import { mockTables } from '../../services/mesero/mockData';
import { Table } from '../../types/mesero';
import TableCard from '../../components/mesero/TableCard';
import TableModal from '../../components/mesero/TableModal';
import { getBillById } from '../../services/mesero/billService';
import styles from '../../styles/mesero/MesasPage.module.css';

const MesasPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const updateTablesState = async () => {
      const updatedTables = await Promise.all(
        tables.map(async (table) => {
          if (table.current_bill_id) {
            try {
              const bill = await getBillById(table.current_bill_id);
              if (bill && bill.state === 'open') {
                return { ...table, status: 'occupied' };
              } else {
                return { ...table, status: 'free', current_bill_id: null };
              }
            } catch (err) {
              console.error(`Error al obtener cuenta de mesa ${table.number}:`, err);
              return table;
            }
          } else {
            return { ...table, status: 'free' };
          }
        })
      );

      setTables(updatedTables as Table[]);
      setLoading(false);
    };

    updateTablesState();
  }, []);

  if(loading){
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