import React from "react";
import { Package } from "lucide-react";
import "../../../styles/admin/products/ViewProductModal.css";

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
            <Package size={64} />
          </div>

          <h2 className="modal-title">Detalles del Producto</h2>
          <p className="modal-description">
            Información completa del producto seleccionado.
          </p>
          
          <div className="product-details">
            <div className="detail-row">
              <span className="detail-label">Nombre:</span>
              <span className="detail-value">{product.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Precio:</span>
              <span className="detail-value">${product.price.toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Stock:</span>
              <span className="detail-value">{product.stock}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Tipo:</span>
              <span className="detail-value">
                {product.type === "prepared" ? "Preparable" : "No Preparable"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Estado:</span>
              <span className={`status-badge ${product.status === 'active' ? 'active' : 'inactive'}`}>
                {product.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            {product.created_at && (
              <div className="detail-row">
                <span className="detail-label">Fecha de creación:</span>
                <span className="detail-value">
                  {new Date(product.created_at).toLocaleDateString("es-ES")}
                </span>
              </div>
            )}
            <div className="detail-row">
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductModal;