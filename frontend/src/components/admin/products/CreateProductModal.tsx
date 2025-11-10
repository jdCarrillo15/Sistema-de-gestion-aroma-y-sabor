import React, { useState, useEffect } from "react";
import Button from "../../common/Button";
import styles from "../../../styles/admin/users/CreateUserModal.module.css";

export type Product = {
  id?: string;
  name: string;
  price: number;
  status: "active" | "inactive";
  stock: number;
  type: "prepared" | "nonprepared";
  created_at?: string;
};

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: Product) => void;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [type, setType] = useState<"prepared" | "nonprepared">("nonprepared");

  const [errors, setErrors] = useState({
    name: "",
    price: "",
    stock: "",
  });

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPrice("");
      setStock("0");
      setType("nonprepared");
      setErrors({ name: "", price: "", stock: "" });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const validateName = (name: string) => {
    if (!name.trim()) {
      return "El nombre es requerido";
    }
    if (name.trim().length < 2) {
      return "Debe tener al menos 2 caracteres";
    }
    return "";
  };

  const validatePrice = (price: string) => {
    if (!price.trim()) {
      return "El precio es requerido";
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return "Ingresa un precio válido";
    }
    return "";
  };

  const validateStock = (stock: string) => {
    if (!stock.trim()) {
      return "El stock es requerido";
    }
    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      return "Ingresa un stock válido";
    }
    return "";
  };

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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    const error = validateName(value);
    setErrors(prev => ({ ...prev, name: error }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
      const error = validatePrice(value);
      setErrors(prev => ({ ...prev, price: error }));
    }
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setStock(value);
      const error = validateStock(value);
      setErrors(prev => ({ ...prev, stock: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    const priceError = validatePrice(price);
    const stockError = validateStock(stock);

    setErrors({
      name: nameError,
      price: priceError,
      stock: stockError,
    });

    if (nameError || priceError || stockError) {
      return;
    }

    onSubmit({
      name: name.trim(),
      price: parseFloat(price),
      status: "active",
      stock: parseInt(stock),
      type,
    });
    onClose();
  };

  if (!isOpen) return null;

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

          <h2 className={styles.modalTitle}>Nuevo Producto</h2>
          <p className={styles.modalDescription}>
            Completa los siguientes campos para crear un nuevo producto en el catálogo.
          </p>

          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.formLabel}>
                Nombre del producto
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={handleNameChange}
                className={`${styles.formInput} ${errors.name ? styles.error : ''}`}
                required
              />
              {errors.name && (
                <span className={styles.errorMessage}>{errors.name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price" className={styles.formLabel}>
                Precio
              </label>
              <input
                type="text"
                id="price"
                value={price}
                onChange={handlePriceChange}
                className={`${styles.formInput} ${errors.price ? styles.error : ''}`}
                placeholder="0.00"
                required
              />
              {errors.price && (
                <span className={styles.errorMessage}>{errors.price}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="stock" className={styles.formLabel}>
                Stock inicial
              </label>
              <input
                type="text"
                id="stock"
                value={stock}
                onChange={handleStockChange}
                className={`${styles.formInput} ${errors.stock ? styles.error : ''}`}
                placeholder="0"
                required
              />
              {errors.stock && (
                <span className={styles.errorMessage}>{errors.stock}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="type" className={styles.formLabel}>
                Tipo de producto
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as "prepared" | "nonprepared")}
                className={styles.formInput}
              >
                <option value="nonprepared">No preparable</option>
                <option value="prepared">Preparable</option>
              </select>
            </div>

            <div className={styles.modalButtons}>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Crear Producto
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;