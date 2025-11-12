import React, { useEffect } from "react";
import Button from "../../common/Button";
import styles from "../../../styles/admin/users/CreateUserModal.module.css";

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
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !user) return null;

  const getFormattedState = (status: string) => {
    if (!status) return "No especificado";
    const lowerState = status.toLowerCase();
    if (lowerState === "active" || lowerState === "activo") {
      return "Activo";
    } else if (lowerState === "inactive" || lowerState === "inactivo") {
      return "Inactivo";
    }
    return status;
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

  const formatBirthdate = (dateString: string) => {
    if (!dateString) return "No especificado";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Fecha inválida";
    }
  };

  const getFormattedRole = (role: string) => {
    if (!role) return "No especificado";
    const roleMap: { [key: string]: string } = {
      admin: "Administrador",
      kitchen: "Cocinero",
      waiter: "Mesero",
      cash: "Caja",
    };
    return roleMap[role.toLowerCase()] || role;
  };

  return (
    <div
      className={styles.modalBackdrop}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={styles.modalContainer}>
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div></div>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Cerrar"
              type="button"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className={styles.modalIcon}>
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <h2 className={styles.modalTitle}>Información del Usuario</h2>
          <p className={styles.modalDescription}>
            Detalles completos del usuario seleccionado.
          </p>

          <div className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nombre de usuario</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                {user.user_name || "No especificado"}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Correo electrónico</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                {user.email || "No especificado"}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Rol</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                {getFormattedRole(user.role)}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Estado</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                {getFormattedState(user.status)}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Fecha de registro</label>
              <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                {formatDate(user.created_at)}
              </div>
            </div>

            {user.person && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nombre</label>
                  <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                    {user.person.first_name || "No especificado"}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Apellido</label>
                  <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                    {user.person.last_name || "No especificado"}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Documento</label>
                  <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                    {user.person.document_id || "No especificado"}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Fecha de nacimiento</label>
                  <div className={styles.formInput} style={{ backgroundColor: '#F5F5F5', cursor: 'default' }}>
                    {formatBirthdate(user.person.birthdate)}
                  </div>
                </div>
              </>
            )}

            {!user.person && (
              <div className={styles.formGroup}>
                <div className={styles.noData}>
                  <p>No hay información personal registrada para este usuario.</p>
                </div>
              </div>
            )}
          </div>

          <div className={styles.modalButtons}>
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