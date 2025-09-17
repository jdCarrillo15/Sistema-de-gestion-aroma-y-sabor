import { render, screen, fireEvent } from "@testing-library/react";
import AlertModal from "../AlertModal";

test("no se renderiza cuando isOpen=false", () => {
  render(
    <AlertModal
      isOpen={false}
      onClose={() => {}}
      title="Prueba"
      message="Mensaje"
      type="info"
    />
  );
  expect(screen.queryByText(/Prueba/i)).not.toBeInTheDocument();
});

test("muestra título y mensaje cuando isOpen=true y cierra al click", () => {
  const onClose = vi.fn();
  render(
    <AlertModal
      isOpen={true}
      onClose={onClose}
      title="Éxito"
      message="Todo bien"
      type="success"
    />
  );
  expect(screen.getByText(/Éxito/i)).toBeInTheDocument();
  expect(screen.getByText(/Todo bien/i)).toBeInTheDocument();

  // el botón por defecto en tu componente es "Aceptar"
  fireEvent.click(screen.getByText(/Aceptar/i));
  expect(onClose).toHaveBeenCalled();
});
