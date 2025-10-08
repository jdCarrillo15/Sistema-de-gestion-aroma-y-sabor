import React, { useState, useEffect } from 'react';
import { Table } from '../../types/mesero';
import { Product } from '../../services/mesero/productService';
import { 
  getBillById, 
  createBill, 
  addProductToBill,
  Bill,
  BillProduct 
} from '../../services/mesero/billService';
import { getCurrentUser } from '../../services/login/authService';
import ProductCatalog from './ProductCatalog';
import OrderItem from './OrderItem';
import Button from '../common/Button';
import { X, Plus} from 'lucide-react';
import '../../styles/mesero/TableModal.css';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table;
  onUpdateTable: (tableId: string, updates: Partial<Table>) => void;
}

const TableModal: React.FC<TableModalProps> = ({ isOpen, onClose, table, onUpdateTable }) => {
  const [orders, setOrders] = useState<BillProduct[]>([]);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingBill, setIsCreatingBill] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Cargar cuenta cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadBill();
    }
  }, [isOpen, table.current_bill_id]);

  const loadBill = async () => {
    setIsLoading(true);
    try {
      if (table.current_bill_id) {
        const bill = await getBillById(table.current_bill_id);
        if (bill) {
          setCurrentBill(bill);
          setOrders(bill.products || []);
        }
      } else {
        setCurrentBill(null);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error cargando cuenta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBill = async () => {
    setIsCreatingBill(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        alert('No se pudo identificar el usuario');
        return;
      }

      const newBill = await createBill(table.number.toString(), user.uid);
      
      if (newBill) {
        setCurrentBill(newBill);
        onUpdateTable(table.id, {
          status: 'occupied',
          current_bill_id: newBill.id
        });
      } else {
        alert('Error al crear la cuenta');
      }
    } catch (error) {
      console.error('Error creando cuenta:', error);
      alert('Error al crear la cuenta');
    } finally {
      setIsCreatingBill(false);
    }
  };

  const handleAddProduct = async (product: Product, quantity: number) => {
    if (!currentBill) {
      alert('Primero debe crear una cuenta para esta mesa');
      return;
    }

    setIsAddingProduct(true);
    try {
      const success = await addProductToBill(currentBill.id, product.name, quantity);

      if (success) {
        
        await loadBill();

        
        setTimeout(() => {
          setIsCatalogOpen(false);
        }, 600);
      } else {
        alert('Error al agregar el producto');
      }
    } catch (error) {
      console.error('Error agregando producto:', error);
      alert('Error al agregar el producto');
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleRemoveOrder = (index: number) => {
    const newOrders = orders.filter((_, i) => i !== index);
    setOrders(newOrders);
    console.log('Producto removido');
  };

  const calculateTotal = (): number => {
    return currentBill?.total || 0;
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="table-modal-backdrop" onClick={handleBackdropClick}>
        <div className="table-modal-container" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="table-modal-header">
            <div className="header-info">
              <h2 className="modal-title">Mesa {table.number}</h2>
              <span className={`status-badge ${table.status}`}>
                {table.status === 'free' ? 'Libre' : 'Ocupada'}
              </span>
            </div>
            <button className="close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="table-modal-content">

            {!currentBill && !isLoading && (
              <div className="no-bill-state">
                <h3>Esta mesa no tiene una cuenta abierta</h3>
                <p>Crea una cuenta para comenzar a agregar productos</p>
                <Button 
                  variant="primary" 
                  onClick={handleCreateBill}
                  disabled={isCreatingBill}
                >
                  {isCreatingBill ? 'Creando...' : 'Crear Cuenta'}
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando cuenta...</p>
              </div>
            )}

            {currentBill && !isLoading && (
              <>
                <div className="orders-section">
                  <div className="section-header">
                    <h3 className="section-title">Productos</h3>
                    <Button 
                      variant="primary" 
                      className="add-product-btn"
                      onClick={() => setIsCatalogOpen(true)}
                    >
                      <Plus size={18} />
                      Agregar Producto
                    </Button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="empty-orders">
                      <p>No hay productos en esta cuenta</p>
                      <p className="empty-orders-subtitle">
                        Agrega productos usando el botón de arriba
                      </p>
                    </div>
                  ) : (
                    <div className="orders-list">
                      {orders.map((order, index) => (
                        <OrderItem 
                          key={index}
                          order={order}
                          onRemove={() => handleRemoveOrder(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="total-section">
                  <div className="total-row">
                    <span className="total-label">Total</span>
                    <span className="total-amount">${calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {currentBill && (
            <div className="table-modal-footer">
              <Button variant="secondary" onClick={onClose}>
                Cerrar
              </Button>
              <Button variant="primary" disabled={orders.length === 0}>
                Procesar Cuenta
              </Button>
            </div>
          )}
          {isAddingProduct && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Agregando producto...</p>
            </div>
          )}
        </div>
      </div>

      <ProductCatalog
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectProduct={handleAddProduct}
      />
    </>
  );
};

export default TableModal;
