import React, { useState, useEffect } from "react";
import Button from "../../common/Button";
import ConfirmModal from "./../ConfirmModal";
import "../../../styles/admin/users/CreateUserModal.css";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSubmit: (updatedUser: any) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit,
}) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [status, setState] = useState("active");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    documentId: "",
    birthdate: "",
    email: "",
  });

  useEffect(() => {
    if (isOpen && user) {
      setUserName(user.user_name ?? "");
      setEmail(user.email ?? "");
      setRole(user.role ?? "");

      // Normalizar state
      const userState = user.status?.toLowerCase();
      setState(userState === "activo" || userState === "active" ? "active" : "inactive");

      setFirstName(user.person?.first_name ?? "");
      setLastName(user.person?.last_name ?? "");
      setBirthdate(user.person?.birthdate ?? "");
      setDocumentId(user.person?.document_id ?? "");

      setErrors({
        userName: "",
        firstName: "",
        lastName: "",
        documentId: "",
        birthdate: "",
        email: "",
      });

      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, user]);

  // Validaciones
  const validateUserName = (name: string) => {
    if (!name.trim()) {
      return "El nombre de usuario es requerido";
    }
    if (name.trim().length < 3) {
      return "Debe tener al menos 3 caracteres";
    }
    return "";
  };

  const validateName = (name: string, _field: "firstName" | "lastName") => {
    const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;
    if (!name.trim()) {
      return "Este campo es requerido";
    }
    if (!nameRegex.test(name)) {
      return "Solo se permiten letras y espacios";
    }
    if (name.trim().length < 2) {
      return "Debe tener al menos 2 caracteres";
    }
    return "";
  };

  const validateDocument = (doc: string) => {
    if (!doc.trim()) {
      return "";
    }
    const docRegex = /^\d+$/;
    if (!docRegex.test(doc)) {
      return "Solo se permiten números";
    }
    if (doc.length > 10) {
      return "Máximo 10 dígitos";
    }
    return "";
  };

  const validateBirthdate = (date: string) => {
    if (!date) {
      return "";
    }
    const today = new Date();
    const birthDate = new Date(date);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1;
      if (actualAge < 16) {
        return "Debe ser mayor de 16 años";
      }
    } else if (age < 16) {
      return "Debe ser mayor de 16 años";
    }
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return "El correo es requerido";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Formato de correo inválido";
    }
    return "";
  };

  // Handlers con validación en tiempo real
  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserName(value);
    const error = validateUserName(value);
    setErrors(prev => ({ ...prev, userName: error }));
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFirstName(value);
    const error = validateName(value, "firstName");
    setErrors(prev => ({ ...prev, firstName: error }));
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLastName(value);
    const error = validateName(value, "lastName");
    setErrors(prev => ({ ...prev, lastName: error }));
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      setDocumentId(value);
      const error = validateDocument(value);
      setErrors(prev => ({ ...prev, documentId: error }));
    }
  };

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthdate(value);
    const error = validateBirthdate(value);
    setErrors(prev => ({ ...prev, birthdate: error }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const error = validateEmail(value);
    setErrors(prev => ({ ...prev, email: error }));
  };

  const confirmUpdate = async () => {
    setIsSubmitting(true);
    try {
      // Crear el objeto en el formato correcto que espera el backend
      const updatedUserData = {
        // Datos de usuario
        user_name: userName.trim(),
        email: email.trim(),
        role: role,
        status: status,
        // Datos de persona para actualizar
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birthdate: birthdate,
        document_id: documentId,
      };

      // Crear el objeto completo del usuario para el frontend
      const updatedUserForFrontend = {
        id: user.id,
        user_name: userName.trim(),
        email: email.trim(),
        role: role,
        status: status,
        created_at: user.created_at,
        person: {
          id: user.person?.id,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          birthdate: birthdate,
          document_id: documentId,
        },
      };

      console.log("Datos para backend:", updatedUserData);
      console.log("Datos para frontend:", updatedUserForFrontend);

      // Llamar a onSubmit con el usuario completo
      await onSubmit(updatedUserForFrontend);

      setIsConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validar todos los campos
    const userNameError = validateUserName(userName);
    const firstNameError = validateName(firstName, "firstName");
    const lastNameError = validateName(lastName, "lastName");
    const documentError = validateDocument(documentId);
    const birthdateError = validateBirthdate(birthdate);
    const emailError = validateEmail(email);

    setErrors({
      userName: userNameError,
      firstName: firstNameError,
      lastName: lastNameError,
      documentId: documentError,
      birthdate: birthdateError,
      email: emailError,
    });

    // Si hay errores, no continuar
    if (userNameError || firstNameError || lastNameError || documentError || birthdateError || emailError) {
      return;
    }

    setIsConfirmOpen(true);
  };

  if (!isOpen) return null;

  return (
    <>
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
                disabled={isSubmitting}
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
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>

            <h2 className="modal-title">Editar Usuario</h2>
            <p className="modal-description">
              Modifica los campos necesarios para actualizar la información del usuario.
            </p>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="userName" className="form-label">Nombre de usuario *</label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={handleUserNameChange}
                  className={`form-input ${errors.userName ? 'error' : ''}`}
                  disabled={isSubmitting}
                  required
                />
                {errors.userName && (
                  <span className="error-message">{errors.userName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Correo Electrónico *</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  disabled={isSubmitting}
                  required
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Rol *</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-input"
                  disabled={isSubmitting}
                >
                  <option value="kitchen">Cocinero</option>
                  <option value="waiter">Mesero</option>
                  <option value="cash">Caja</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status" className="form-label">Estado *</label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setState(e.target.value)}
                  className="form-input"
                  disabled={isSubmitting}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div className="form-divider">
                <h3>Información Personal</h3>
              </div>

              <div className="form-group">
                <label htmlFor="firstName" className="form-label">Nombre *</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={handleFirstNameChange}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  disabled={isSubmitting}
                  required
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Apellido *</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={handleLastNameChange}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  disabled={isSubmitting}
                  required
                />
                {errors.lastName && (
                  <span className="error-message">{errors.lastName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="birthdate" className="form-label">Fecha de nacimiento (opcional)</label>
                <input
                  type="date"
                  id="birthdate"
                  value={birthdate}
                  onChange={handleBirthdateChange}
                  className={`form-input ${errors.birthdate ? 'error' : ''}`}
                  disabled={isSubmitting}
                />
                {errors.birthdate && (
                  <span className="error-message">{errors.birthdate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="documentId" className="form-label">Documento (opcional)</label>
                <input
                  type="text"
                  id="documentId"
                  value={documentId}
                  onChange={handleDocumentChange}
                  className={`form-input ${errors.documentId ? 'error' : ''}`}
                  placeholder="Máximo 10 dígitos"
                  maxLength={10}
                  disabled={isSubmitting}
                />
                {errors.documentId && (
                  <span className="error-message">{errors.documentId}</span>
                )}
              </div>

              <div className="modal-buttons">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => !isSubmitting && setIsConfirmOpen(false)}
        title="Confirmar modificación"
        message="¿Estás seguro de que deseas guardar los cambios de este usuario?"
        onConfirm={confirmUpdate}
        confirmText={isSubmitting ? "Guardando..." : "Sí, guardar"}
        cancelText="Cancelar"
      />
    </>
  );
};

export default EditUserModal;
