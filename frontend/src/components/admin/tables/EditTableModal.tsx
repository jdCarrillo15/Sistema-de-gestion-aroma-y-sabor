import React, { useState, useEffect } from "react";
import Button from "../../common/Button";
import ConfirmModal from "./../ConfirmModal";
import styles from "../../../styles/admin/users/CreateUserModal.module.css";

interface EditTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: any;
  onSubmit: (updatedTable: any) => void;
}

const EditTableModal: React.FC<EditTableModalProps> = ({
  isOpen,
  onClose,
  table,
  onSubmit,
}) => {
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    number: "",
    capacity: "",
  });

  useEffect(() => {
    if (isOpen && table) {
      setNumber(table.number.toString());
      setCapacity(table.capacity.toString());
      setErrors({
        number: "",
        capacity: "",
      });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, table]);

  const validateNumber = (num: string) => {
    if (!num.trim()) return "El número de mesa es requerido";
    const numVal = parseInt(num);
    if (isNaN(numVal) || numVal < 1) return "Debe ser un número mayor a 0";
    return "";
  };

  const validateCapacity = (cap: string) => {
    if (!cap.trim()) return "La capacidad es requerida";
    const capVal = parseInt(cap);
    if (isNaN(capVal) || capVal < 1) return "Debe ser un número mayor a 0";
    return "";
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !isSubmitting) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const confirmUpdate = async () => {
    setIsSubmitting(true);
    try {
      const updatedTable = {
        id: table.id,
        number: parseInt(number),
        capacity: parseInt(capacity),
        status: table.status,
        current_bill_id: table.current_bill_id,
        created_at: table.created_at,
      };

      await onSubmit(updatedTable);
      setIsConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error("Error al actualizar mesa:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const numberError = validateNumber(number);
    const capacityError = validateCapacity(capacity);

    setErrors({
      number: numberError,
      capacity: capacityError,
    });

    if (numberError || capacityError) return;

    setIsConfirmOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
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
                disabled={isSubmitting}
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>

            <h2 className={styles.modalTitle}>Editar Mesa</h2>
            <p className={styles.modalDescription}>
              Modifica la información de la mesa seleccionada.
            </p>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="number" className={styles.formLabel}>
                  Número de mesa
                </label>
                <input
                  type="text"
                  id="number"
                  value={number}
                  onChange={handleNumberChange}
                  className={`${styles.formInput} ${errors.number ? styles.error : ''}`}
                  disabled={true}
                  required
                />
                {errors.number && (
                  <span className={styles.errorMessage}>{errors.number}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="capacity" className={styles.formLabel}>
                  Capacidad (personas)
                </label>
                <input
                  type="text"
                  id="capacity"
                  value={capacity}
                  onChange={handleCapacityChange}
                  className={`${styles.formInput} ${errors.capacity ? styles.error : ''}`}
                  placeholder="Número de personas"
                  disabled={isSubmitting}
                  required
                />
                {errors.capacity && (
                  <span className={styles.errorMessage}>{errors.capacity}</span>
                )}
              </div>

              <div className={styles.modalButtons}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => !isSubmitting && setIsConfirmOpen(false)}
        title="Confirmar modificación"
        message="¿Estás seguro de que deseas guardar los cambios de esta mesa?"
        onConfirm={confirmUpdate}
        confirmText={isSubmitting ? "Guardando..." : "Sí, guardar"}
        cancelText="Cancelar"
      />
    </>
  );
};

export default EditTableModal;