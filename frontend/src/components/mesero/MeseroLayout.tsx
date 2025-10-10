import React from 'react';
import { Outlet } from 'react-router-dom';
import MeseroSidebar from './MeseroSidebar';
import MeseroTopbar from './MeseroTopbar';
import '../../styles/mesero/MeseroLayout.css';

const MeseroLayout: React.FC = () => {
  return (
    <div className="mesero-layout">
      <MeseroSidebar />
      
      <div className="mesero-main">
        <MeseroTopbar />
        <main className="mesero-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MeseroLayout;