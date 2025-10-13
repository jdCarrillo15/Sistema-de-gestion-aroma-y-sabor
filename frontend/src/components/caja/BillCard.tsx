import React from 'react';
import {Bill} from '../../services/cocina/cocinaTypes';
import Button from '../common/Button';
import '../../styles/caja/BillCard.css';

interface BillCardProps {
  bill: Bill;
  onPay: (bill: Bill) => void;
}

const BillCard: React.FC<BillCardProps> = ({ bill, onPay }) => {
  return (
    <div className="bill-card">
      <div className="bill-header">
        <div>
          <h3 className="bill-table">{bill.table_name}</h3>
          <p className="bill-time">{bill.created_at} • {bill.duration}</p>
        </div>
        <div className="bill-total-box">
          <p className="bill-total-label">TOTAL</p>
          <p className="bill-total">${bill.total.toLocaleString()}</p>
        </div>
      </div>

      <div className="bill-details">
        <p className="bill-details-header">DETALLE:</p>
        <div className="bill-items">
          {bill.items.map((item) => (
            <div key={item.id} className="bill-item">
              <span className="bill-item-name">
                {item.quantity}x {item.product_name}
              </span>
              <span className="bill-item-price">
                ${item.price?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="bill-total-row">
          <span>TOTAL:</span>
          <span className="bill-total-amount">
            ${bill.total.toLocaleString()}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={() => onPay(bill)}
        className="pay-btn"
      >
        💰 Pagar ${bill.total.toLocaleString()}
      </Button>
    </div>
  );
};

export default BillCard;