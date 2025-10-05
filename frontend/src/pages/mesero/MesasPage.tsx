import React, { useState, useEffect } from 'react';
import TableCard from '../../components/mesero/TableCard';
import TableModal from '../../components/mesero/TableModal';
import { Table, Bill } from '../../types/mesero';
import { mockTables, mockBills } from '../../services/mesero/mockData';
import '../../styles/mesero/MesasPage.css';

const MesasPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
     
      await new Promise(resolve => setTimeout(resolve, 500));
      setTables(mockTables);
      setBills(mockBills);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
  };

  const handleUpdateTable = () => {
    loadData();
  };

  
  const totalTables = tables.length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;
  const freeTables = tables.filter(t => t.status === 'free').length;
  const totalSales = bills.reduce((sum, bill) => sum + bill.total, 0);

  return (
    <div className="mesas-page">
      
      <div className="mesas-header">
        <div>
          <h1 className="mesas-title">Gestión de Mesas</h1>
          <p className="mesas-subtitle">Administra las mesas del restaurante</p>
        </div>
      </div>

      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon total">
            </div>
            <div>
              <div className="stat-value">{totalTables}</div>
              <div className="stat-label">Mesas Totales</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon occupied">
            </div>
            <div>
              <div className="stat-value">{occupiedTables}</div>
              <div className="stat-label">Mesas Ocupadas</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon free">
            </div>
            <div>
              <div className="stat-value">{freeTables}</div>
              <div className="stat-label">Mesas Libres</div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon sales">
            </div>
            <div>
              <div className="stat-value">${totalSales.toLocaleString()}</div>
              <div className="stat-label">Total veentas Activas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Mesas */}
      <div className="mesas-section">
        <h2 className="section-title">Mesas del Restaurante</h2>
        
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando mesas...</p>
          </div>
        ) : (
          <div className="mesas-grid">
            {tables.map(table => (
              <TableCard
                key={table.id}
                table={table}
                bill={bills.find(b => b.id === table.current_bill_id)}
                onClick={() => handleTableClick(table)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Mesa */}
      {selectedTable && (
        <TableModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          table={selectedTable}
          onUpdate={handleUpdateTable}
        />
      )}
    </div>
  );
};

export default MesasPage;