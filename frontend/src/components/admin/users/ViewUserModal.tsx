import React, { useEffect } from "react";
import Button from "../../common/Button";
import "../../../styles/admin/users/CreateUserModal.css";

interface ViewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      console.log("Modal cerrado, overflow restablecido")
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  const getFormattedState = (state: string) => {
    if (!state) return "No especificado";
    const lowerState = state.toLowerCase();
    if (lowerState === "active" || lowerState === "activo") {
      return "Activo";
    } else if (lowerState === "inactive" || lowerState === "inactivo") {
      return "Inactivo";
    }
    return state;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "No especificado";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getFormattedRole = (role: string) => {
    if (!role) return "No especificado";
    const roleMap: { [key: string]: string } = {
      admin: "Administrador",
      cocinero: "Cocinero",
      mesero: "Mesero",
      waiter: "Mesero",
      user: "Caja",
      cashier: "Caja",
    };
    return roleMap[role.toLowerCase()] || role;
  };

  return (
    <div
      className="modal-backdrop"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-header">
            <button
              className="close-button"
              onClick={onClose}
              aria-label="Cerrar"
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
          </div>

          <div className="modal-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <h2 className="modal-title">Información del Usuario</h2>
          <p className="modal-description">
            Detalles completos del usuario seleccionado.
          </p>

          <div className="user-details">
            <div className="details-section">
              <h3 className="section-title">Datos de Usuario</h3>
              
              <div className="detail-row">
                <span className="detail-label">Nombre de usuario:</span>
                <span className="detail-value">{user.user_name || "No especificado"}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Correo electrónico:</span>
                <span className="detail-value">{user.email || "No especificado"}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Rol:</span>
                <span className="detail-value">{getFormattedRole(user.role)}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Estado:</span>
                <span className={`detail-value status ${user.state?.toLowerCase() === "activo" || user.state?.toLowerCase() === "active" ? "active" : "inactive"}`}>
                  {getFormattedState(user.state)}
                </span>
              </div>

              <div className="detail-row">

              </div>

              <div className="detail-row">
                <span className="detail-label">Fecha de registro:</span>
                <span className="detail-value">{formatDate(user.created_at)}</span>
              </div>
            </div>

            {user.person && (
              <div className="details-section">
                <h3 className="section-title">Información Personal</h3>
                
                <div className="detail-row">
                  <span className="detail-label">Nombre completo:</span>
                  <span className="detail-value">
                    {user.person.first_name && user.person.last_name 
                      ? `${user.person.first_name} ${user.person.last_name}`
                      : "No especificado"
                    }
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Nombre:</span>
                  <span className="detail-value">{user.person.first_name || "No especificado"}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Apellido:</span>
                  <span className="detail-value">{user.person.last_name || "No especificado"}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Documento:</span>
                  <span className="detail-value">{user.person.document_id || "No especificado"}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">Fecha de nacimiento:</span>
                  <span className="detail-value">
                    {user.person.birthdate 
                      ? new Date(user.person.birthdate).toLocaleDateString("es-ES")
                      : "No especificado"
                    }
                  </span>
                </div>

                {user.person.id && (
                  <div className="detail-row">
                  </div>
                )}
              </div>
            )}

            {!user.person && (
              <div className="details-section">
                <h3 className="section-title">Información Personal</h3>
                <div className="no-data">
                  <p>No hay información personal registrada para este usuario.</p>
                </div>
              </div>
            )}
          </div>

          <div className="modal-buttons">
            <Button type="button" variant="primary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserModal;