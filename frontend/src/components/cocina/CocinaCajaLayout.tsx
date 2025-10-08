import React from 'react';
import { Outlet } from 'react-router-dom';
import CocinaCajaSidebar from './CocinaCajaSidebar';
import CocinaCajaTopbar from './CocinaCajaTopbar';
import '../../styles/cocina/CocinaCajaLayout.css';

const CocinaCajaLayout: React.FC = () => {
  return (
    <div className="cocina-caja-layout">
      <div className="cocina-caja-sidebar">
        <CocinaCajaSidebar />
      </div>

      <div className="cocina-caja-main">
        <CocinaCajaTopbar />
        
        <main className="cocina-caja-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CocinaCajaLayout;
