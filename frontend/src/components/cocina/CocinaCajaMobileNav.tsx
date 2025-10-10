import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChefHat, DollarSign } from 'lucide-react';
import '../../styles/cocina/CocinaCajaMobileNav.css';

const CocinaCajaMobileNav: React.FC = () => {
  return (
    <nav className="mobile-nav">
      <NavLink
        to="/cocina"
        end
        className={({ isActive }) =>
          `mobile-nav-btn ${isActive ? 'active' : ''}`
        }
      >
        <ChefHat size={16} />
        Cocina
      </NavLink>
      
      <NavLink
        to="/caja"
        className={({ isActive }) =>
          `mobile-nav-btn ${isActive ? 'active' : ''}`
        }
      >
        <DollarSign size={16} />
        Caja
      </NavLink>
    </nav>
  );
};

export default CocinaCajaMobileNav;
