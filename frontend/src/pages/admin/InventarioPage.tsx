import React, { useState, useEffect } from "react";
import { Package, Search } from "lucide-react";
import ProductModal from "../../components/admin/products/ProductModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import styles from "../../styles/admin/InventarioPage.module.css";
import AlertModal from "../../components/common/AlertModal";
import {
  getProducts,
  getReportsByProduct,
} from "../../services/admin/productService";

interface Product {
  id: string;
  name: string;
  price: number;
  process: string;
  status: string;
  stock: number;
  type: string;
}

interface SalesData {
  initialDate: string;
  quantity: number;
  total: number;
}

const InventarioPage: React.FC = () => {
  const [mockProducts, setProducts] = useState<Product[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertType, setAlertType] = useState<
    "success" | "error" | "info" | "warning"
  >("info");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setIsAlertOpen(true);
  };

  const handleProductClick = async (product: Product) => {
    try {
      setIsLoadingReports(true);
      setSelectedProduct(product);
      setIsModalOpen(true);

      const { reports } = await getReportsByProduct(product.id);

      if (!reports || reports.length === 0) {
        showAlert(
          "Sin datos",
          "No hay reportes de ventas disponibles para este producto.",
          "info"
        );
        setSalesData([]);
      } else {
        const mappedReports = reports.map((report) => ({
          ...report,
          date: report.initialDate,
        }));
        setSalesData(mappedReports);
      }
    } catch (error: any) {
      console.error("Error al obtener reportes del producto:", error);
      showAlert(
        "Error al cargar reportes",
        error.message ||
          "No se pudieron cargar los reportes de ventas del producto. Por favor, intenta de nuevo.",
        "error"
      );
      setSalesData([]);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedProduct(null);
      setSalesData([]);
    }, 300);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getProducts();
      const productsData = Array.isArray(response)
        ? response
        : response?.products || [];

      if (productsData.length === 0) {
        showAlert(
          "Sin productos",
          "No hay productos disponibles en el inventario.",
          "info"
        );
      }

      const mappedProducts: Product[] = productsData.map((prod) => ({
        ...prod,
        process: prod.process || "completed",
      }));
      setProducts(mappedProducts);
    } catch (error: any) {
      console.error("Error cargando productos:", error);
      showAlert(
        "Error al cargar productos",
        error.message ||
          "No se pudieron cargar los productos del inventario. Por favor, verifica tu conexión e intenta de nuevo.",
        "error"
      );
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const getStatusColor = (status: string) => {
    return status === "active" ? styles.statusActive : styles.statusInactive;
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 5) return styles.stockLow;
    if (stock <= 15) return styles.stockMedium;
    return styles.stockHigh;
  };

  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.inventarioPage}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Package className={styles.icon} size={28} />
          <h1 className={styles.title}>Inventario</h1>
        </div>
        <p className={styles.subtitle}>
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "producto" : "productos"}
        </p>
      </div>

      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={20} />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner size={48} message="Cargando productos..." />
      ) : (
        <>
          <div className={styles.productsGrid}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={styles.productCard}
                onClick={() => handleProductClick(product)}
              >
                <div className={styles.cardHeader}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <span
                    className={`${styles.statusBadge} ${getStatusColor(
                      product.status
                    )}`}
                  >
                    {product.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.priceSection}>
                    <span className={styles.priceLabel}>Precio</span>
                    <span className={styles.priceValue}>
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <div className={styles.stockSection}>
                    <span className={styles.stockLabel}>Stock</span>
                    <span
                      className={`${styles.stockValue} ${getStockStatus(
                        product.stock
                      )}`}
                    >
                      {product.stock} unidades
                    </span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.clickHint}>
                    Click para ver detalles
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && !isLoading && (
            <div className={styles.emptyState}>
              <Package size={48} className={styles.emptyIcon} />
              <p className={styles.emptyText}>
                {searchTerm
                  ? "No se encontraron productos con ese nombre"
                  : "No hay productos en el inventario"}
              </p>
            </div>
          )}
        </>
      )}

      {selectedProduct && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={selectedProduct}
          salesData={salesData}
          isLoadingReports={isLoadingReports}
        />
      )}

      <AlertModal
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
        buttonText="Cerrar"
      />
    </div>
  );
};

export default InventarioPage;
