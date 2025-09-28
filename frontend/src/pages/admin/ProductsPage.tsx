import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Eye, Package } from "lucide-react";
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

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    const mockProducts: Product[] = [
//COLOCAR EL COMPONENTE DE VER USUSARIOS AQUI

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

  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddProduct = (product: any) => {
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
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Gestión de Productos</h1>
        </div>
        <Button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus className="icono" />
          Nuevo Producto
        </Button>
      </div>

      {/* Vista de tarjetas de productos */}
      <div className="productos-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-card-header">
              <h3 className="product-name">{product.name}</h3>
            </div>
            
            <div className="product-card-body">
              <div className="product-price">
                ${product.price.toLocaleString()}
              </div>
              
              <div className="product-actions">
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
              </div>
            </div>
          </div>
        ))}
        
        {products.length === 0 && (
          <div className="empty-state">
            <Package size={48} className="empty-icon" />
            <h3>No hay productos</h3>
            <p>Crea tu primer producto para comenzar</p>
            <Button 
              className="primary-btn" 
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="icono" />
              Crear Producto
            </Button>
          </div>
        )}
      </div>

      {/* Modal para crear producto */}
      <CreateProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddProduct}
      />

      {/* Modal para editar producto */}
      {selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          product={selectedProduct}
          onSubmit={handleEditProduct}
        />
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmar eliminación"
        message="¿Estás seguro de que deseas eliminar este producto?"
        onConfirm={handleConfirmDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal para ver producto */}
      {selectedProduct && (
        <ViewProductModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          product={selectedProduct}
        />
      )}

      {/* Modal de alerta para errores */}
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