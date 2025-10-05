// frontend/src/components/mesero/TableModal.tsx

import React, { useState, useEffect } from 'react';
import { Table, Order, Bill } from '../../types/mesero';
import { getOrdersByBillId, getBillById } from '../../services/mesero/mockData';
import Button from '../common/Button';
import ProductCatalog from './ProductCatalog';
import OrderItem from './OrderItem';
import '../../styles/mesero/TableModal.css';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table;
  onUpdate: () => void;
}

const TableModal: React.FC<TableModalProps> = ({ isOpen, onClose, table}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bill, setBill] = useState<Bill | null>(null);
  const [showCatalog, setShowCatalog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTableData();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, table]);

  const loadTableData = async () => {
    setIsLoading(true);
    try {
      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 300));

      if (table.current_bill_id) {
        const billData = getBillById(table.current_bill_id);
        const ordersData = getOrdersByBillId(table.current_bill_id);
        
        setBill(billData || null);
        setOrders(ordersData);
      } else {
        setBill(null);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddProduct = () => {
    setShowCatalog(true);
  };

  const handleProductSelect = (product: any, quantity: number) => {
    console.log('Producto seleccionado:', { product, quantity });
    // Agregar lógica con WebSocketas
    setShowCatalog(false);
    
    
    const newOrder: Order = {
      id: `order-${Date.now()}`,
      bill_id: table.current_bill_id || 'new-bill',
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      quantity,
      subtotal: product.price * quantity,
      status: 'pending',
    };
    
    setOrders(prev => [...prev, newOrder]);
  };

  const handleRemoveOrder = (orderId: string) => {
    console.log('Eliminar orden:', orderId);
    // TODO: Lgica con WebSocket
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  const handleEditOrder = (orderId: string) => {
    console.log('Editar orden:', orderId);
    // TODO: Implementar edición
  };

  const calculateTotal = () => {
    return orders.reduce((sum, order) => sum + order.subtotal, 0);
  };

  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: '#f59e0b',
      preparing: '#3b82f6',
      ready: '#10b981',
      delivered: '#6b7280',
    };
    return colors[status] || '#6b7280';
  };

  const getStatusText = (status: Order['status']) => {
    const texts = {
      pending: 'Pendiente',
      preparing: 'Preparando',
      ready: 'Listo',
      delivered: 'Entregado',
    };
    return texts[status] || status;
  };

  if (!isOpen) return null;

  const isFree = table.status === 'free';
  const total = calculateTotal();

  return (
    <>
      <div className="table-modal-backdrop" onClick={handleBackdropClick}>
        <div className="table-modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="table-modal-content">
            
           
            <div className="table-modal-header">
              <div className="header-left">
                <h2 className="modal-title">Mesa {table.number}</h2>
                <span className={`modal-badge ${table.status}`}>
                  {isFree ? 'Libre' : 'Ocupada'}
                </span>
              </div>
              <button className="modal-close-btn" onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            
            {bill && (
              <div className="bill-info">
                <div className="bill-name">
                  <strong>Cuenta:</strong> Mesa {table.number} - {bill.waiter_name || 'Sin asignar'}
                </div>
                <div className="bill-time">
                  <strong>Desde:</strong> {formatTime(bill.created_at)}
                </div>
              </div>
            )}

            
            <div className="products-section">
              <div className="section-header">
                <h3 className="section-title">
                  {isFree ? 'Productos de la Mesa' : 'Productos de la Cuenta'}
                </h3>
                <Button onClick={handleAddProduct} variant="primary">
                  <span className="btn-icon">+</span>
                  Agregar Producto
                </Button>
              </div>

              {isLoading ? (
                <div className="loading-orders">
                  <div className="spinner-small"></div>
                  <p>Cargando productos...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-orders">
                  <p className="empty-text">No hay productos para esta mesa</p>
                  <p className="empty-hint">
                    {isFree 
                      ? 'Asigna la mesa para comenzar a agregar productos'
                      : 'Haz clic en "Agregar Producto" para comenzar'
                    }
                  </p>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <OrderItem
                      key={order.id}
                      order={order}
                      onEdit={() => handleEditOrder(order.id)}
                      onRemove={() => handleRemoveOrder(order.id)}
                      getStatusColor={getStatusColor}
                      getStatusText={getStatusText}
                    />
                  ))}
                </div>
              )}
            </div>
            {orders.length > 0 && (
              <div className="modal-footer">
                <div className="footer-left">
                  <span className="footer-label">Total de la cuenta:</span>
                </div>
                <div className="footer-right">
                  <span className="total-amount">${total.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showCatalog && (
        <ProductCatalog
          isOpen={showCatalog}
          onClose={() => setShowCatalog(false)}
          onSelectProduct={handleProductSelect}
        />
      )}
    </>
  );
};

export default TableModal;