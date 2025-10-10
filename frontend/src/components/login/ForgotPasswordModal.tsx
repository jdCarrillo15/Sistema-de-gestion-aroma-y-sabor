import React, { useState, useEffect } from "react";
import "../../styles/login/ForgotPasswordModal.css";
import { sendRecoveryEmail } from "../../services/login/authService.ts";
import AlertModal from "../common/AlertModal.tsx";
import Button from "../common/Button.tsx";
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

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let data = await sendRecoveryEmail(email);

      if (data && data.success) {
        setAlertType("success");
        setAlertTitle("¡Correo enviado!");
        setAlertMessage(
          `Hemos enviado un enlace de recuperación a ${email}. Revisa tu bandeja de entrada y spam.`
        );
        onSubmit(email);
        setShowAlert(true); 
        
      } else {
        setAlertType("error");
        setAlertTitle("Error al enviar correo");
        setAlertMessage(
          "Este correo no se encuentra registrado. Por favor, verifica tu dirección de correo e inténtalo de nuevo."
        );
        setShowAlert(true); 
      }
    } catch (error) {
      setAlertType("error");
      setAlertTitle("Error de conexión");
      setAlertMessage(
        "Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde."
      );
      setShowAlert(true); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    if (alertType === "success") {
      onClose();
    }
    
  };

  const handleRetry = () => {
    setShowAlert(false);
    
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting && !showAlert) { 
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !isSubmitting && !showAlert) { 
      onClose();
    }
  };

  return (
    <>
      {!showAlert && (
        <div
          className="modal-backdrop"
          onClick={handleBackdropClick}
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
                    width="20"
                    height="20"
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
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>

              <h2 className="modal-title">¿Olvidaste tu contraseña?</h2>
              <p className="modal-description">
                No te preocupes, ingresa tu correo electrónico y te enviaremos un
                enlace para restablecer tu contraseña.
              </p>

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
                    placeholder="tucorreo@email.com"
                    className="form-input"
                    required
                    autoFocus
                    disabled={isSubmitting}
                  />
                </div>

                <div className="modal-buttons">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="loading-container">
                        <div className="spinner"></div>
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      "Enviar enlace"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      
      <AlertModal
        isOpen={showAlert}
        onClose={handleAlertClose}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        buttonText={alertType === "success" ? "Perfecto" : "Entendido"}
        showSecondaryButton={false} 
        onSecondaryAction={handleRetry}
      />
    </>
  );
};

export default ForgotPasswordModal;
