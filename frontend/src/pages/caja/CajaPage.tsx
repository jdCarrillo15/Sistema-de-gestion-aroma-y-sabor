import React, { useState } from 'react';
import { DollarSign, Users, FileText, ArrowLeft } from 'lucide-react';
import Button from '../../components/common/Button';
import CocinaCajaMobileNav from '../../components/cocina/CocinaCajaMobileNav';
import '../../styles/caja/CajaPage.css';

type OrderItem = {
  name: string;
  price: number;
};

type ActiveTable = {
  id: number;
  time: string;
  duration: string;
  items: OrderItem[];
  total: number;
};

const CajaPage: React.FC = () => {
  const [showReport, setShowReport] = useState(false);


  const [activeTables, setActiveTables] = useState<ActiveTable[]>([
    {
      id: 5,
      time: '10:23',
      duration: '15 min',
      items: [
        { name: '1x Empanada Pollo', price: 3300 },
        { name: '2x Café', price: 2500 }
      ],
      total: 8300
    },
    {
      id: 12,
      time: '10:25',
      duration: '13 min',
      items: [
        { name: '1x Bandeja Paisa', price: 18500 },
        { name: '1x Jugo Natural', price: 4500 }
      ],
      total: 23000
    },
    {
      id: 3,
      time: '10:18',
      duration: '20 min',
      items: [
        { name: '2x Arepa con Queso', price: 5000 },
        { name: '1x Chocolate', price: 3000 }
      ],
      total: 8000
    },
    {
      id: 8,
      time: '10:28',
      duration: '10 min',
      items: [
        { name: '1x Almuerzo Ejecutivo', price: 15000 }
      ],
      total: 15000
    }
  ]);

  const reportData = {
    collected: 42000,
    orders: 4,
    average: 10600,
    history: [
      { table: 'Mesa 7', time: '09:45', amount: 12500, method: 'Efectivo' as const, status: 'paid' as const },
      { table: 'Mesa 1', time: '09:52', amount: 5600, method: 'Tarjeta' as const, status: 'paid' as const },
      { table: 'Llevar #32', time: '10:05', amount: 8900, method: 'Efectivo' as const, status: 'paid' as const },
      { table: 'Mesa 9', time: '10:12', amount: 15200, method: 'Transferencia' as const, status: 'paid' as const }
    ],
    totalDay: 42200
  };

  const handlePayOrder = (tableId: number) => {
    setActiveTables(prev => prev.filter(table => table.id !== tableId));
  };

  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString('es-CO')}`;
  };

  return (
    <div className="caja-page">
      {!showReport ? (
        <div className="caja-view-container">
          <div className="caja-view-header">
            <div className="caja-view-header-text">
              <h1 className="caja-view-title">Panel de Caja</h1>
            </div>
            <Button
              className="btn-report"
              onClick={() => setShowReport(true)}
            >
              <FileText className="btn-icon" />
              <span>Reporte</span>
            </Button>
          </div>

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
                        <h3 className="caja-table-number">Mesa {table.id}</h3>
                        <p className="caja-table-time">{table.time} • {table.duration}</p>
                      </div>
                      <div className="caja-table-total">
                        <p className="caja-total-label">TOTAL</p>
                        <p className="caja-total-amount">{formatPrice(table.total)}</p>
                      </div>
                    </div>

                    <div className="caja-table-details">
                      <p className="caja-details-label">DETALLE:</p>
                      {table.items.map((item, idx) => (
                        <div key={idx} className="caja-detail-item">
                          <span className="caja-item-name">{item.name}</span>
                          <span className="caja-item-price">{formatPrice(item.price)}</span>
                        </div>
                      ))}
                      <div className="caja-details-total">
                        <span className="caja-total-text">TOTAL:</span>
                        <span className="caja-total-price">{formatPrice(table.total)}</span>
                      </div>
                    </div>

                    <Button
                      className="btn-pay"
                      onClick={() => handlePayOrder(table.id)}
                    >
                      <DollarSign className="btn-icon" />
                      <span>Pagar {formatPrice(table.total)}</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="caja-view-container">
          <div className="caja-view-header">
            <div className="caja-view-header-text">
              <h1 className="caja-view-title">Panel de Caja</h1>
            </div>
            <Button
              className="btn-back"
              onClick={() => setShowReport(false)}
            >
              <ArrowLeft className="btn-icon" />
              <span>Volver</span>
            </Button>
          </div>

          <div className="caja-sales-card">
            <h3 className="caja-sales-title">Ventas del Día</h3>
            <div className="caja-sales-stats">
              <div className="caja-sales-stat">
                <p className="caja-stat-label">Recaudado</p>
                <p className="caja-stat-value">{formatPrice(reportData.collected)}</p>
              </div>
              <div className="caja-sales-stat">
                <p className="caja-stat-label">Pagadas</p>
                <p className="caja-stat-value">{reportData.orders}</p>
              </div>
              <div className="caja-sales-stat">
                <p className="caja-stat-label">Promedio</p>
                <p className="caja-stat-value">{formatPrice(reportData.average)}</p>
              </div>
            </div>
          </div>

          <div className="caja-history-card">
            <div className="caja-history-content">
              <h3 className="caja-history-title">Historial de Pagos</h3>
              <div className="caja-history-list">
                {reportData.history.map((payment, idx) => (
                  <div key={idx} className="caja-history-item">
                    <div className="caja-payment-info">
                      <p className="caja-payment-table">{payment.table}</p>
                      <p className="caja-payment-time">{payment.time}</p>
                      <span className={`caja-payment-method ${payment.method.toLowerCase()}`}>
                        {payment.method}
                      </span>
                    </div>
                    <p className="caja-payment-amount">{formatPrice(payment.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="caja-total-day-card">
            <p className="caja-total-day-label">TOTAL DEL DÍA</p>
            <p className="caja-total-day-amount">{formatPrice(reportData.totalDay)}</p>
          </div>
        </div>
      )}
      <CocinaCajaMobileNav
      />
    </div>
  );
};

export default CajaPage;