import React, { useEffect, useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import Button from '../../components/common/Button';
import '../../styles/caja/TableDetailModal.css';
import { ActiveTable } from '../../services/cocina/cocinaTypes';
import { getSocket } from '../../services/sockets/socket';
import { Product } from '../../services/caja/cajaServices';

interface TableDetailModalProps {
  isOpen: boolean;
  table: ActiveTable | null;
  onClose: () => void;
  onPay: (tableId: string) => void;
  formatPrice: (price: number) => string;
}

const TableDetailModal: React.FC<TableDetailModalProps> = ({
  isOpen,
  table,
  onClose,
  onPay,
  formatPrice,
}) => {
  const [localTable, setLocalTable] = useState<ActiveTable | null>(table);

  useEffect(() => {
    setLocalTable(table);
  }, [table]);

  useEffect(() => {
    if (!isOpen || !table) return;

    const socket = getSocket();

    const handleCuentaActualizada = ({ id, data }: any) => {
      if (!localTable) return;
      if (id !== localTable.id) return;

      setLocalTable((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          total: data.total ?? prev.total,
          items: data.products
            ? mergeProducts(data.products).map((p: any) => ({
              name: `${p.units}x ${p.name}`,
              price: Number(p.price) || 0,
              units: p.units,
            }))
            : prev.items,

        };
      });
    };

    const handleCuentaEliminada = ({ id }: any) => {
      if (localTable && id === localTable.id) {
        // close modal if the underlying bill was deleted
        onClose();
      }
    };

    socket.on('cuentaActualizada', handleCuentaActualizada);
    socket.on('cuentaEliminada', handleCuentaEliminada);

    return () => {
      socket.off('cuentaActualizada', handleCuentaActualizada);
      socket.off('cuentaEliminada', handleCuentaEliminada);
    };
  }, [isOpen, table, localTable, onClose]);

  if (!isOpen || !localTable) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handlePay = () => {
    onPay(localTable.id);
    onClose();
  };

  function mergeProducts(products: Product[]): Product[] {
    const grouped: Record<string, Product> = {};

    for (const p of products) {
      const key = `${p.name}-${p.price}`;
      if (grouped[key]) {
        grouped[key].units += p.units;
      } else {
        grouped[key] = { ...p };
      }
    }

    return Object.values(grouped);
  }

  return (
    <div className="table-detail-overlay" onClick={handleOverlayClick}>
      <div className="table-detail-modal">
        <div className="modal-header">
          <div className="modal-header-info">
            <h2 className="modal-title">Mesa {localTable.id}</h2>
            <p className="modal-subtitle">{localTable.time} • {localTable.duration}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-items-section">
            <h3 className="modal-section-title">Detalle del Pedido</h3>
            <div className="modal-items-list">
              {localTable.items.map((item, idx) => (
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
              <span className="modal-total-amount">{formatPrice(localTable.total)}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <Button className="btn-pay-modal" onClick={handlePay}>
            <DollarSign className="btn-icon" />
            <span>Pagar {formatPrice(localTable.total)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TableDetailModal;
