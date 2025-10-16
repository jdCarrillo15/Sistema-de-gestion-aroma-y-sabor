import React from 'react';
import { Order } from '../../services/cocina/cocinaTypes';
import OrderItemsList from './OrderItemsList';
import Button from '../common/Button';
import '../../styles/cocina/OrderCard.css';

interface OrderCardProps {
  order: Order;
  index: number;
  isNext: boolean;
  onMarkReady: (billId: string, productIds: string[]) => void;
  onMarkProductReady: (billId: string, productId: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  index,
  isNext,
  onMarkReady,
  onMarkProductReady
}) => {
  return (
    <div className={`order-card ${isNext ? 'next' : ''}`}>
      <div className="order-card-header">
        <div className="order-number">
          <div className={`order-badge ${isNext ? 'next' : ''}`}>
            {index + 1}
          </div>
          {isNext && <span className="next-label">AHORA</span>}
        </div>

        <div className="order-info">
          <div className="order-meta">
            <h3 className="order-table">{order.table_name}</h3>
            <span className="order-status pending">Pendiente</span>
          </div>
          <p className="order-time"> {order.created_at}</p>
        </div>
      </div>

      <OrderItemsList
        items={order.items}
        billId={order.id}
        onMarkProductReady={onMarkProductReady}
      />

      <Button
        type="button"
        variant={isNext ? 'primary' : 'secondary'}
        onClick={() => onMarkReady(order.id, order.items.map(item => item.id))}
        className={`mark-ready-btn ${isNext ? 'primary' : ''}`}
      >
        {isNext ? '✓ Marcar como Listo' : 'Marcar Listo'}
      </Button>
    </div>
  );
};

export default OrderCard;