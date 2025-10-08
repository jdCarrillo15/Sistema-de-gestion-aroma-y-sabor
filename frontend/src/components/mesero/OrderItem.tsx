import React from 'react';
import { Trash2 } from 'lucide-react';
import { BillProduct } from '../../services/mesero/billService';
import '../../styles/mesero/OrderItem.css';

interface OrderItemProps {
  order: BillProduct;
  onRemove: () => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ order, onRemove }) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: 'pending' },
      preparing: { label: 'Preparando', className: 'preparing' },
      ready: { label: 'Listo', className: 'ready' },
      finished: { label: 'Entregado', className: 'finished' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return <span className={`order-status ${config.className}`}>{config.label}</span>;
  };

  return (
    <div className="order-item">
      <div className="order-info">
        <div className="order-header">
          <h4 className="order-name">{order.name}</h4>
          {getStatusBadge(order.process)}
        </div>
        <div className="order-details">
          <span className="order-quantity">{order.units}x unidades</span>
        </div>
      </div>
      <button className="remove-btn" onClick={onRemove} title="Eliminar">
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default OrderItem;