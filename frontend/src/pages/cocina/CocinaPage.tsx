import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import CocinaCajaMobileNav from '../../components/cocina/CocinaCajaMobileNav';
import OrderCard from '../../components/cocina/OrderCard';
import ReadyOrderCard from '../../components/cocina/ReadyOrderCard';
import '../../styles/cocina/CocinaPage.css';
import {
  Order,
  getOrders,
  markOrderReady,
  handleApiError
} from '../../services/cocina/cocinaService';
import { connectSocket } from '../../services/sockets/socket';

const CocinaPage: React.FC = () => {

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = connectSocket();
    socket.emit("joinRoom", "kitchen");


    socket.on("nuevoProducto", (productos) => {
      setOrders((prevOrders) => {
        const updatedOrders = [...prevOrders];

        productos.forEach((p: any) => {
          const orderId = `${p.billId}`;
          const existingOrder = updatedOrders.find((o) => o.id === orderId);

          if (existingOrder) {
            const alreadyExists = existingOrder.items.some((item) => item.id === p.id);
            if (!alreadyExists) {
              existingOrder.items.push({
                product_name: p.name,
                quantity: p.units,
                id: p.id,
                price: p.price,
              });
            }
          } else {
            updatedOrders.unshift({
              id: orderId,
              table_name: p.table,
              items: [
                {
                  product_name: p.name,
                  quantity: p.units,
                  id: p.id,
                  price: p.price,
                },
              ],
              status: p.process === "ready" ? "ready" : "pending",
              created_at: new Date().toISOString(),
              order_number: 0,
            });
          }
        });

        return updatedOrders;
      });
    });

    socket.on("productoActualizado", (updatedProduct) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.table_name !== updatedProduct.table) return order;
          const newItems = order.items.map((item) =>
            item.product_name === updatedProduct.name
              ? { ...item, process: updatedProduct.process }
              : item
          );
          return {
            ...order,
            items: newItems,
          };
        })
      );
    });

    socket.on("productoEliminado", ({ billId, productId }) => {
      setOrders((prevOrders) =>
        prevOrders
          .map((order) => {
            if (!order.id.startsWith(billId)) return order;
            const filteredItems = order.items.filter(
              (item) => `${billId}-${item.id}` !== `${billId}-${productId}`
            );

            if (filteredItems.length === 0) return null;

            return { ...order, items: filteredItems };
          })
          .filter(Boolean) as Order[]
      );
    });

    return () => {
      socket.emit("leaveRoom", "kitchen");
      socket.off("nuevoProducto");
      socket.off("productoActualizado");
      socket.off("productoEliminado");
    };
  }, []);


  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 120000); // 2 minutos

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(' Cargando pedidos...');
      const { orders: fetchedOrders } = await getOrders();
      setOrders(fetchedOrders);
      console.log(` ${fetchedOrders.length} pedidos cargados`);
    } catch (err) {
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      console.error('Error cargando datos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      console.log(`Marcando pedido ${orderId} como listo...`);

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: 'ready' as const } : order
      ));

      await markOrderReady(orderId);

      setTimeout(() => loadData(), 500);

      console.log(`Pedido ${orderId} marcado como listo`);
    } catch (err) {
      const errorMessage = handleApiError(err);
      alert(`Error al marcar pedido como listo: ${errorMessage}`);
      console.error('Error marcando pedido:', err);
      loadData();
    }
  };


  const pendingOrders = orders.filter(o => o.status === 'pending');
  const readyOrders = orders.filter(o => o.status === 'ready');


  return (
    <div className="cocina-caja-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cocina</h1>
          <p className="page-subtitle">
            Gestión de pedidos
          </p>
        </div>
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

      {/* Indicador de carga */}
      {isLoading && orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280',
            fontSize: '1.1rem',
          }}
        >
          Cargando pedidos...
        </div>
      ) : (
        <>
          {/* Estadísticas */}
          <div className="stats-grid-cocina">
            <div className="stat-card">
              <div className="stat-icon orange">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-value">{pendingOrders.length}</p>
                <p className="stat-label">Pendientes</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-value">{readyOrders.length}</p>
                <p className="stat-label">Listos</p>
              </div>
            </div>
          </div>

          {/* Sección de pedidos por preparar */}
          <div className="orders-section">
            <h3 className="section-title">Por Preparar</h3>
            {pendingOrders.length === 0 ? (
              <div className="empty-state">
                <Clock size={48} style={{ opacity: 0.3 }} />
                <p>No hay pedidos pendientes</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                  Los nuevos pedidos aparecerán aquí
                </p>
              </div>
            ) : (
              <div className="orders-list">
                {pendingOrders.map((order, index) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    index={index}
                    isNext={index === 0}
                    onMarkReady={handleMarkReady}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sección de pedidos listos */}
          <div className="ready-section">
            <h3 className="section-title ready">
              <CheckCircle size={18} /> Listos para Entregar
            </h3>
            {readyOrders.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={48} style={{ opacity: 0.3 }} />
                <p>No hay pedidos listos</p>
              </div>
            ) : (
              <div className="ready-list">
                {readyOrders.map(order => (
                  <ReadyOrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Navegación móvil */}
      <CocinaCajaMobileNav />
    </div>
  );
};

export default CocinaPage;