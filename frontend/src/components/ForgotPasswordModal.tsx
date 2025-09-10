import React, { useState, useEffect } from "react";
import "../styles/ForgotPasswordModal.css";
import { sendRecoveryEmail } from "../services/authService";

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSubmit: (email: string) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      let data = await sendRecoveryEmail("xd");
      console.log("Respuesta de recuperación:", data);
    } catch (error) {
      alert("Error al solicitar recuperación de contraseña");
    }

    onSubmit(email);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 2000);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="modal-container">
        <div className="modal-content">
          {}
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

          {/* Icono y título */}
          <div className="modal-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          <h2 className="modal-title">¿Olvidaste tu contraseña?</h2>
          <p className="modal-description">
            No te preocupes, ingresa tu correo electrónico y te enviaremos un
            enlace para restablecer tu contraseña.
          </p>

          {}
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label htmlFor="forgot-email" className="form-label">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="forgot-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="form-input"
                required
                autoFocus
                disabled={isSubmitting || isSuccess}
              />
            </div>

            <div className="modal-buttons">
              <button
                type="button"
                onClick={onClose}
                className="cancel-button"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting || isSuccess}
              >
                {isSubmitting ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <span>Enviando...</span>
                  </div>
                ) : isSuccess ? (
                  <div className="success-container">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                    <span>¡Enviado!</span>
                  </div>
                ) : (
                  "Enviar enlace"
                )}
              </button>
            </div>
          </form>

          {isSuccess && (
            <div className="success-message">
              <p>
                Hemos enviado un enlace de recuperación a{" "}
                <strong>{email}</strong>
              </p>
              <p className="success-note">
                Revisa tu bandeja de entrada y spam.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
