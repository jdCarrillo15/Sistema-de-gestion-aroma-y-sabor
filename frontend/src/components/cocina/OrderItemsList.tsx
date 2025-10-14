import React from 'react';
import { OrderItem } from '../../services/cocina/cocinaTypes';
import '../../styles/cocina/OrderItemsList.css';

interface OrderItemsListProps {
  items: OrderItem[];
}

const OrderItemsList: React.FC<OrderItemsListProps> = ({ items }) => {
  return (
    <div className="order-items-list">
      <p className="items-header">ITEMS DEL PEDIDO:</p>
      <div className="items-grid">
        {items.map((item) => (
          <div key={item.id} className="item-row">
            <span className="item-quantity">{item.quantity}x</span>
            <span className="item-name">{item.product_name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderItemsList;