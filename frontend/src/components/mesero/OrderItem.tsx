import React from 'react';
import { Order } from '../../types/mesero';
import { Edit3, Trash2 } from 'lucide-react';

interface OrderItemProps {
  order: Order;
  onEdit: () => void;
  onRemove: () => void;
  getStatusColor: (status: Order['status']) => string;
  getStatusText: (status: Order['status']) => string;
}

const OrderItem: React.FC<OrderItemProps> = ({ 
  order, 
  onEdit, 
  onRemove, 
  getStatusColor, 
  getStatusText 
}) => {
  return (
    <div className="order-item">
      <div className="order-main">
        <div className="order-info">
          <h4 className="order-name">{order.product_name}</h4>
          <div className="order-details">
            <span className="order-quantity">x{order.quantity}</span>
            <span className="order-separator">•</span>
            <span className="order-price">${order.product_price.toLocaleString()}</span>
          </div>
        </div>

        <div className="order-status-container">
          <span 
            className="order-status"
            style={{ 
              backgroundColor: `${getStatusColor(order.status)}20`,
              color: getStatusColor(order.status),
              border: `1px solid ${getStatusColor(order.status)}40`
            }}
          >
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      <div className="order-footer">
        <div className="order-actions">
          <button 
            className="action-btn edit-btn" 
            onClick={onEdit}
            title="Editar"
          >
            <Edit3 size={16} />
          </button>
          <button 
            className="action-btn delete-btn" 
            onClick={onRemove}
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="order-subtotal">
          ${order.subtotal.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default OrderItem;