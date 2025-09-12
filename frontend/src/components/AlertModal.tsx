import React, { useEffect } from "react";
import Button from "./Button";
import "../styles/AlertModal.css";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  buttonText?: string;
  showSecondaryButton?: boolean;
  secondaryButtonText?: string;
  onSecondaryAction?: () => void;
}

const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type,
  buttonText = "Aceptar",
  showSecondaryButton = false,
  secondaryButtonText = "Cancelar",
  onSecondaryAction,
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

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        );
      case "error":
        return (
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case "warning":
        return (
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="m12 17 .01 0" />
          </svg>
        );
      case "info":
      default:
        return (
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9,12 3,3 3,-3" />
            <path d="m12,8 .01,0" />
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="alert-modal-backdrop"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="alert-modal-container">
        <div className="alert-modal-content">
          <div className="alert-modal-header">
            <button
              className="alert-close-button"
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

          <div className={`alert-modal-icon ${type}-icon`}>{getIcon()}</div>

          <h2 className="alert-modal-title">{title}</h2>
          <p className="alert-modal-message">{message}</p>

          <div className="alert-modal-buttons">
            {showSecondaryButton && (
              <Button
                variant="secondary"
                onClick={onSecondaryAction || onClose}
                className="no-flex"
              >
                {secondaryButtonText}
              </Button>
            )}
            <Button variant="primary" onClick={onClose} className="no-flex">
              {buttonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
