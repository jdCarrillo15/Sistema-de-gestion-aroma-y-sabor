import React, { useState } from 'react';
import { Trash2, Loader, Edit2, Check, X } from 'lucide-react';
import { BillProduct } from '../../services/mesero/billService';
import '../../styles/mesero/OrderItem.css';

interface OrderItemProps {
  order: BillProduct;
  onRemove: () => void;
  onUpdateQuantity?: (newQuantity: number) => void;
}

const OrderItem: React.FC<OrderItemProps> = ({ 
  order, 
  onRemove, 
  onUpdateQuantity
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(order.units);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleRemove = async () => {
    if (!order.id) {
      alert('Error: El producto no tiene ID válido');
      return;
    }

    setIsDeleting(true);
    try {
      await onRemove();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar el producto');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditQuantity(order.units);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditQuantity(order.units);
  };

  const handleSaveEdit = async () => {
    if (editQuantity <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    if (editQuantity === order.units) {
      setIsEditing(false);
      return;
    }

    if (!onUpdateQuantity) {
      alert('No se puede actualizar la cantidad');
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateQuantity(editQuantity);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      alert('Error al actualizar la cantidad');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`order-item ${isDeleting ? 'deleting' : ''} ${isUpdating ? 'updating' : ''}`}>
      <div className="order-info">
        <div className="order-header">
          <h4 className="order-name">{order.name}</h4>
          {getStatusBadge(order.process)}
        </div>
        
        {/* Cantidad editable */}
        <div className="order-details">
          {isEditing ? (
            <div className="quantity-editor">
              <button 
                className="qty-btn-small"
                onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                disabled={isUpdating}
              >
                −
              </button>
              <input
                type="number"
                value={editQuantity}
                onChange={(e) => setEditQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="qty-input"
                min="1"
                disabled={isUpdating}
              />
              <button 
                className="qty-btn-small"
                onClick={() => setEditQuantity(editQuantity + 1)}
                disabled={isUpdating}
              >
                +
              </button>
              <span className="qty-label">unidades</span>
            </div>
          ) : (
            <span className="order-quantity">{order.units}x unidades</span>
          )}
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="order-actions">
        {isEditing ? (
          <>
            <button 
              className="action-btn save-btn" 
              onClick={handleSaveEdit}
              title="Guardar cambios"
              disabled={isUpdating}
            >
              {isUpdating ? <Loader size={18} className="spin" /> : <Check size={18} />}
            </button>
            <button 
              className="action-btn cancel-btn" 
              onClick={handleCancelEdit}
              title="Cancelar"
              disabled={isUpdating}
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <>
            {onUpdateQuantity && (
              <button 
                className="action-btn edit-btn" 
                onClick={handleEditClick}
                title="Editar cantidad"
                disabled={isDeleting || isUpdating}
              >
                <Edit2 size={18} />
              </button>
            )}
            <button 
              className="action-btn remove-btn" 
              onClick={handleRemove} 
              title="Eliminar producto"
              disabled={isDeleting || isUpdating || !order.id}
            >
              {isDeleting ? <Loader size={18} className="spin" /> : <Trash2 size={18} />}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderItem;