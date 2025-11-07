import React from "react";
import "../../styles/admin/Topbar.css";

const Topbar: React.FC = () => {
  return (
    <header className="topbar">
      <div className="topbar-container">
        <div className="topbar-user">
          <div className="topbar-avatar">A</div>
          <span className="topbar-username">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
