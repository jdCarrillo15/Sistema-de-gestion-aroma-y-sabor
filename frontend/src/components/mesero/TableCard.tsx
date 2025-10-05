// frontend/src/components/mesero/TableCard.tsx

import React from 'react';
import { Table, Bill } from '../../types/mesero';
import { getOrdersByBillId } from '../../services/mesero/mockData';
import '../../styles/mesero/TableCard.css';

interface TableCardProps {
  table: Table;
  bill?: Bill;
  onClick: () => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, bill, onClick }) => {
  const isFree = table.status === 'free';
  const orders = bill ? getOrdersByBillId(bill.id) : [];
  const productCount = orders.length;

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`table-card ${table.status}`}
      onClick={onClick}
    >
      <div className="table-header">
        <h3 className="table-number">Mesa {table.number}</h3>
        <span className={`table-badge ${table.status}`}>
          {isFree ? 'Libre' : 'Ocupada'}
        </span>
      </div>

      <div className="table-body">
        {isFree ? (
          <div className="table-empty">
            <p className="empty-text">Mesa disponible</p>
            <p className="table-hint">Haz clic para asignar</p>
          </div>
        ) : bill ? (
          <div className="table-occupied">
            <div className="occupied-info">
              <div className="info-row">
                <span className="info-text">Desde: {formatTime(bill.created_at)}</span>
              </div>
              <div className="info-row">
                <span className="info-text">{productCount} producto{productCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="info-row total">
                <span className="info-text total-amount">${bill.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TableCard;