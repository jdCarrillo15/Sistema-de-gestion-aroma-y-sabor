import React from 'react';
import { Outlet } from 'react-router-dom';
import MeseroSidebar from './MeseroSidebar';
import MeseroTopbar from './MeseroTopbar';
import styles from '../../styles/mesero/MeseroLayout.module.css';

const MeseroLayout: React.FC = () => {
  return (
    <div className={styles.meseroLayout}>
      <MeseroSidebar />
      <div className={styles.meseroMain}>
        <MeseroTopbar />
        <main className={styles.meseroContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MeseroLayout;