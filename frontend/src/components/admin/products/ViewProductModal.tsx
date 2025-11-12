import React, { useEffect } from "react";
import Button from "../../common/Button";
import styles from "../../../styles/admin/users/CreateUserModal.module.css";

export type Product = {
  id: string;
  name: string;
  price: number;
  status: "active" | "inactive";
  stock: number;
  type: "prepared" | "nonprepared";
  created_at?: string;
};

interface ViewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const ViewProductModal: React.FC<ViewProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No especificado";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getFormattedState = (status: string) => {
    if (!status) return "No especificado";
    const lowerState = status.toLowerCase();
    if (lowerState === "active" || lowerState === "activo") {
      return "Activo";
    } else if (lowerState === "inactive" || lowerState === "inactivo") {
      return "Inactivo";
    }
    return status;
  };

  if (!isOpen || !product) return null;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={styles.modalContainer}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div></div>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Cerrar"
              type="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className={styles.modalIcon}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>

          <h2 className={styles.modalTitle}>Detalles del Producto</h2>
          <p className={styles.modalDescription}>
            Información completa del producto seleccionado.
          </p>

          <div className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre del producto</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                {product.name || "No especificado"}
              </div>
            </div>


            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Precio</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                ${product.price.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Stock</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                {product.stock}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tipo de producto</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                {product.type === "prepared" ? "Preparable" : "No Preparable"}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Estado</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                {getFormattedState(product.status)}
              </div>
            </div>

            {product.created_at && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Fecha de creación</label>
                <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                  {formatDate(product.created_at)}
                </div>
              </div>
            )}
          </div>

          <div className={styles.modalButtons}>
            <Button type="button" variant="primary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;