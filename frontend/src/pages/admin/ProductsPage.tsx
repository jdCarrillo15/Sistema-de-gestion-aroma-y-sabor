import React, { useState, useEffect } from "react";
import { Plus, Edit3, Trash2, Eye, Package, Users } from "lucide-react";
import Button from "../../components/common/Button";
import CreateProductModal from "../../components/admin/products/CreateProductModal";
import EditProductModal from "../../components/admin/products/EditProductModal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import AlertModal from "../../components/common/AlertModal";
import ViewProductModal from "../../components/admin/products/ViewProductModal";
import styles from "../../styles/admin/products/ProductsPage.module.css";
import { getProducts, createProduct, updateProductById, hardDeleteProduct } from "../../services/admin/productService";


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
  const [isLoading, setIsLoading] = useState(false);
  const totalProducts = products.length;

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getProducts();
      const productsData = Array.isArray(response) ? response : response?.products || [];
      setProducts(productsData);
    } catch (error: any) {
      console.error("Error cargando productos:", error);
      setAlertMessage(error.message || "Error al cargar los productos");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [])

  const openViewModal = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddProduct = async (productData: any) => {
    try {
      setIsLoading(true);

      if (!productData.name || productData.price === undefined || productData.price === null) {
        throw new Error("Faltan campos obligatorios");
      }

      await createProduct({
        name: productData.name,
        price: productData.price,
        status: productData.status || "active",
        stock: productData.stock || 0,
        type: productData.type || "nonprepared"
      });

      await loadProducts();
      setIsModalOpen(false);

      setAlertMessage("Producto creado exitosamente");
      setIsAlertOpen(true);

    } catch (error: any) {
      console.error("Error creando producto:", error);
      setAlertMessage(error.message || "No fue posible crear el producto");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = async (updatedProduct: Product) => {
    try {
      setIsLoading(true);

      if (!updatedProduct.name || updatedProduct.price === undefined || updatedProduct.price === null) {
        throw new Error("Faltan campos obligatorios al editar");
      }

      await updateProductById(updatedProduct.id, {
        name: updatedProduct.name,
        price: updatedProduct.price,
        status: updatedProduct.status,
        stock: updatedProduct.stock,
        type: updatedProduct.type
      });

      await loadProducts();
      setIsEditModalOpen(false);
      setSelectedProduct(null);

      setAlertMessage("Producto actualizado exitosamente");
      setIsAlertOpen(true);

    } catch (error: any) {
      console.error("Error editando producto:", error);
      setAlertMessage(error.message || "No fue posible editar el producto");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
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

  const handleDeleteProduct = async (id: string) => {
    try {
      setIsLoading(true);

      await hardDeleteProduct(id);

      await loadProducts();
      setIsConfirmOpen(false);
      setProductToDelete(null);

      setAlertMessage("Producto eliminado exitosamente");
      setIsAlertOpen(true);

    } catch (error: any) {
      console.error("Error eliminando producto:", error);
      setAlertMessage(error.message || "No fue posible eliminar el producto");
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete !== null) {
      handleDeleteProduct(productToDelete);
    }
  };

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Gestión de Productos</h1>
        </div>

        <div className={styles.contenedorBoton}>
          <Button
            className={styles.btnNuevoProducto}
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading}
          >
            <Plus className={styles.icono} />
            Nuevo Producto
          </Button>
        </div>
      </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLeft}>
              <div className={`${styles.statIcon} ${styles.productos}`}>
                <Package size={20} />
              </div>
              <div>
                <div className={styles.statValue}>{totalProducts}</div>
                <div className={styles.statLabel}>Productos Totales</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.productosGrid}>
          {isLoading && products.length === 0 && (
            <div className={styles.loadingState}>
              <Package size={48} className={styles.loadingIcon} />
              <p>Cargando productos...</p>
            </div>
          )}

          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productCardHeader}>
                <h3 className={styles.productName}>{product.name}</h3>
                <span
                  className={`${styles.productStatus} ${product.status === "active" ? styles.statusActive : styles.statusInactive}`}
                >
                  {product.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div className={styles.productCardBody}>
                <div className={styles.productPrice}>
                  ${product.price.toLocaleString()}
                </div>

                <div className={styles.productActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    className={`${styles.btnIcon} ${styles.ver}`}
                    onClick={() => openViewModal(product)}
                    disabled={isLoading}
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className={`${styles.btnIcon} ${styles.editar}`}
                    onClick={() => openEditModal(product)}
                    disabled={isLoading}
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className={`${styles.btnIcon} ${styles.eliminar}`}
                    onClick={() => handleDeleteClick(product.id)}
                    disabled={isLoading}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {!isLoading && products.length === 0 && (
            <div className={styles.emptyState}>
              <Package size={48} className={styles.emptyIcon} />
              <h3>No hay productos</h3>
              <p>Crea tu primer producto para comenzar</p>
            </div>
          )}
        </div>

        <CreateProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddProduct}
        />

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
          title={alertMessage.includes("exitosamente") ? "Éxito" : "Error"}
          message={alertMessage}
          type={alertMessage.includes("exitosamente") ? "success" : "error"}
          buttonText="Cerrar"
        />
      </div>
      );
};

      export default ProductsPage;