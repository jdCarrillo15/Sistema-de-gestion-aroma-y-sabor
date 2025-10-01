import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "../login/LoginPage";

test("renderiza el formulario de login dentro de la página", () => {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

  expect(screen.getByText(/Iniciar sesión/i)).toBeInTheDocument();
});
