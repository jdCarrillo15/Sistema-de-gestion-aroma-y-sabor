import React from 'react';
import { Order } from '../../services/cocina/cocinaTypes';
import { CheckCircle } from 'lucide-react';
import '../../styles/cocina/ReadyOrderCard.css';

interface ReadyOrderCardProps {
  order: Order;
}

const ReadyOrderCard: React.FC<ReadyOrderCardProps> = ({ order }) => {
  return (
    <div className="ready-order-card">
      <div className="ready-order-content">
        <div className="ready-icon">
          <CheckCircle size={24} />
        </div>
        <div className="ready-info">
          <h3 className="ready-table">{order.table_name}</h3>
          <p className="ready-items">
            {order.items.map(item => `${item.product_name}`).join(' • ')}
          </p>
        </div>
      </div>
      <div className="ready-badge-container">
        <span className="ready-badge">LISTO</span>
        <p className="ready-time">{order.created_at}</p>
      </div>
    </div>
  );
};

export default ReadyOrderCard;