import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Eye, Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import Button from "../../components/common/Button";
import CreateProductModal from "../../components/admin/CreateProductModal";
import EditProductModal from "../../components/admin/EditProductModal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import AlertModal from "../../components/common/AlertModal";
import ViewProductModal from "../../components/admin/ViewProductModal";
import "../../styles/admin/ProductsPage.css";

export type Product = {
  id: string;
  name: string;
  price: number;
  status: "active" | "inactive";
  stock: number;
  type: "prepared" | "nonprepared";
  created_at?: string;
};

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Estado del AlertModal
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  // Datos simulados iniciales
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Hamburguesa Clásica",
        price: 15000,
        status: "active",
        stock: 25,
        type: "prepared",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Pizza Margarita",
        price: 22000,
        status: "active",
        stock: 12,
        type: "prepared",
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        name: "Coca Cola 350ml",
        price: 3500,
        status: "active",
        stock: 50,
        type: "nonprepared",
        created_at: new Date().toISOString(),
      },
      {
        id: "4",
        name: "Papas Fritas",
        price: 8000,
        status: "inactive",
        stock: 0,
        type: "prepared",
        created_at: new Date().toISOString(),
      },
    ];
    setProducts(mockProducts);
  }, []);

  // Cálculo de estadísticas
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStock = products.filter(p => p.stock <= 5).length;

  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddProduct = (product: Product) => {
    try {
      if (!product.name || !product.price) {
        throw new Error("Faltan campos obligatorios");
      }

      const newProduct: Product = {
        ...product,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
      };

      setProducts((prev) => [...prev, newProduct]);
      setIsModalOpen(false);
    } catch (err: any) {
      setAlertMessage(err.message || "No fue posible crear el producto");
      setIsAlertOpen(true);
    }
  };

  const handleEditProduct = (updatedProduct: Product) => {
    try {
      if (!updatedProduct.name || !updatedProduct.price) {
        throw new Error("Faltan campos obligatorios al editar");
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );

      setIsEditModalOpen(false);
      setSelectedProduct(null);
    } catch (err: any) {
      setAlertMessage(err.message || "No fue posible editar el producto");
      setIsAlertOpen(true);
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
    setIsConfirmOpen(false);
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete !== null) {
      handleDeleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Gestión de Productos</h1>
          <p className="dashboard-sub">Administra tu inventario y catálogo</p>
        </div>
        <Button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus className="icono" />
          Nuevo Producto
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon productos">
              <Package size={20} />
            </div>
            <div>
              <div className="stat-value">{totalProducts}</div>
              <div className="stat-label">Productos Totales</div>
            </div>
          </div>
          <div className="stat-change positive">+12%</div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon activos">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="stat-value">{activeProducts}</div>
              <div className="stat-label">Productos Activos</div>
            </div>
          </div>
          <div className="stat-change positive">+8%</div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon inventario">
              <DollarSign size={20} />
            </div>
            <div>
              <div className="stat-value">${totalValue.toLocaleString()}</div>
              <div className="stat-label">Valor Inventario</div>
            </div>
          </div>
          <div className="stat-change positive">+15%</div>
        </div>

        <div className="stat-card">
          <div className="stat-left">
            <div className="stat-icon stock-bajo">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="stat-value">{lowStock}</div>
              <div className="stat-label">Stock Bajo</div>
            </div>
          </div>
          <div className="stat-change negative">-5%</div>
        </div>
      </div>

      {/* Tabla */}
      <div className="productos-tabla-container">
        <table className="productos-tabla">
          <thead>
            <tr>
              <th>Nombre del producto</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Fecha de creación</th>
              <th className="acciones-col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="nombre">{product.name}</td>
                <td>${product.price.toLocaleString()}</td>
                <td>
                  <span className={product.stock <= 5 ? 'stock-low' : ''}>
                    {product.stock}
                  </span>
                </td>
                <td>{product.type === 'prepared' ? 'Preparado' : 'No preparado'}</td>
                <td>
                  <span
                    className={`estado ${
                      product.status === "active" ? "activo" : "inactivo"
                    }`}
                  >
                    {product.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  {product.created_at 
                    ? new Date(product.created_at).toLocaleDateString("es-ES")
                    : "-"}
                </td>
                <td className="acciones">
                  <Button
                    type="button"
                    variant="secondary"
                    className="btn-icon ver"
                    onClick={() => openViewModal(product)}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="btn-icon editar"
                    onClick={() => openEditModal(product)}
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="btn-icon eliminar"
                    onClick={() => handleDeleteClick(product.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

 
      {selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          product={selectedProduct}
          onSubmit={handleEditProduct}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este producto?"
        onConfirm={handleConfirmDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {selectedProduct && (
        <ViewProductModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          product={selectedProduct}
        />
      )}

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title="Error"
        message={alertMessage}
        type="error"
        buttonText="Cerrar"
      />
    </div>
  );
};

export default ProductsPage;