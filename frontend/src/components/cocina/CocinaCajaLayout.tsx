import React from 'react';
import { Outlet } from 'react-router-dom';
import CocinaCajaSidebar from './CocinaCajaSidebar';
import CocinaCajaTopbar from './CocinaCajaTopbar';
//import '../../styles/cocina/CocinaCajaLayout.css';

const CocinaCajaLayout: React.FC = () => {
  return (
    <div className="cocina-caja-layout">
      {/* Sidebar para desktop */}
      <CocinaCajaSidebar />
      
      <div className="cocina-caja-main">
        <CocinaCajaTopbar />
        
        {/* Mobile Navigation */}
        
        <main className="cocina-caja-content">
          {/* Aquí se inyectan las rutas hijas */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CocinaCajaLayout;
