import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordModal from "../ForgotPasswordModal";
import * as authService from "../../services/authService";

// Mock del CSS
vi.mock("../styles/ForgotPasswordModal.css", () => ({}));

vi.mock("../../services/authService", () => ({
  sendRecoveryEmail: vi.fn(),
}));

// Mock del AlertModal con implementación más simple
vi.mock("../AlertModal.tsx", () => ({
  default: ({ isOpen, title, message }: any) =>
    isOpen ? (
      <div>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    ) : null,
}));

// Mock del Button con implementación más simple
vi.mock("../Button.tsx", () => ({
  default: ({ children, onClick, disabled, type, variant }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

describe("ForgotPasswordModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("envía correo y muestra alerta de éxito", async () => {
    // Mock que resuelve inmediatamente sin delay
    (authService.sendRecoveryEmail as Mock).mockResolvedValue({
      success: true,
    });

    const onSubmit = vi.fn();
    render(<ForgotPasswordModal onClose={() => {}} onSubmit={onSubmit} />);

    // Escribir email y enviar
    const emailInput = screen.getByPlaceholderText("tucorreo@email.com");
    const submitButton = screen.getByText("Enviar enlace");

    await userEvent.type(emailInput, "test@mail.com");
    await userEvent.click(submitButton);

    // Esperar a que aparezca la alerta de éxito
    await waitFor(
      () => {
        expect(screen.getByText("¡Correo enviado!")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(
      screen.getByText(/Hemos enviado un enlace de recuperación/)
    ).toBeInTheDocument();
    expect(onSubmit).toHaveBeenCalledWith("test@mail.com");
  }, 10000);

  it("muestra error cuando el correo no está registrado", async () => {
    (authService.sendRecoveryEmail as Mock).mockResolvedValue({
      success: false,
    });

    render(<ForgotPasswordModal onClose={() => {}} onSubmit={() => {}} />);

    const emailInput = screen.getByPlaceholderText("tucorreo@email.com");
    const submitButton = screen.getByText("Enviar enlace");

    await userEvent.type(emailInput, "noexiste@mail.com");
    await userEvent.click(submitButton);

    await waitFor(
      () => {
        expect(screen.getByText("Error al enviar correo")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(
      screen.getByText(/Este correo no se encuentra registrado/)
    ).toBeInTheDocument();
  }, 10000);

  it("cierra el modal al hacer click en cancelar", async () => {
    const onClose = vi.fn();
    render(<ForgotPasswordModal onClose={onClose} onSubmit={() => {}} />);

    const cancelButton = screen.getByText("Cancelar");
    await userEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  }, 10000);
});
