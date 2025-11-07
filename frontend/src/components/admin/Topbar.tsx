import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, ChevronDown } from "lucide-react";
import { getCurrentUser, logoutUser } from "../../services/login/authService";
import { disconnectSocket } from "../../services/sockets/socket";
import { useUser } from "../../context/userContext";
import "../../styles/admin/Topbar.css";

const Topbar: React.FC = () => {
  const user = getCurrentUser();
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isDropdownOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    (async () => {
      try {
        await logoutUser();
      } finally {
        try {
          setUser(null);
        } catch (err) {
          disconnectSocket();
        }
        navigate("/");
      }
    })();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="topbar">
      <div className="topbar-container">
        <div className="topbar-user-dropdown" ref={dropdownRef}>
          <button
            className="topbar-user-button"
            onClick={toggleDropdown}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <div className="topbar-avatar">A</div>
            <div className="topbar-user-info">
              <span className="topbar-username">{user?.email?.split('@')[0] || 'Admin'}</span>
              <span className="topbar-role">Administrador</span>
            </div>
            <ChevronDown
              className={`topbar-dropdown-icon ${isDropdownOpen ? 'open' : ''}`}
              size={20}
            />
          </button>

          {isDropdownOpen && (
            <>
              {/* Backdrop para móvil */}
              <div className="topbar-dropdown-backdrop" onClick={() => setIsDropdownOpen(false)}></div>

              <div className="topbar-dropdown-menu">
                <div className="topbar-dropdown-header">
                  <div className="topbar-dropdown-user-info">
                    <div className="topbar-dropdown-avatar">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="topbar-dropdown-name">{user?.email?.split('@')[0] || 'Admin'}</p>
                      <p className="topbar-dropdown-email">{user?.email || ''}</p>
                    </div>
                  </div>
                </div>

                <div className="topbar-dropdown-divider"></div>

                <button
                  className="topbar-dropdown-item topbar-logout-item"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;