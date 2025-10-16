import React from 'react';
import { Table } from '../../types/mesero';
import { Users, Clock } from 'lucide-react';
import styles from '../../styles/mesero/TableCard.module.css';

interface TableCardProps {
  table: Table;
  onClick: () => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, onClick }) => {
  const getStatusInfo = () => {
    if (table.status === 'free') {
      return {
        label: 'Libre',
        statusClass: styles.free
      };
    }
    return {
      label: 'Ocupada',
      statusClass: styles.occupied
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className={`${styles.tableCard} ${statusInfo.statusClass}`}
      onClick={onClick}
    >
      <div className={styles.tableHeader}>
        <div className={styles.tableNumber}>
          <span className={styles.tableLabel}>Mesa </span>
          <span className={styles.tableDigit}>{table.number}</span>
        </div>
        <div className={`${styles.statusBadge} ${statusInfo.statusClass}`}>
          <span className={styles.statusLabel}>{statusInfo.label}</span>
        </div>
      </div>

      <div className={styles.tableInfo}>
        <div className={styles.infoItem}>
          <Users size={16} className={styles.infoIcon} />
          <span>{table.capacity} personas</span>
        </div>

        {table.status === 'occupied' && table.current_bill_id && (
          <div className={`${styles.infoItem} ${styles.active}`}>
            <Clock size={16} className={styles.infoIcon} />
            <span>Cuenta abierta</span>
          </div>
        )}
      </div>

      <div className={styles.tableFooter}>
        <button className={styles.tableActionBtn}>
          {table.status === 'free' ? 'Asignar' : 'Ver Cuenta'}
        </button>
      </div>
    </div>
  );
};

export default TableCard;