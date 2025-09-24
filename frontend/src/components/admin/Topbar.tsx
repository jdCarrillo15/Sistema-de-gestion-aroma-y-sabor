import React from "react";
import { Search, Calendar } from "lucide-react";
import "../../styles/admin/Topbar.css";

const Topbar: React.FC = () => {
  return (
    <header className="topbar">
      <div className="topbar-container">
        <div className="topbar-search">
          <Search className="topbar-search-icon" />
          <input
            type="text"
            placeholder="Buscar..."
            className="topbar-search-input"
          />
        </div>

        {/* Sección derecha */}
        <div className="topbar-right">
          {/* Botón calendario */}
          <button className="topbar-calendar-button">
            <Calendar className="topbar-icon" />
          </button>

          {/* Usuario */}
          <div className="topbar-user">
            <div className="topbar-avatar">A</div>
            <span className="topbar-username">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
