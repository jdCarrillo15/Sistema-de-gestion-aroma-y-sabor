import React from 'react';
import { X, DollarSign } from 'lucide-react';
import Button from '../../components/common/Button';
import '../../styles/caja/TableDetailModal.css';

type OrderItem = {
  name: string;
  price: number;
};

type ActiveTable = {
  id: number;
  time: string;
  duration: string;
  items: OrderItem[];
  total: number;
};

interface TableDetailModalProps {
  isOpen: boolean;
  table: ActiveTable | null;
  onClose: () => void;
  onPay: (tableId: number) => void;
  formatPrice: (price: number) => string;
}

const TableDetailModal: React.FC<TableDetailModalProps> = ({
  isOpen,
  table,
  onClose,
  onPay,
  formatPrice
}) => {
  if (!isOpen || !table) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePay = () => {
    onPay(table.id);
    onClose();
  };

  return (
    <div className="table-detail-overlay" onClick={handleOverlayClick}>
      <div className="table-detail-modal">
        <div className="modal-header">
          <div className="modal-header-info">
            <h2 className="modal-title">Mesa {table.id}</h2>
            <p className="modal-subtitle">{table.time} • {table.duration}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-items-section">
            <h3 className="modal-section-title">Detalle del Pedido</h3>
            <div className="modal-items-list">
              {table.items.map((item, idx) => (
                <div key={idx} className="modal-item">
                  <span className="modal-item-name">{item.name}</span>
                  <span className="modal-item-price">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-total-section">
            <div className="modal-total-row">
              <span className="modal-total-label">TOTAL:</span>
              <span className="modal-total-amount">{formatPrice(table.total)}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button
            className="btn-pay-modal"
            onClick={handlePay}
          >
            <DollarSign className="c" />
            <span>Pagar {formatPrice(table.total)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TableDetailModal;