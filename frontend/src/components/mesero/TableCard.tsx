import React from 'react';
import { Table } from '../../types/mesero';
import { Users, Clock } from 'lucide-react';
import '../../styles/mesero/TableCard.css';

interface TableCardProps {
  table: Table;
  onClick: () => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, onClick }) => {
  const getStatusInfo = () => {
    if (table.status === 'free') {
      return {
        label: 'Libre',
        className: 'free'
      };
    }
    return {
      label: 'Ocupada',
      className: 'occupied'
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div 
      className={`table-card ${statusInfo.className}`}
      onClick={onClick}
    >
      <div className="table-header">
        <div className="table-number">
          <span className="table-label">Mesa </span>
          <span className="table-digit">{table.number}</span>
        </div>
        <div className={`status-badge ${statusInfo.className}`}>
          <span className="status-label">{statusInfo.label}</span>
        </div>
      </div>

      <div className="table-info">
        <div className="info-item">
          <Users size={16} className="info-icon" />
          <span>{table.capacity} personas</span>
        </div>
        
        {table.status === 'occupied' && table.current_bill_id && (
          <div className="info-item active">
            <Clock size={16} className="info-icon" />
            <span>Cuenta abierta</span>
          </div>
        )}
      </div>
      <div className="table-footer">
        <button className="table-action-btn">
          {table.status === 'free' ? 'Asignar' : 'Ver Cuenta'}
        </button>
      </div>
    </div>
  );
};

export default TableCard;