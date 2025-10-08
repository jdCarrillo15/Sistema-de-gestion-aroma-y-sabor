import React, { useState } from 'react';
import { mockTables } from '../../services/mesero/mockData';
import { Table } from '../../types/mesero';
import TableCard from '../../components/mesero/TableCard';
import TableModal from '../../components/mesero/TableModal';
import '../../styles/mesero/MesasPage.css';

const MesasPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        {/* Mesas Totales */}
        <div className="stat-card stat-total">
          <div className="stat-left">
            <div>
              <p className="stat-value">{tables.length}</p>
              <p className="stat-label">Mesas Totales</p>
            </div>
          </div>
        </div>

        {/* Mesas Ocupadas */}
        <div className="stat-card stat-occupied">
          <div className="stat-left">
            <div>
              <p className="stat-value">{tables.filter(t => t.status === 'occupied').length}</p>
              <p className="stat-label">Mesas Ocupadas</p>
            </div>
          </div>
        </div>

        {/* Mesas Libres */}
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