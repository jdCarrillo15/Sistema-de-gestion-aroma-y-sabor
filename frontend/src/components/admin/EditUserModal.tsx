import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import ConfirmModal from "./ConfirmModal";
import "../../styles/admin/CreateUserModal.css";
import { updateUser } from "../../services/admin/userService";

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
  const [state, setState] = useState("Activo");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [errors, setErrors] = useState({
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
      setState(user.state ?? "");
      setFirstName(user.person?.first_name ?? "");
      setLastName(user.person?.last_name ?? "");
      setBirthdate(user.person?.birthdate ?? "");
      setDocumentId(user.person?.document_id ?? "");

      setErrors({
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

  const validateName = (name: string, field: "firstName" | "lastName") => {
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
      if (actualAge < 18) {
        return "Debe ser mayor de 16 años";
      }
    } else if (age < 18) {
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


  const confirmUpdate = () => {
    const updatedUser = {
      ...user, 
      user_name: userName,
      email,
      role,
      state,
      person: {
        ...user.person,
        first_name: firstName,
        last_name: lastName,
        birthdate,
        document_id: documentId,
      },
    };

    onSubmit(updatedUser);
    setIsConfirmOpen(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const firstNameError = validateName(firstName, "firstName");
    const lastNameError = validateName(lastName, "lastName");
    const documentError = validateDocument(documentId);
    const birthdateError = validateBirthdate(birthdate);
    const emailError = validateEmail(email);

    setErrors({
      firstName: firstNameError,
      lastName: lastNameError,
      documentId: documentError,
      birthdate: birthdateError,
      email: emailError,
    });

    if (firstNameError || lastNameError || documentError || birthdateError || emailError) {
      return;
    }

    setIsConfirmOpen(true);
    const userUpdated = { ...user, userName, email, role, state, firstName, lastName, documentId, birthdate };
    const data = await updateUser(userUpdated.id, userUpdated);
    console.log(data);
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
                <label htmlFor="userName" className="form-label">Nombre de usuario</label>
                <input
                  type="text"
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  required
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="role" className="form-label">Rol</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="form-input"
                >
                  <option value="admin">Administrador</option>
                  <option value="cocinero">Cocinero</option>
                  <option value="mesero">Mesero</option>
                  <option value="user">Usuario</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="state" className="form-label">Estado</label>
                <select
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="form-input"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <h3>Datos de persona</h3>
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">Nombre</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={handleFirstNameChange}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  required
                />
                {errors.firstName && (
                  <span className="error-message">{errors.firstName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Apellido</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={handleLastNameChange}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
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
                />
                {errors.documentId && (
                  <span className="error-message">{errors.documentId}</span>
                )}
              </div>

              <div className="modal-buttons">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  Guardar cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmar modificación"
        message="¿Estás seguro de que deseas guardar los cambios de este usuario?"
        onConfirm={confirmUpdate}
        confirmText="Sí, guardar"
        cancelText="Cancelar"
      />
    </>
  );
};

export default EditUserModal;