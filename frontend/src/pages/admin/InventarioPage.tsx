import React, { useState } from "react";
import { Package, Search } from "lucide-react";
import ProductModal from "../../components/admin/products/ProductModal";
import styles from "../../styles/admin/InventarioPage.module.css";
import AlertModal from "../../components/common/AlertModal";
import { getProducts } from "../../services/admin/productService";

interface Product {
  id: number;
  name: string;
  price: number;
  process: string;
  status: string;
  stock: number;
  type: string;
}

interface SalesData {
  date: string;
  quantity: number;
  total: number;
}

const mockProducts: Product[] = [];

// const mockProducts: Product[] = [
//   {
//     id: 1,
//     name: "Empanada Pollo",
//     price: 3300,
//     process: "in process",
//     status: "active",
//     stock: 11,
//     type: "nonprepared",
//   },
//   {
//     id: 2,
//     name: "Café Latte",
//     price: 5500,
//     process: "completed",
//     status: "active",
//     stock: 25,
//     type: "prepared",
//   },
//   {
//     id: 3,
//     name: "Croissant",
//     price: 4200,
//     process: "completed",
//     status: "active",
//     stock: 8,
//     type: "nonprepared",
//   },
//   {
//     id: 4,
//     name: "Capuchino",
//     price: 4800,
//     process: "in process",
//     status: "active",
//     stock: 30,
//     type: "prepared",
//   },
//   {
//     id: 5,
//     name: "Brownie",
//     price: 3800,
//     process: "completed",
//     status: "active",
//     stock: 15,
//     type: "nonprepared",
//   },
//   {
//     id: 6,
//     name: "Sandwich Jamón",
//     price: 6500,
//     process: "pending",
//     status: "inactive",
//     stock: 3,
//     type: "nonprepared",
//   },
//   {
//     id: 7,
//     name: "Té Chai",
//     price: 4000,
//     process: "completed",
//     status: "active",
//     stock: 20,
//     type: "prepared",
//   },
//   {
//     id: 8,
//     name: "Galletas Avena",
//     price: 2500,
//     process: "completed",
//     status: "active",
//     stock: 40,
//     type: "nonprepared",
//   },
// ];

const mockSalesData: SalesData[] = [
  { date: "2023-2-15", quantity: 45, total: 49500 },
  { date: "2025-10-15", quantity: 15, total: 49500 },
  { date: "2025-10-16", quantity: 23, total: 75900 },
  { date: "2025-10-17", quantity: 18, total: 59400 },
  { date: "2025-10-18", quantity: 31, total: 102300 },
  { date: "2025-10-19", quantity: 27, total: 89100 },
  { date: "2025-10-20", quantity: 20, total: 66000 },
  { date: "2025-10-21", quantity: 25, total: 82500 },
  { date: "2025-10-22", quantity: 29, total: 95700 },
  { date: "2026-2-15", quantity: 65, total: 49500 },
  { date: "2026-2-16", quantity: 65, total: 49500 },
];

const InventarioPage: React.FC = () => {
  const [mockProducts, setProducts] = useState<Product[]>([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const loadProducts = async () => {
    // setIsLoading(true);
    try {
      const response = await getProducts();
      const productsData = Array.isArray(response)
        ? response
        : response?.products || [];
      const mappedProducts: Product[] = productsData.map((prod) => ({
        ...prod,
        process: prod.process || "completed",
      }));
      setProducts(mappedProducts);
    } catch (error: any) {
      console.error("Error cargando productos:", error);
      setAlertMessage(error.message || "Error al cargar los productos");
      setIsAlertOpen(true);
    } finally {
      // setIsLoading(true);
    }
  };
  loadProducts();

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
              <span className={styles.clickHint}>Click para ver detalles</span>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className={styles.emptyState}>
          <Package size={48} className={styles.emptyIcon} />
          <p className={styles.emptyText}>No se encontraron productos</p>
        </div>
      )}

      {selectedProduct && (
        <ProductModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          product={selectedProduct}
          salesData={mockSalesData}
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

export default InventarioPage;
