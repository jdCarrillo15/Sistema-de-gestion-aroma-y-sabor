import React, { useEffect } from "react";
import Button from "../components/Button";
import "../styles/ViewUserModal.css"; // Nuevo archivo de estilos

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

  if (!isOpen || !user) return null;

  return (
    <div className="viewuser-backdrop" onClick={onClose}>
      <div className="viewuser-container" onClick={(e) => e.stopPropagation()}>
        <button className="viewuser-close" onClick={onClose}>✕</button>

        {/* Avatar + Nombre */}
        <div className="viewuser-header">
          <div className="viewuser-avatar">
            <span>{user.user_name?.charAt(0).toUpperCase()}</span>
          </div>
          <h2>{user.user_name}</h2>
          <p className={`viewuser-status ${user.state.toLowerCase() === "activo" ? "activo" : "inactivo"}`}>
            ● {user.state}
          </p>
        </div>

        {/* Datos principales */}
        <div className="viewuser-section">
          <h3>Información de cuenta</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.role}</p>
          <p><strong>Fecha de inicio:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
        </div>

        {/* Datos de persona */}
        {user.person && (
          <div className="viewuser-section">
            <h3>Datos personales</h3>
            <p><strong>Nombre:</strong> {user.person.first_name}</p>
            <p><strong>Apellido:</strong> {user.person.last_name}</p>
            <p><strong>Documento:</strong> {user.person.document_id}</p>
            <p><strong>Fecha de nacimiento:</strong> {user.person.birthdate}</p>
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
