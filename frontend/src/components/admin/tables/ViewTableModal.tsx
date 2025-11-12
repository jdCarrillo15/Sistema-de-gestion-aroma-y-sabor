import React, { useEffect } from "react";
import Button from "../../common/Button";
import styles from "../../../styles/admin/tables/ViewTableModal.module.css";

export type Table = {
  id: string;
  number: number;
  capacity: number;
  status: "free" | "occupied";
  current_bill_id: string | null;
  created_at?: string;
};

interface ViewTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table;
}

const ViewTableModal: React.FC<ViewTableModalProps> = ({
  isOpen,
  onClose,
  table,
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

  const getFormattedStatus = (status: string) => {
    return status === 'free' ? 'Libre' : 'Ocupada';
  };

  if (!isOpen || !table) return null;

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
              <path d="M3 12h18" />
              <path d="M3 6h18" />
              <path d="M3 18h18" />
            </svg>
          </div>

          <h2 className={styles.modalTitle}>Detalles de la Mesa</h2>
          <p className={styles.modalDescription}>
            Información completa de la mesa seleccionada.
          </p>

          <div className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Número de mesa</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                {table.number}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Capacidad</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                {table.capacity} {table.capacity === 1 ? 'persona' : 'personas'}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Estado</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                {getFormattedStatus(table.status)}
              </div>
            </div>

            {table.created_at && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Fecha de creación</label>
                <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                  {formatDate(table.created_at)}
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

export default ViewTableModal;