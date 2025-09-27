import React, { useEffect } from "react";
import Button from "../common/Button";
import "../../styles/admin/ViewUserModal.css"; 
import { getUsers } from "../../services/admin/userService";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;

}


const ViewUserModal: React.FC<ViewUserModalProps> = ({ isOpen, onClose, user }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Función para manejar el cierre con Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div 
      className="viewuser-backdrop"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="viewuser-container">
        {/* Botón X mejorado */}
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#A0A0A0',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#F5F5F5';
            e.currentTarget.style.color = '#8B4513';
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = '#A0A0A0';
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Avatar + Nombre */}
        <div className="viewuser-header">
          <div className="viewuser-avatar">
            <span>{user[0].user_name?.charAt(0).toUpperCase()}</span>
          </div>
          <h2>{user[0].user_name}</h2>
          <p className={`viewuser-status ${user[0].state.toLowerCase() === "activo" ? "activo" : "inactivo"}`}>
            ● {user[0].state}
          </p>
        </div>

        {/* Datos principales */}
        <div className="viewuser-section">
          <h3>Información de cuenta</h3>
          <p><strong>Email:</strong> {user[0].email}</p>
          <p><strong>Rol:</strong> {user[0].role}</p>
          <p><strong>Fecha de inicio:</strong> {new Date(user[0].created_at).toLocaleDateString()}</p>
        </div>

        {/* Datos de persona */}
        {user[0].person && (
          <div className="viewuser-section">
            <h3>Datos personales</h3>
            <p><strong>Nombre:</strong> {user[0].person.first_name}</p>
            <p><strong>Apellido:</strong> {user[0].person.last_name}</p>
            <p><strong>Documento:</strong> {user[0].person.document_id}</p>
            <p><strong>Fecha de nacimiento:</strong> {user[0].person.birthdate}</p>
          </div>
        )}

        <div className="viewuser-footer">
          <Button type="button" variant="primary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;