import React from 'react';
import { OrderItem } from '../../services/cocina/cocinaTypes';
import '../../styles/cocina/OrderItemsList.css';

interface OrderItemsListProps {
  items: OrderItem[];
  billId: string;
  onMarkProductReady: (billId: string, productId: string) => void;
}

function groupProducts(items: OrderItem[]): OrderItem[] {
  const grouped: Record<string, OrderItem> = {};

  for (const item of items) {
    const key = `${item.id}-${item.process ?? 'pending'}`;
    if (!grouped[key]) {
      grouped[key] = { ...item };
    } else {
      grouped[key].quantity += item.quantity;
    }
  }

  return Object.values(grouped);
}

const OrderItemsList: React.FC<OrderItemsListProps> = ({ items, billId, onMarkProductReady }) => {
  const groupedItems = groupProducts(items);

  const pendingItems = groupedItems.filter(item => item.process === "pending");

  return (
    <div className="order-items-list">
      <p className="items-header">ITEMS DEL PEDIDO:</p>
      <div className="items-grid">
        {pendingItems.length > 0 ? (
          pendingItems.map((item) => (
            <div key={`${item.id}-${item.product_name}`} className="item-row">
              <span className="item-quantity">{item.quantity}x</span>
              <span className="item-name">{item.product_name}</span>

              <button
                className="item-ready-btn"
                onClick={() => onMarkProductReady(billId, item.id)}
                disabled={item.process === "ready"}
                title="Marcar como listo"
              >
                Listo
              </button>
            </div>
          ))
        ) : (
          <p className="no-items">No hay productos pendientes</p>
        )}
      </div>
    </div>
  );
};

export default OrderItemsList;
