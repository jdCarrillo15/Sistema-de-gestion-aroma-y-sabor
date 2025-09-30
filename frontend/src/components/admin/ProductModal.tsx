import React, { useEffect, useState } from "react";
import Button from "../common/Button";
import "../../styles/admin/ProductosPage.css";

interface Product {
  id?: string;
  name: string;
  price: number;
  status: string;
  stock: number;
  type: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSaved: () => void;
}

const ProductModal: React.FC<Props> = ({ isOpen, onClose, product }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [status, setStatus] = useState("active");
  const [stock, setStock] = useState<number>(0);
  const [type, setType] = useState("nonprepared");

  useEffect(() => {
    if (isOpen && product) {
      setName(product.name);
      setPrice(product.price);
      setStatus(product.status);
      setStock(product.stock);
      setType(product.type);
    } else {
      setName("");
      setPrice(0);
      setStatus("active");
      setStock(0);
      setType("nonprepared");
    }
  }, [isOpen, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-header">
            <h2>{product ? "Editar Producto" : "Nuevo Producto"}</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Precio</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label>Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="prepared">Preparable</option>
                <option value="nonprepared">No Preparable</option>
              </select>
            </div>

            <div className="modal-buttons">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                {product ? "Guardar Cambios" : "Crear Producto"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
