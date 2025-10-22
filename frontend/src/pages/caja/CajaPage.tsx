import React, { useState, useEffect } from 'react';
import { DollarSign, Users, FileText, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import CocinaCajaMobileNav from '../../components/cocina/CocinaCajaMobileNav';
import TableDetailModal from '../../components/caja/TableDetailModal';
import '../../styles/caja/CajaPage.css';
import { ActiveTable } from '../../services/cocina/cocinaTypes';
import { connectSocket, getSocket } from "../../services/sockets/socket";
import {
  getActiveBills,
  getPaidBills,
  payBill,
  calculateDuration,
  formatTime,
  formatPrice,
  handleApiError,
  type Bill,
  type Product,
} from '../../services/caja/cajaServices';
import { DefaultEventsMap } from '@socket.io/component-emitter';
import { Socket } from 'socket.io-client';

type OrderItem = {
  name: string;
  price: number;
  units: number;
};

type PaymentHistoryItem = {
  id: string;
  table: string;
  time: string;
  amount: number;
  method: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  status: 'paid';
};

const CajaPage: React.FC = () => {
  const [showReport, setShowReport] = useState(false);
  const [selectedTable, setSelectedTable] = useState<ActiveTable | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [activeTables, setActiveTables] = useState<ActiveTable[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    let mounted = true;
    let socket: Socket<DefaultEventsMap, DefaultEventsMap> | null = null;

    async function setupSocket() {
      try {
        socket = getSocket();

        if (!socket.connected) {
          console.log("Esperando conexión de socket...");
          socket.connect();
        }

        socket.on("nuevaCuenta", (newBill) => {
          if (!mounted) return;

          setActiveTables((prev) => {
            // Evita duplicados
            if (prev.some((t) => t.id === newBill.id)) return prev;

            const newTable: ActiveTable = {
              id: newBill.id,
              table: newBill.table,
              time: formatTime(newBill.created_at),
              duration: calculateDuration(newBill.created_at),
              items: (newBill.products || []).map((p: { units: any; name: any; price: any; }) => ({
                name: `${p.units}x ${p.name}`,
                price: Number(p.price) || 0,
                units: p.units,
              })),
              total: newBill.total,
            };

            return [newTable, ...prev];
          });
        });

        socket.on("cuentaEliminada", ({ id }) => {
          if (!mounted) return;
          setActiveTables((prev) => prev.filter((t) => t.id !== id));
        });

        socket.on("cuentaActualizada", ({ id, data }) => {
          if (!mounted) return;

          setActiveTables((prev) => {
            const exists = prev.some((t) => t.id === id);
            if (!exists) {
              loadActiveBills();
              return prev;
            }

            return prev.map((t) => {
              if (t.id !== id) return t;
              if (data.status === "paid" || data.status === "closed") {
                return null;
              }
              return {
                ...t,
                total: data.total ?? t.total,
                items:
                  data.products
                    ? mergeProducts(data.products).map((p) => ({
                      name: `${p.units}x ${p.name}`,
                      price: Number(p.price) || 0,
                      units: p.units,
                    }))
                    : t.items,
              };
            }).filter(Boolean) as ActiveTable[];
          });
        });

      } catch (err) {
        console.error("Error configurando socket:", err);
      }
    }

    setupSocket();

    return () => {
      mounted = false;
      try {
        if (socket) {
          socket.off("nuevaCuenta");
          socket.off("cuentaEliminada");
          socket.off("cuentaActualizada");
        }
      } catch (err) {
        console.warn("Error limpiando listeners:", err);
      }
    };
  }, []);


  useEffect(() => {
    loadActiveBills();

    const interval = setInterval(() => {
      loadActiveBills();
      if (showReport) {
        loadPaymentHistory();
      }
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, [showReport]);

  useEffect(() => {
    if (showReport) {
      loadPaymentHistory();
    }
  }, [showReport]);


  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  useEffect(() => {
    const socket = connectSocket();

    socket.emit("joinRoom", "cash");

    return () => {
      socket.emit("leaveRoom", "cash");
    };
  }, []);

  const loadActiveBills = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getActiveBills();

      const transformedTables: ActiveTable[] = response.bills.map((bill: Bill) => {
        console.debug('bill.products:', bill.products);

        const mergedProducts = mergeProducts(bill.products);

        const items: OrderItem[] = mergedProducts.map((product: Product) => {
          const parsedPrice = Number(product.price);
          const price = Number.isFinite(parsedPrice) ? parsedPrice : 0;

          return {
            name: `${product.units}x ${product.name}`,
            price,
            units: product.units,
          };
        });

        const tableName = bill.table;

        return {
          id: bill.id,
          table: tableName,
          time: formatTime(bill.created_at),
          duration: calculateDuration(bill.created_at),
          items,
          total: bill.total,
        };
      });

      setActiveTables(transformedTables);
      console.log(`${transformedTables.length} mesas activas cargadas`);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Error cargando cuentas activas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const response = await getPaidBills();

      const transformedHistory: PaymentHistoryItem[] = response.bills.map((bill: Bill) => {
        const tableName = bill.table.startsWith('Mesa')
          ? bill.table
          : `Mesa ${bill.table}`;

        return {
          id: bill.id,
          table: tableName,
          time: formatTime(bill.paid_at || bill.created_at),
          amount: bill.total,
          method: bill.payment_method || 'Efectivo',
          status: 'paid' as const,
        };
      });

      transformedHistory.sort((a, b) => b.time.localeCompare(a.time));

      setPaymentHistory(transformedHistory);
      console.log(`${transformedHistory.length} pagos en el historial`);
    } catch (err) {
      console.error('Error cargando historial de pagos:', err);
    }
  };

  const handlePayOrder = async (
    tableId: string,
    paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia' = 'Efectivo'
  ) => {
    try {
      await payBill(tableId, paymentMethod);

      setActiveTables((prev) => prev.filter((table) => table.id !== tableId));

      if (showReport) {
        setTimeout(() => loadPaymentHistory(), 500);
      }

      if (isModalOpen) {
        handleCloseModal();
      }

      console.log(`Pago procesado para mesa ${tableId}`);
    } catch (err) {
      const errorMessage = handleApiError(err);
      alert(`Error al procesar el pago: ${errorMessage}`);
      console.error('Error pagando cuenta:', err);
    }
  };

  const handleOpenModal = (table: ActiveTable) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTable(null);
  };

  const calculateDayStats = () => {
    const collected = paymentHistory.reduce((sum, payment) => sum + payment.amount, 0);
    const orders = paymentHistory.length;
    const average = orders > 0 ? Math.round(collected / orders) : 0;

    return { collected, orders, average };
  };

  const dayStats = calculateDayStats();
  const MAX_VISIBLE_ITEMS = 2;

  // Agrupa productos iguales sumando sus unidades
  function mergeProducts(products: Product[]): Product[] {
    const grouped: Record<string, Product> = {};

    for (const p of products) {
      const key = `${p.name}-${p.price}`;
      if (grouped[key]) {
        grouped[key].units += p.units;
      } else {
        grouped[key] = { ...p };
      }
    }

    return Object.values(grouped);
  }

  return (
    <>
      <div className="caja-page">
        {!showReport ? (
          <div className="caja-view-container">
            <div className="caja-view-header">
              <div className="caja-view-header-text">
                <h1 className="caja-view-title">Panel de Caja</h1>
              </div>
              <Button className="btn-report" onClick={() => setShowReport(true)}>
                <FileText className="btn-icon" />
                <span>Reporte</span>
              </Button>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div
                style={{
                  padding: '1rem',
                  marginBottom: '1rem',
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '0.5rem',
                  color: '#991b1b',
                }}
              >
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Tarjetas de resumen */}
            <div className="caja-summary-cards">
              <div className="caja-summary-card summary-card-orange">
                <div className="caja-summary-card-content">
                  <div className="caja-summary-card-icon orange">
                    <Users className="icon" />
                  </div>
                  <div className="caja-summary-card-info">
                    <p className="caja-summary-label">Activas</p>
                    <p className="caja-summary-value">{activeTables.length}</p>
                  </div>
                </div>
              </div>

              <div className="caja-summary-card summary-card-green">
                <div className="caja-summary-card-content">
                  <div className="caja-summary-card-icon green">
                    <DollarSign className="icon" />
                  </div>
                  <div className="caja-summary-card-info">
                    <p className="caja-summary-label">Total</p>
                    <p className="caja-summary-value">
                      {formatPrice(activeTables.reduce((sum, table) => sum + table.total, 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de mesas activas */}
            {isLoading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: '#6b7280',
                  fontSize: '1.1rem',
                }}
              >
                Cargando cuentas activas...
              </div>
            ) : (
              <div className="caja-tables-grid">
                {activeTables.length === 0 ? (
                  <div className="caja-empty-state">
                    <DollarSign className="caja-empty-icon" />
                    <h3>No hay mesas activas</h3>
                    <p>Las mesas con pedidos pendientes aparecerán aquí</p>
                  </div>
                ) : (
                  activeTables.map((table) => (
                    <div key={table.id} className="caja-table-card">
                      <div className="caja-table-card-content">
                        <div className="caja-table-card-header">
                          <div className="caja-table-info">
                            <h3 className="caja-table-number">{table.table}</h3>
                            <p className="caja-table-time">
                              {table.time} • {table.duration}
                            </p>
                          </div>
                          <div className="caja-table-total">
                            <p className="caja-total-label">TOTAL</p>
                            <p className="caja-total-amount">{formatPrice(table.total)}</p>
                          </div>
                        </div>

                        <div className="caja-table-details">
                          <p className="caja-details-label">DETALLE:</p>
                          {table.items.slice(0, MAX_VISIBLE_ITEMS).map((item, idx) => (
                            <div key={idx} className="caja-detail-item">
                              <span className="caja-item-name">{item.name}</span>
                              <span className="caja-item-price">
                                {formatPrice(item.price * item.units)}
                              </span>
                            </div>
                          ))}

                          {table.items.length > MAX_VISIBLE_ITEMS && (
                            <button
                              className="caja-more-items-btn"
                              onClick={() => handleOpenModal(table)}
                            >
                              <span>Ver más (+{table.items.length - MAX_VISIBLE_ITEMS})</span>
                            </button>
                          )}

                          <div className="caja-details-total">
                            <span className="caja-total-text">TOTAL:</span>
                            <span className="caja-total-price">{formatPrice(table.total)}</span>
                          </div>
                        </div>

                        <Button className="btn-pay" onClick={() => handlePayOrder(table.id)}>
                          <DollarSign className="btn-icon" />
                          <span>Pagar {formatPrice(table.total)}</span>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="caja-view-container">
            <div className="caja-view-header">
              <div className="caja-view-header-text">
                <h1 className="caja-view-title">Panel de Caja</h1>
              </div>
              <Button className="btn-back" onClick={() => setShowReport(false)}>
                <ArrowLeft className="btn-icon" />
                <span>Volver</span>
              </Button>
            </div>

            {/* Tarjeta de ventas del día */}
            <div className="caja-sales-card">
              <h3 className="caja-sales-title">Ventas del Día</h3>
              <div className="caja-sales-stats">
                <div className="caja-sales-stat">
                  <p className="caja-stat-label">Recaudado</p>
                  <p className="caja-stat-value">{formatPrice(dayStats.collected)}</p>
                </div>
                <div className="caja-sales-stat">
                  <p className="caja-stat-label">Pagadas</p>
                  <p className="caja-stat-value">{dayStats.orders}</p>
                </div>
                <div className="caja-sales-stat">
                  <p className="caja-stat-label">Promedio</p>
                  <p className="caja-stat-value">{formatPrice(dayStats.average)}</p>
                </div>
              </div>
            </div>

            {/* Historial de pagos */}
            <div className="caja-history-card">
              <div className="caja-history-content">
                <h3 className="caja-history-title">Historial de Pagos</h3>
                <div className="caja-history-list">
                  {paymentHistory.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#6b7280',
                        padding: '2rem',
                        fontSize: '0.95rem',
                      }}
                    >
                      No hay pagos registrados hoy
                    </div>
                  ) : (
                    paymentHistory.map((payment) => (
                      <div key={payment.id} className="caja-history-item">
                        <div className="caja-payment-info">
                          <p className="caja-payment-table">{payment.table}</p>
                          <p className="caja-payment-time">{payment.time}</p>
                          <span className={`caja-payment-method ${payment.method.toLowerCase()}`}>
                            {payment.method}
                          </span>
                        </div>
                        <p className="caja-payment-amount">{formatPrice(payment.amount)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Total del día */}
            <div className="caja-total-day-card">
              <p className="caja-total-day-label">TOTAL DEL DÍA</p>
              <p className="caja-total-day-amount">{formatPrice(dayStats.collected)}</p>
            </div>
          </div>
        )}
        <CocinaCajaMobileNav />
      </div>

      {/* Modal de detalles */}
      <TableDetailModal
        isOpen={isModalOpen}
        table={selectedTable}
        onClose={handleCloseModal}
        onPay={handlePayOrder}
        formatPrice={formatPrice}
      />
    </>
  );
};

export default CajaPage;