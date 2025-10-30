import React from "react";
import { UtensilsCrossed } from "lucide-react";
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
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContainer}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Cerrar"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className={styles.modalIcon}>
            <UtensilsCrossed size={64} />
          </div>

          <h2 className={styles.modalTitle}>Detalles de la Mesa</h2>
          <p className={styles.modalDescription}>
            Información completa de la mesa seleccionada.
          </p>

          <div className={styles.tableDetails}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Número de Mesa:</span>
              <span className={styles.detailValue}>{table.number}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Capacidad:</span>
              <span className={styles.detailValue}>{table.capacity} personas</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Estado:</span>
              <span className={`${styles.statusBadge} ${table.status === 'free' ? styles.free : styles.occupied}`}>
                {table.status === 'free' ? 'Libre' : 'Ocupada'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTableModal;