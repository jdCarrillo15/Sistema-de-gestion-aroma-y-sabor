import React, { useState, useEffect } from "react";
import Button from "../../common/Button";
import { Package } from "lucide-react";
import "../../../styles/admin/products/CreateProductModal.css";

export type Product = {
  id: string;
  name: string;
  price: number;
  status: "active" | "inactive";
  stock: number;
  type: "prepared" | "nonprepared";
  created_at?: string;
};

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSubmit: (product: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
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
    if (isOpen && product) {
      setName(product.name);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setType(product.type);
      setErrors({ name: "", price: "", stock: "" });
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, product]);

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

    const updatedProduct: Product = {
      ...product,
      name: name.trim(),
      price: parseFloat(price),
      stock: parseInt(stock),
      type,
    };

    onSubmit(updatedProduct);
    onClose();
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

          <h2 className="modal-title">Editar Producto</h2>
          <p className="modal-description">
            Modifica la información del producto seleccionado.
          </p>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Nombre del producto</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={handleNameChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                required
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="price" className="form-label">Precio</label>
              <input
                type="text"
                id="price"
                value={price}
                onChange={handlePriceChange}
                className={`form-input ${errors.price ? 'error' : ''}`}
                placeholder="0.00"
                required
              />
              {errors.price && (
                <span className="error-message">{errors.price}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="stock" className="form-label">Stock</label>
              <input
                type="text"
                id="stock"
                value={stock}
                onChange={handleStockChange}
                className={`form-input ${errors.stock ? 'error' : ''}`}
                placeholder="0"
                required
              />
              {errors.stock && (
                <span className="error-message">{errors.stock}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="type" className="form-label">Tipo de producto</label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as "prepared" | "nonprepared")}
                className="form-input"
              >
                <option value="nonprepared">No Preparable</option>
                <option value="prepared">Preparable</option>
              </select>
            </div>

            <div className="modal-buttons">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Actualizar Producto
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;