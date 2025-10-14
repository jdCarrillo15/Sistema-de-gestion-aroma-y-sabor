import React, { useState, useEffect } from "react";
import styles from "../../styles/login/ForgotPasswordModal.module.css";
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
      } else {
        setAlertType("error");
        setAlertTitle("Error al enviar correo");
        setAlertMessage(
          "Este correo no se encuentra registrado. Por favor, verifica tu dirección de correo e inténtalo de nuevo."
        );
      }
    } catch (error) {
      setAlertType("error");
      setAlertTitle("Error de conexión");
      setAlertMessage(
        "Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde."
      );
    } finally {
      setIsSubmitting(false);
      setShowAlert(true);
    }
  };

  const handleAlertClose = () => {
    setShowAlert(false);
    if (alertType === "success") {
      setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  const handleRetry = () => {
    setShowAlert(false);
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
    <>
      <div
        className={styles.modalBackdrop}
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div className={styles.modalContainer}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <button
                className={styles.closeButton}
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

            <div className={styles.modalIcon}>
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

            <h2 className={styles.modalTitle}>¿Olvidaste tu contraseña?</h2>
            <p className={styles.modalDescription}>
              No te preocupes, ingresa tu correo electrónico y te enviaremos un
              enlace para restablecer tu contraseña.
            </p>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="forgot-email" className={styles.formLabel}>
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="forgot-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@email.com"
                  className={styles.formInput}
                  required
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>

              <div className={styles.modalButtons}>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className={styles.loadingContainer}>
                      <div className={styles.spinner}></div>
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

      <AlertModal
        isOpen={showAlert}
        onClose={handleAlertClose}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        buttonText={alertType === "success" ? "Perfecto" : "Entendido"}
        onSecondaryAction={handleRetry}
      />
    </>
  );
};

export default ForgotPasswordModal;
