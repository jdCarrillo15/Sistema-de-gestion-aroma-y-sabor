import React from "react";
import { UtensilsCrossed } from "lucide-react";
import "../../../styles/admin/tables/ViewTableModal.css";

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
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-header">
            <button
              className="close-button"
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

          <div className="modal-icon">
            <UtensilsCrossed size={64} />
          </div>

          <h2 className="modal-title">Detalles de la Mesa</h2>
          <p className="modal-description">
            Información completa de la mesa seleccionada.
          </p>

          <div className="table-details">
            <div className="detail-row">
              <span className="detail-label">Número de Mesa:</span>
              <span className="detail-value">{table.number}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Capacidad:</span>
              <span className="detail-value">{table.capacity} personas</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Estado:</span>
              <span className={`status-badge ${table.status === 'free' ? 'free' : 'occupied'}`}>
                {table.status === 'free' ? 'Libre' : 'Ocupada'}
              </span>
            </div>
            {table.current_bill_id && (
              <div className="detail-row">
                <span className="detail-label">ID de Cuenta:</span>
                <span className="detail-value">{table.current_bill_id}</span>
              </div>
            )}
            {table.created_at && (
              <div className="detail-row">
                <span className="detail-label">Fecha de creación:</span>
                <span className="detail-value">
                  {new Date(table.created_at).toLocaleDateString("es-ES")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTableModal;