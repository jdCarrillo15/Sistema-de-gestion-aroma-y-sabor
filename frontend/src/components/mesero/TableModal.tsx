import React, { useState, useEffect } from 'react';
import { Table } from '../../types/mesero';
import { Product } from '../../services/mesero/productService';
import { 
  getBillById, 
  createBill, 
  addProductToBill,
  removeProductFromBill,
  closeBillIfEmpty,
  deleteBill,
  Bill,
  BillProduct 
} from '../../services/mesero/billService';
import { getCurrentUser } from '../../services/login/authService';
import ProductCatalog from './ProductCatalog';
import OrderItem from './OrderItem';
import Button from '../common/Button';
import { X, Plus } from 'lucide-react';
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
      alert('Error al cargar la cuenta. Por favor intenta de nuevo.');
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
      alert('Error al crear la cuenta: ' + (error as Error).message);
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
      const success = await addProductToBill(
        currentBill.id, 
        product.id,
        product.name, 
        quantity
      );

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
      alert('Error al agregar el producto: ' + (error as Error).message);
    } finally {
      setIsAddingProduct(false);
    }
  };

  
  const handleRemoveOrder = async (productId: string) => {
    if (!currentBill) return;

    if (!window.confirm('¿Estás seguro de eliminar este producto de la cuenta?')) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await removeProductFromBill(currentBill.id, productId);
      
      if (result.success) {
        await loadBill();
        
        
        const updatedBill = await getBillById(currentBill.id);
        if (updatedBill && (!updatedBill.products || updatedBill.products.length === 0)) {
          const shouldClose = window.confirm('La cuenta quedó vacía. ¿Deseas cerrarla?');
          if (shouldClose) {
            await handleCloseBill();
          }
        }
      }
    } catch (error) {
      console.error('Error eliminando producto:', error);
      alert('Error al eliminar el producto: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseBill = async () => {
    if (!currentBill) return;

    try {
      await closeBillIfEmpty(currentBill.id);
      
      onUpdateTable(table.id, {
        status: 'free',
        current_bill_id: null
      });
      
      onClose();
      alert('Cuenta cerrada exitosamente');
    } catch (error) {
      console.error('Error cerrando cuenta:', error);
      alert('Error al cerrar la cuenta: ' + (error as Error).message);
    }
  };

  const handleDeleteBill = async () => {
    if (!currentBill) return;

    if (!window.confirm('¿Estás seguro de eliminar esta cuenta? Esta acción no se puede deshacer.')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteBill(currentBill.id);
      
      onUpdateTable(table.id, {
        status: 'free',
        current_bill_id: null
      });
      
      onClose();
      alert('Cuenta eliminada exitosamente');
    } catch (error) {
      console.error('Error eliminando cuenta:', error);
      alert('Error al eliminar la cuenta: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
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
                      disabled={isAddingProduct}
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
                          key={`${order.id}-${index}`}
                          order={order}
                          onRemove={() => handleRemoveOrder(order.id)}
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
              <div className="footer-left">
                <Button 
                  variant="secondary" 
                  onClick={handleDeleteBill}
                  disabled={isLoading}
                >
                  Eliminar Cuenta
                </Button>
              </div>
              <div className="footer-right">
                <Button variant="secondary" onClick={onClose}>
                  Cerrar
                </Button>
                {orders.length === 0 ? (
                  <Button 
                    variant="primary" 
                    onClick={handleCloseBill}
                    disabled={isLoading}
                  >
                    Cerrar Cuenta
                  </Button>
                ) : (
                  <Button variant="primary" disabled={orders.length === 0}>
                    Procesar Cuenta
                  </Button>
                )}
              </div>
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