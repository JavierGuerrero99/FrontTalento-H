import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterForm } from "./RegisterForm";

const registerCandidateMock = vi.fn();

vi.mock("../services/auth", () => ({
  default: {
    registerCandidate: registerCandidateMock,
  },
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra error si las contraseñas no coinciden", async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/nombres/i), "Juan");
    await user.type(screen.getByLabelText(/apellidos/i), "Pérez");
    await user.type(screen.getByLabelText(/correo electrónico/i), "juan@mail.com");
    await user.type(screen.getByLabelText(/^contraseña$/i), "123456");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "654321");

    await user.click(screen.getByRole("button", { name: /registr/i }));

    expect(
      await screen.findByText(/las contraseñas no coinciden/i)
    ).toBeInTheDocument();
  });

  it("usa el correo para generar username si no se escribe username", async () => {
    const user = userEvent.setup();
    const onRegisterSuccess = vi.fn();
    registerCandidateMock.mockResolvedValueOnce({});

    render(<RegisterForm onRegisterSuccess={onRegisterSuccess} />);

    await user.type(screen.getByLabelText(/nombres/i), "Juan");
    await user.type(screen.getByLabelText(/apellidos/i), "Pérez");
    await user.type(screen.getByLabelText(/correo electrónico/i), "juan@mail.com");
    await user.type(screen.getByLabelText(/^contraseña$/i), "123456");
    await user.type(screen.getByLabelText(/confirmar contraseña/i), "123456");

    await user.click(screen.getByRole("button", { name: /registr/i }));

    expect(registerCandidateMock).toHaveBeenCalledWith({
      username: "juan",
      first_name: "Juan",
      last_name: "Pérez",
      email: "juan@mail.com",
      password: "123456",
    });

    expect(onRegisterSuccess).toHaveBeenCalledWith("juan@mail.com", "candidate");
  });
});