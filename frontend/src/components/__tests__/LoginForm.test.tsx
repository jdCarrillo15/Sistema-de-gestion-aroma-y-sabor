import { expect, vi, test, Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../LoginForm";
import * as authService from "../../services/authService";

vi.mock("../../services/authService", () => ({
  loginUser: vi.fn(),
}));

test("muestra error si loginUser devuelve success=false", async () => {
  (authService.loginUser as Mock).mockResolvedValue({
    success: false,
  });

  render(<LoginForm />);
  const user = userEvent.setup();

  await user.type(screen.getByLabelText(/Correo Electrónico/i), "bad@mail.com");
  await user.type(screen.getByPlaceholderText("••••••••"), "123456");

  await user.click(screen.getByText(/Iniciar Sesión/i));

  await waitFor(() => {
    expect(screen.getByText(/Error de inicio de sesión/i)).toBeInTheDocument();
  });
});

test("muestra éxito si loginUser devuelve success=true", async () => {
  (authService.loginUser as Mock).mockResolvedValue({
    success: true,
  });

  render(<LoginForm />);
  const user = userEvent.setup();

  await user.type(screen.getByLabelText(/Correo Electrónico/i), "ok@mail.com");
  await user.type(
    screen.getByLabelText("Contraseña", { selector: "input" }),
    "123456"
  );

  await user.click(screen.getByText(/Iniciar Sesión/i));

  await waitFor(() => {
    expect(screen.getByText(/¡Bienvenido!/i)).toBeInTheDocument();
  });
});
