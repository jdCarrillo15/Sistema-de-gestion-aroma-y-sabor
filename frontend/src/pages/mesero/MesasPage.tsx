import React, { useState, useEffect } from 'react';
import { mockTables } from '../../services/mesero/mockData';
import { Table } from '../../types/mesero';
import TableCard from '../../components/mesero/TableCard';
import TableModal from '../../components/mesero/TableModal';
import { getActiveBills } from '../../services/mesero/billService';
import '../../styles/mesero/MesasPage.css';
import { connectSocket } from '../../services/sockets/socket';

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
      <div className="mesas-page">
        <div className="loading-state">
          <div className="spinner"></div>
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
    <div className="mesas-page">
      <div className="mesas-header">
        <h1 className="mesas-title">Gestión de Mesas</h1>
        <p className="mesas-subtitle">Administra las mesas del restaurante</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-left">
            <div>
              <p className="stat-value">{tables.length}</p>
              <p className="stat-label">Mesas Totales</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-occupied">
          <div className="stat-left">
            <div>
              <p className="stat-value">{tables.filter(t => t.status === 'occupied').length}</p>
              <p className="stat-label">Mesas Ocupadas</p>
            </div>
          </div>
        </div>

        <div className="stat-card stat-free">
          <div className="stat-left">
            <div>
              <p className="stat-value">{tables.filter(t => t.status === 'free').length}</p>
              <p className="stat-label">Mesas Libres</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mesas-section">
        <h2 className="section-title">Mesas del Restaurante</h2>
        <div className="mesas-grid">
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
