import { render, screen, fireEvent } from "@testing-library/react";
import Button from "../Button";

test("renderiza el botón con el texto correcto", () => {
  render(<Button>Click aquí</Button>);
  expect(screen.getByText(/Click aquí/i)).toBeInTheDocument();
});

test("llama a onClick cuando se hace click", () => {
  const handle = vi.fn();
  render(<Button onClick={handle}>Probar</Button>);
  fireEvent.click(screen.getByText(/Probar/i));
  expect(handle).toHaveBeenCalledTimes(1);
});
