// OrderItem.tsx
import React, { useState } from 'react';
import { Trash2, Loader, Edit2, Check, X } from 'lucide-react';
import { BillProduct } from '../../services/mesero/billService';
import AlertModal from '../common/AlertModal';
import styles from '../../styles/mesero/OrderItem.module.css';

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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', className: styles.pending },
      preparing: { label: 'Preparando', className: styles.preparing },
      ready: { label: 'Listo', className: styles.ready },
      finished: { label: 'Entregado', className: styles.finished }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <span className={`${styles.orderStatus} ${config.className}`}>{config.label}</span>;
  };

  const handleDeleteClick = () => {
    if (!order.id) {
      setErrorMessage('Error: El producto no tiene ID válido');
      setShowErrorAlert(true);
      return;
    }
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      await onRemove();
    } catch (error) {
      console.error('Error al eliminar:', error);
      setErrorMessage('Error al eliminar el producto. Por favor intenta de nuevo.');
      setShowErrorAlert(true);
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
      setErrorMessage('La cantidad debe ser mayor a 0');
      setShowErrorAlert(true);
      return;
    }

    if (editQuantity === order.units) {
      setIsEditing(false);
      return;
    }

    if (!onUpdateQuantity) {
      setErrorMessage('No se puede actualizar la cantidad');
      setShowErrorAlert(true);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateQuantity(editQuantity);
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar cantidad:', error);
      setErrorMessage('Error al actualizar la cantidad. Por favor intenta de nuevo.');
      setShowErrorAlert(true);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className={`${styles.orderItem} ${isDeleting ? styles.deleting : ''} ${isUpdating ? styles.updating : ''}`}>
        <div className={styles.orderInfo}>
          <div className={styles.orderHeader}>
            <h4 className={styles.orderName}>{order.name}</h4>
            {getStatusBadge(order.process)}
          </div>

          <div className={styles.orderDetails}>
            {isEditing ? (
              <div className={styles.quantityEditor}>
                <button
                  className={styles.qtyBtnSmall}
                  onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                  disabled={isUpdating}
                  type="button"
                >
                  −
                </button>
                <input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className={styles.qtyInput}
                  min="1"
                  disabled={isUpdating}
                />
                <button
                  className={styles.qtyBtnSmall}
                  onClick={() => setEditQuantity(editQuantity + 1)}
                  disabled={isUpdating}
                  type="button"
                >
                  +
                </button>
                <span className={styles.qtyLabel}>unidades</span>
              </div>
            ) : (
              <span className={styles.orderQuantity}>{order.units}x unidades</span>
            )}
          </div>
        </div>
        <div className={styles.orderActions}>
          {isEditing ? (
            <>
              <button
                className={`${styles.actionBtn} ${styles.saveBtn}`}
                onClick={handleSaveEdit}
                title="Guardar cambios"
                disabled={isUpdating}
                type="button"
              >
                {isUpdating ? (
                  <Loader size={18} className={styles.spin} />
                ) : (
                  <Check size={18} />
                )}
              </button>
              <button
                className={`${styles.actionBtn} ${styles.cancelBtn}`}
                onClick={handleCancelEdit}
                title="Cancelar"
                disabled={isUpdating}
                type="button"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <>
              {onUpdateQuantity && (
                <button
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={handleEditClick}
                  title="Editar cantidad"
                  disabled={isDeleting || isUpdating}
                  type="button"
                >
                  <Edit2 size={18} />
                </button>
              )}
              <button
                className={`${styles.actionBtn} ${styles.removeBtn}`}
                onClick={handleDeleteClick}
                title="Eliminar producto"
                disabled={isDeleting || isUpdating || !order.id}
                type="button"
              >
                {isDeleting ? (
                  <Loader size={18} className={styles.spin} />
                ) : (
                  <Trash2 size={18} />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <AlertModal
          isOpen={showDeleteConfirm}
          onClose={handleConfirmDelete}
          title="¿Eliminar producto?"
          message={`¿Estás seguro de que deseas eliminar "${order.name}" de la cuenta?`}
          type="warning"
          buttonText="Sí, eliminar"
          showSecondaryButton={true}
          secondaryButtonText="Cancelar"
          onSecondaryAction={() => setShowDeleteConfirm(false)}
        />
      )}

      <AlertModal
        isOpen={showErrorAlert}
        onClose={() => setShowErrorAlert(false)}
        title="Error"
        message={errorMessage}
        type="error"
        buttonText="Entendido"
      />
    </>
  );
};

export default OrderItem;