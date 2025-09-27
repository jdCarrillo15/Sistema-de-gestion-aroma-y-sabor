import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import "../../styles/admin/CreateUserModal.css";
import { createUser } from "../../services/admin/userService";


interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: {
    user_name: string;
    email: string;
    password: string;
    role: string;
    state: string;
    first_name: string;
    last_name: string;
    document_id: string;
    birthdate: string;
  }) => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [state, setState] = useState("active");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [birthdate, setBirthdate] = useState("");

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    documentId: "",
    birthdate: "",
    email: "",
  });

  useEffect(() => {
    if (isOpen) {
      setUserName("");
      setEmail("");
      setPassword("");
      setRole("user");
      setState("active");
      setFirstName("");
      setLastName("");
      setDocumentId("");
      setBirthdate("");
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
  }, [isOpen]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
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

    onSubmit({
      user_name: userName,
      email,
      password,
      role,
      state,
      first_name: firstName,
      last_name: lastName,
      document_id: documentId,
      birthdate,
    });
    onClose();
    const user = { userName, email, password, role, state, firstName, lastName, documentId, birthdate };
    const data = await createUser(user);
    console.log(data);
  };


  if (!isOpen) return null;

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

          <h2 className="modal-title">Nuevo Usuario</h2>
          <p className="modal-description">
            Completa los siguientes campos para crear un nuevo usuario en el sistema.
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
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">Rol</label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-input"
              >
                <option value="cocinero">Cocinero</option>
                <option value="mesero">Mesero</option>
                <option value="user">Caja</option>
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

            <div className="modal-buttons">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Crear Usuario
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;