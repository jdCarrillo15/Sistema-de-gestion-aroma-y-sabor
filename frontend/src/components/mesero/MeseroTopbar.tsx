import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, LogOut, ChevronDown } from 'lucide-react';
import { getCurrentUser, logoutUser } from '../../services/login/authService';
import styles from '../../styles/mesero/MeseroTopbar.module.css';
import { useUser } from '../../context/userContext';

const MeseroTopbar: React.FC = () => {
  const user = getCurrentUser();
  const { setUser } = useUser();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isDropdownOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
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
        }
        navigate('/');
      }
    })();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className={styles.meseroTopbar}>
      <div className={styles.topbarContainer}>
        <div className={styles.topbarSearch}>
          <Search className={styles.searchIcon} size={20} />
          <input
            type="text"
            placeholder="Buscar mesa..."
            className={styles.searchInput}
          />
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.topbarUserDropdown} ref={dropdownRef}>
            <button
              className={styles.topbarUserButton}
              onClick={toggleDropdown}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <div className={styles.userAvatar}>
                <User size={20} />
              </div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.email?.split('@')[0] || 'Mesero'}</span>
                <span className={styles.userRole}>Mesero</span>
              </div>
              <ChevronDown
                className={`${styles.dropdownIcon} ${isDropdownOpen ? styles.open : ''}`}
                size={20}
              />
            </button>

            {isDropdownOpen && (
              <>
                {/* Backdrop para móvil */}
                <div className={styles.dropdownBackdrop} onClick={() => setIsDropdownOpen(false)}></div>

                <div className={styles.dropdownMenu}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownUserInfo}>
                      <div className={styles.dropdownAvatar}>
                        <User size={24} />
                      </div>
                      <div>
                        <p className={styles.dropdownName}>{user?.email?.split('@')[0] || 'Mesero'}</p>
                        <p className={styles.dropdownEmail}>{user?.email || ''}</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.dropdownDivider}></div>

                  <button
                    className={`${styles.dropdownItem} ${styles.logoutItem}`}
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
      </div>
    </header>
  );
};

export default MeseroTopbar;