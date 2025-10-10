import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import CocinaCajaMobileNav from '../../components/cocina/CocinaCajaMobileNav';
import OrderCard from '../../components/cocina/OrderCard';
import ReadyOrderCard from '../../components/cocina/ReadyOrderCard';
import CajaPage from '../caja/CajaPage';
import '../../styles/cocina/CocinaPage.css';


import {
  Order,
  getOrders
} from '../../services/cocina/cocinaService';

const CocinaPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [_isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const { orders } = await getOrders();

      setOrders(orders);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleMarkReady = (orderId: string) => {
    setOrders(orders.map(order =>
      order.id === orderId ? { ...order, status: 'ready' as const } : order
    ));
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const readyOrders = orders.filter(o => o.status === 'ready');


  return (
    <div className="cocina-caja-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <p className="page-subtitle">
          </p>
        </div>
      </div>

      {/* Vista Cocina */}
  
        <>
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

          <div className="orders-section">
            <h3 className="section-title">Por Preparar</h3>
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
          </div>

          <div className="ready-section">
            <h3 className="section-title ready">
              <CheckCircle size={18} /> Listos para Entregar
            </h3>
            {readyOrders.length === 0 ? (
              <div className="empty-state">
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
    
      
      <CocinaCajaMobileNav
      />
    </div>
  );
};

export default CocinaPage;