import React, { useEffect, useState } from "react";
import Button from "../../components/common/Button";
import ProductModal from "../../components/admin/ProductModal";
import "../../styles/admin/ProductosPage.css";


interface Product {
  id: string;
  name: string;
  price: number;
  status: string;
  stock: number;
  type: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Cargar productos
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5000/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error cargando productos", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Eliminar producto
  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
      await fetch(`http://localhost:5000/products/${id}`, {
        method: "DELETE",
      });
      fetchProducts();
    } catch (err) {
      console.error("Error eliminando producto", err);
    }
  };

  return (
    <div className="admin-content">
      <div className="products-header">
        <h1 className="products-title">Gestión de Productos</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          + Nuevo Producto
        </Button>
      </div>

      <div className="products-grid">
        {products.length > 0 ? (
          products.map((p) => (
            <div key={p.id} className="product-card">
              <h3>{p.name}</h3>
              <p className="price">${p.price}</p>
              <p className={`status ${p.status}`}>{p.status}</p>
              <p>Stock: {p.stock}</p>
              <p>Tipo: {p.type}</p>

              <div className="card-actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditingProduct(p);
                    setIsModalOpen(true);
                  }}
                >
                  Editar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleDelete(p.id)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-message">No hay productos registrados.</p>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        onSaved={fetchProducts}
      />
    </div>
  );
};

export default ProductsPage;
