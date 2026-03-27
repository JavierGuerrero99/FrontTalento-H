import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginForm } from "./LoginForm";

const loginMock = vi.fn();

vi.mock("../services/auth", () => ({
  login: loginMock,
}));

vi.mock("react-hot-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra validaciones si el formulario está vacío", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(
      await screen.findByText(/correo electrónico es obligatorio/i)
    ).toBeInTheDocument();
  });

  it("ejecuta onLoginSuccess cuando el login sale bien", async () => {
    const user = userEvent.setup();
    const onLoginSuccess = vi.fn();
    loginMock.mockResolvedValueOnce({});

    render(<LoginForm onLoginSuccess={onLoginSuccess} />);

    await user.type(screen.getByLabelText(/correo electrónico/i), "test@mail.com");
    await user.type(screen.getByLabelText(/contraseña/i), "123456");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(loginMock).toHaveBeenCalledWith("test@mail.com", "123456");
    expect(onLoginSuccess).toHaveBeenCalledWith("test@mail.com");
  });
});