import React, { useState, useEffect } from "react";
import Button from "../../common/Button";
import { UtensilsCrossed } from "lucide-react";
import "../../../styles/admin/products/CreateProductModal.css";

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (table: { number: number; capacity: number }) => void;
  isLoading?: boolean; 
}

const CreateTableModal: React.FC<CreateTableModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false, 
}) => {
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("");

  const [errors, setErrors] = useState({
    number: "",
    capacity: "",
  });

  useEffect(() => {
    if (isOpen) {
      setNumber("");
      setCapacity("");
      setErrors({ number: "", capacity: "" });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const validateNumber = (num: string) => {
    if (!num.trim()) {
      return "El número de mesa es requerido";
    }
    const numValue = parseInt(num);
    if (isNaN(numValue) || numValue < 1) {
      return "Ingresa un número válido mayor a 0";
    }
    return "";
  };

  const validateCapacity = (cap: string) => {
    if (!cap.trim()) {
      return "La capacidad es requerida";
    }
    const capValue = parseInt(cap);
    if (isNaN(capValue) || capValue < 1) {
      return "Ingresa una capacidad válida mayor a 0";
    }
    return "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !isLoading) {
      onClose();
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setNumber(value);
      const error = validateNumber(value);
      setErrors(prev => ({ ...prev, number: error }));
    }
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setCapacity(value);
      const error = validateCapacity(value);
      setErrors(prev => ({ ...prev, capacity: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numberError = validateNumber(number);
    const capacityError = validateCapacity(capacity);

    setErrors({
      number: numberError,
      capacity: capacityError,
    });

    if (numberError || capacityError) {
      return;
    }

    onSubmit({
      number: parseInt(number),
      capacity: parseInt(capacity),
    });
    
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-header">
            <button
              className="close-button"
              onClick={onClose}
              aria-label="Cerrar"
              disabled={isLoading}
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

          <h2 className="modal-title">Nueva Mesa</h2>
          <p className="modal-description">
            Completa los siguientes campos para crear una nueva mesa en el sistema.
          </p>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="number" className="form-label">Número de mesa</label>
              <input
                type="text"
                id="number"
                value={number}
                onChange={handleNumberChange}
                className={`form-input ${errors.number ? 'error' : ''}`}
                placeholder="Ej: 7"
                disabled={isLoading}
                required
              />
              {errors.number && (
                <span className="error-message">{errors.number}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="capacity" className="form-label">Capacidad (personas)</label>
              <input
                type="text"
                id="capacity"
                value={capacity}
                onChange={handleCapacityChange}
                className={`form-input ${errors.capacity ? 'error' : ''}`}
                placeholder="Ej: 4"
                disabled={isLoading}
                required
              />
              {errors.capacity && (
                <span className="error-message">{errors.capacity}</span>
              )}
            </div>

            <div className="modal-buttons">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner-small"></div>
                    Creando...
                  </>
                ) : (
                  'Crear Mesa'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTableModal;