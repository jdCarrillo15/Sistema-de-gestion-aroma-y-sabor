// frontend/src/components/mesero/TableCard.tsx
import React from 'react';
import { Table } from '../../types/mesero';
import { Users, Clock, Bell } from 'lucide-react';
import styles from '../../styles/mesero/TableCard.module.css';
import { useNotifications } from '../../context/notificationContext';

interface TableCardProps {
  table: Table;
  onClick: () => void;
}

const TableCard: React.FC<TableCardProps> = ({ table, onClick }) => {
  const { hasUnreadForTable, getUnreadCountForTable } = useNotifications();
  
  
  const hasNotifications = table.current_bill_id 
    ? hasUnreadForTable(table.current_bill_id)
    : false;
    
  
  const notificationCount = table.current_bill_id
    ? getUnreadCountForTable(table.current_bill_id)
    : 0;

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
      className={`${styles.tableCard} ${statusInfo.statusClass} ${hasNotifications ? styles.hasNotification : ''}`}
      onClick={onClick}
    >
      
      {hasNotifications && (
        <div className={styles.notificationBadge}>
          <Bell size={14} />
          {notificationCount > 1 && (
            <span className={styles.notificationCount}>{notificationCount}</span>
          )}
        </div>
      )}

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