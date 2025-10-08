import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Users, DollarSign } from 'lucide-react';
import OrderCard from '../../components/cocina/OrderCard';
import ReadyOrderCard from '../../components/cocina/ReadyOrderCard';
import BillCard from '../../components/caja/BillCard';
import Button from '../../components/common/Button';
import '../../styles/cocina/CocinaCajaPage.css';

type ViewType = 'cocina' | 'caja';

import { 
  Order, 
  Bill, 
  PaidBill,
  getOrders,
  getActiveBills,
  getPaidBills
} from '../../services/cocina/cocinaService';

const CocinaCajaPage: React.FC = () => {
  const [activeView, _setActiveView] = useState<ViewType>('cocina');
  const [showReport, setShowReport] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [paidBills, setPaidBills] = useState<PaidBill[]>([]);
  const [_isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  setIsLoading(true);
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { orders } = await getOrders();
    const { bills } = await getActiveBills();
    const { paidBills } = await getPaidBills();

    setOrders(orders);
    setBills(bills);
    setPaidBills(paidBills);
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

  const handlePayBill = (bill: Bill) => {
    const paidBill: PaidBill = {
      ...bill,
      payment_method: 'Efectivo',
      paid_at: new Date().toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
    setPaidBills([...paidBills, paidBill]);
    setBills(bills.filter(b => b.id !== bill.id));
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const totalSales = paidBills.reduce((sum, bill) => sum + bill.total, 0);
  const avgTicket = totalSales / (paidBills.length || 1);

  return (
    <div className="cocina-caja-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {activeView === 'cocina' ? 'Panel de Cocina' : 
             showReport ? 'Reporte de Ventas' : 'Panel de Caja'}
          </h1>
          <p className="page-subtitle">
            {activeView === 'cocina' ? 'Gestiona los pedidos' : 
             showReport ? 'Ventas del día' : 'Gestiona los pagos'}
          </p>
        </div>
        
        {activeView === 'caja' && (
          <Button
            type="button"
            variant={showReport ? 'secondary' : 'primary'}
            onClick={() => setShowReport(!showReport)}
            className="report-toggle-btn"
          >
            {showReport ? '← Volver' : '📊 Reporte'}
          </Button>
        )}
      </div>

      {/* Vista Cocina */}
      {activeView === 'cocina' && (
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
      )}

      {/* Vista Caja */}
      {activeView === 'caja' && !showReport && (
        <>
          <div className="stats-grid-caja">
            <div className="stat-card">
              <div className="stat-icon orange">
                <Users size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-value">{bills.length}</p>
                <p className="stat-label">Activas</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <DollarSign size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-value">
                  ${(bills.reduce((sum, b) => sum + b.total, 0) / 1000).toFixed(0)}k
                </p>
                <p className="stat-label">Total</p>
              </div>
            </div>
          </div>

          <div className="bills-section">
            {bills.map(bill => (
              <BillCard
                key={bill.id}
                bill={bill}
                onPay={handlePayBill}
              />
            ))}
          </div>
        </>
      )}

      {/* Vista Reporte */}
      {activeView === 'caja' && showReport && (
        <>
          <div className="report-summary">
            <div className="summary-card">
              <p className="summary-label">Recaudado</p>
              <p className="summary-value">${(totalSales / 1000).toFixed(0)}k</p>
            </div>
            <div className="summary-card">
              <p className="summary-label">Pagadas</p>
              <p className="summary-value">{paidBills.length}</p>
            </div>
            <div className="summary-card">
              <p className="summary-label">Promedio</p>
              <p className="summary-value">${(avgTicket / 1000).toFixed(1)}k</p>
            </div>
          </div>

          <div className="report-section">
            <h3 className="section-title">Historial de Pagos</h3>
            <div className="report-list">
              {paidBills.map(bill => (
                <div key={bill.id} className="report-item">
                  <div className="report-item-info">
                    <h4 className="report-item-table">{bill.table_name}</h4>
                    <p className="report-item-time">{bill.created_at}</p>
                    <span className={`payment-badge ${bill.payment_method.toLowerCase()}`}>
                      {bill.payment_method}
                    </span>
                  </div>
                  <p className="report-item-total">
                    ${bill.total.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="report-total">
              <span>TOTAL DEL DÍA</span>
              <span className="report-total-amount">
                ${totalSales.toLocaleString()}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CocinaCajaPage;