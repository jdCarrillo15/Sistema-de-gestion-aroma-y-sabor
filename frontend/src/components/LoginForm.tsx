import React, { useState } from "react";
import ForgotPasswordModal from "./ForgotPasswordModal.tsx";
import AlertModal from "./AlertModal";
import "../styles/LoginForm.css";
import { loginUser } from "../services/authService";
import logo from "../assets/logo.png";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<"success" | "error">("error");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await loginUser(email, password);
      console.log("Retorno de logueo:", data);

      if (data === false || (data && data.success === false) || !data) {
        setAlertType("error");
        setAlertTitle("Error de inicio de sesión");
        setAlertMessage(
          "El correo electrónico y la contraseña no coinciden. Por favor, verifica tus credenciales e inténtalo de nuevo."
        );
        setShowAlert(true);
      } else {
        setAlertType("success");
        setAlertTitle("¡Bienvenido!");
        setAlertMessage(
          "Has iniciado sesión correctamente. Serás redirigido en un momento."
        );
        setShowAlert(true);

        setTimeout(() => {
          console.log("Redirigiendo usuario...");
        }, 2000);
      }
    } catch (err) {
      setAlertType("error");
      setAlertTitle("Error de conexión");
      setAlertMessage(
        "No pudimos conectar con el servidor. Por favor, verifica tu conexión e inténtalo de nuevo."
      );
      setShowAlert(true);
      console.error("Error al iniciar sesión:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotModal(true);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
  };

  const handleForgotPasswordSubmit = (forgotEmail: string) => {
    console.log("Password reset requested for:", forgotEmail);
    closeForgotModal();
  };

  const handleAlertClose = () => {
    setShowAlert(false);

    if (alertType === "success") {
    }
  };

  const handleRetry = () => {
    setShowAlert(false);
    const emailInput = document.getElementById("email");
    if (emailInput) emailInput.focus();
  };

  return (
    <>
      <div className="login-form-container">
        <div className="login-form-card">
          <div className="login-header">
            <div className="logo-container">
              <img src={logo} alt="Logo" className="logo" />
            </div>
            <p className="login-subtitle">El aroma de la perfección</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@email.com"
                className="form-input"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input password-input"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="password-toggle"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span className="checkmark"></span>
                Recordarme
              </label>
              <a
                href="#"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>
      </div>

      {showForgotModal && (
        <ForgotPasswordModal
          onClose={closeForgotModal}
          onSubmit={handleForgotPasswordSubmit}
        />
      )}

      <AlertModal
        isOpen={showAlert}
        onClose={handleAlertClose}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        buttonText={alertType === "success" ? "Continuar" : "Entendido"}
        showSecondaryButton={alertType === "error"}
        secondaryButtonText="Intentar de nuevo"
        onSecondaryAction={handleRetry}
      />
    </>
  );
};

export default LoginForm;
