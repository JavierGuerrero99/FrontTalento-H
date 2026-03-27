import { describe, it, expect, vi, beforeEach } from "vitest";

const postMock = vi.fn();

vi.mock("./api", () => ({
  default: {
    post: postMock,
    get: vi.fn(),
  },
}));

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("login guarda access_token y refresh_token", async () => {
    postMock.mockResolvedValueOnce({
      data: {
        access: "token-access",
        refresh: "token-refresh",
      },
    });

    const { login } = await import("./auth");

    const resp = await login("correo@demo.com", "123456");

    expect(postMock).toHaveBeenCalledWith("/token/", {
      username: "correo@demo.com",
      password: "123456",
    });
    expect(localStorage.getItem("access_token")).toBe("token-access");
    expect(localStorage.getItem("refresh_token")).toBe("token-refresh");
    expect(resp.access).toBe("token-access");
  });

  it("logout elimina access_token", async () => {
    localStorage.setItem("access_token", "abc");
    const { logout } = await import("./auth");

    logout();

    expect(localStorage.getItem("access_token")).toBeNull();
  });

  it("getAuthHeaders usa token guardado si existe", async () => {
    localStorage.setItem("access_token", "guardado");
    const auth = await import("./auth");

    const headers = await auth.getAuthHeaders();

    expect(headers).toEqual({
      Authorization: "Bearer guardado",
    });
  });
});