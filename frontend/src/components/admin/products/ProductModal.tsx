import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { X } from "lucide-react";
import styles from "../../../styles/admin/products/ProductModal.module.css";
import LoadingSpinner from "../../common/LoadingSpinner";

interface Product {
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

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  salesData: SalesData[];
  isLoadingReports?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  salesData,
  isLoadingReports = false,
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" });
  };

  const getStatusLabel = (status: string) => {
    return status === "active" ? "Activo" : "Inactivo";
  };

  const getTypeLabel = (type: string) => {
    return type === "nonprepared" ? "Sin Preparar" : "Preparado";
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.header}>
          <h2 className={styles.title}>{product.name}</h2>
          <div className={styles.statusBadge}>
            {getStatusLabel(product.status)}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <span className={styles.label}>Precio</span>
              <span className={styles.value}>{formatPrice(product.price)}</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.label}>Stock</span>
              <span className={styles.value}>{product.stock} unidades</span>
            </div>
            <div className={styles.infoCard}>
              <span className={styles.label}>Tipo</span>
              <span className={styles.value}>{getTypeLabel(product.type)}</span>
            </div>
          </div>

          <div className={styles.chartSection}>
            <h3 className={styles.chartTitle}>
              Ventas de las últimas 14 semanas
            </h3>
            {isLoadingReports ? (
              <LoadingSpinner size={32} message="Cargando reportes..." />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={salesData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis
                    dataKey="initialDate"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 12 }}
                    stroke="#666"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#666" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className={styles.tooltip}>
                            <p className={styles.tooltipDate}>
                              {new Date(
                                payload[0].payload.initialDate
                              ).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "long",
                              })}
                            </p>
                            <p className={styles.tooltipQuantity}>
                              Cantidad: {payload[0].payload.quantity} unidades
                            </p>
                            <p className={styles.tooltipTotal}>
                              Total: {formatPrice(payload[0].payload.total)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="quantity"
                    stroke="#D97706"
                    strokeWidth={3}
                    dot={{ fill: "#D97706", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
