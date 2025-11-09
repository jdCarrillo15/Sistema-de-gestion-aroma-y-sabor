import React, { useState, useEffect } from "react";
import Button from "../../common/Button";
import styles from "../../../styles/admin/users/CreateUserModal.module.css";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: {
    user_name: string;
    email: string;
    password: string;
    role: string;
    status: string;
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
  const [role, setRole] = useState("kitchen");
  const [status, setState] = useState("active");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [birthdate, setBirthdate] = useState("");

  const [errors, setErrors] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    documentId: "",
    birthdate: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUserName("");
      setEmail("");
      setPassword("");
      setRole("kitchen");
      setState("active");
      setFirstName("");
      setLastName("");
      setDocumentId("");
      setBirthdate("");
      setErrors({
        userName: "",
        firstName: "",
        lastName: "",
        documentId: "",
        birthdate: "",
        email: "",
        password: "",
      });
      setIsSubmitting(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const validateUserName = (name: string) => {
    if (!name.trim()) {
      return "El nombre de usuario es requerido";
    }
    if (name.trim().length < 3) {
      return "Debe tener al menos 3 caracteres";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      return "Solo letras, números y guiones bajos";
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

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      return "La contraseña es requerida";
    }
    if (password.length < 6) {
      return "Debe tener al menos 6 caracteres";
    }
    return "";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !isSubmitting) {
      onClose();
    }
  };

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    const error = validatePassword(value);
    setErrors(prev => ({ ...prev, password: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    const userNameError = validateUserName(userName);
    const firstNameError = validateName(firstName, "firstName");
    const lastNameError = validateName(lastName, "lastName");
    const documentError = validateDocument(documentId);
    const birthdateError = validateBirthdate(birthdate);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      userName: userNameError,
      firstName: firstNameError,
      lastName: lastNameError,
      documentId: documentError,
      birthdate: birthdateError,
      email: emailError,
      password: passwordError,
    });

    if (userNameError || firstNameError || lastNameError || documentError || birthdateError || emailError || passwordError) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        user_name: userName.trim(),
        email: email.trim(),
        password,
        role,
        status: status,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        document_id: documentId,
        birthdate,
      });
    } catch (error) {
      console.error("Error en handleSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

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
            <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

          <h2 className={styles.modalTitle}>Nuevo Usuario</h2>
          <p className={styles.modalDescription}>
            Completa los siguientes campos para crear un nuevo usuario en el sistema.
          </p>

          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label htmlFor="userName" className={styles.formLabel}>
                Nombre de usuario *
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={handleUserNameChange}
                className={`${styles.formInput} ${errors.userName ? styles.error : ''}`}
                disabled={isSubmitting}
                placeholder="usuario123"
                autoComplete="username"
                required
              />
              {errors.userName && (
                <span className={styles.errorMessage}>{errors.userName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.formLabel}>
                Nombre *
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={handleFirstNameChange}
                className={`${styles.formInput} ${errors.firstName ? styles.error : ''}`}
                disabled={isSubmitting}
                placeholder="Juan"
                autoComplete="given-name"
                required
              />
              {errors.firstName && (
                <span className={styles.errorMessage}>{errors.firstName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.formLabel}>
                Apellido *
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={handleLastNameChange}
                className={`${styles.formInput} ${errors.lastName ? styles.error : ''}`}
                disabled={isSubmitting}
                placeholder="Pérez"
                autoComplete="family-name"
                required
              />
              {errors.lastName && (
                <span className={styles.errorMessage}>{errors.lastName}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="documentId" className={styles.formLabel}>
                Documento (opcional)
              </label>
              <input
                type="text"
                id="documentId"
                value={documentId}
                onChange={handleDocumentChange}
                className={`${styles.formInput} ${errors.documentId ? styles.error : ''}`}
                placeholder="1234567890"
                maxLength={10}
                disabled={isSubmitting}
                autoComplete="off"
              />
              {errors.documentId && (
                <span className={styles.errorMessage}>{errors.documentId}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="birthdate" className={styles.formLabel}>
                Fecha de nacimiento (opcional)
              </label>
              <input
                type="date"
                id="birthdate"
                value={birthdate}
                onChange={handleBirthdateChange}
                className={`${styles.formInput} ${errors.birthdate ? styles.error : ''}`}
                disabled={isSubmitting}
                autoComplete="bday"
              />
              {errors.birthdate && (
                <span className={styles.errorMessage}>{errors.birthdate}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
                disabled={isSubmitting}
                placeholder="correo@ejemplo.com"
                autoComplete="email"
                required
              />
              {errors.email && (
                <span className={styles.errorMessage}>{errors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>
                Contraseña *
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
                disabled={isSubmitting}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
              {errors.password && (
                <span className={styles.errorMessage}>{errors.password}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="role" className={styles.formLabel}>
                Rol *
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={styles.formInput}
                disabled={isSubmitting}
              >
                <option value="kitchen">Cocinero</option>
                <option value="waiter">Mesero</option>
                <option value="cash">Caja</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="status" className={styles.formLabel}>
                Estado *
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setState(e.target.value)}
                className={styles.formInput}
                disabled={isSubmitting}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>

            <div className={styles.modalButtons}>
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
                {isSubmitting ? "Creando..." : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserModal;