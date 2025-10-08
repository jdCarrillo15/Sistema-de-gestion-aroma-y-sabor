import React from 'react';
import { ChefHat, DollarSign } from 'lucide-react';
import '../../styles/cocina/CocinaCajaMobileNav.css';

interface CocinaCajaMobileNavProps {
  activeView: 'cocina' | 'caja';
  setActiveView: (view: 'cocina' | 'caja') => void;
}

const CocinaCajaMobileNav: React.FC<CocinaCajaMobileNavProps> = ({ 
  activeView, 
  setActiveView 
}) => {
  return (
    <nav className="mobile-nav">
      <button
        onClick={() => setActiveView('cocina')}
        className={`mobile-nav-btn ${activeView === 'cocina' ? 'active' : ''}`}
      >
        <ChefHat size={16} />
        Cocina
      </button>
      <button
        onClick={() => setActiveView('caja')}
        className={`mobile-nav-btn ${activeView === 'caja' ? 'active' : ''}`}
      >
        <DollarSign size={16} />
        Caja
      </button>
    </nav>
  );
};

export default CocinaCajaMobileNav;