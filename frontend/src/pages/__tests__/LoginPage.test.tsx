import { render, screen } from "@testing-library/react";
import LoginPage from "../LoginPage";

test("renderiza el formulario de login dentro de la página", () => {
  render(<LoginPage />);
  expect(screen.getByText(/Iniciar Sesión/i)).toBeInTheDocument();
});
