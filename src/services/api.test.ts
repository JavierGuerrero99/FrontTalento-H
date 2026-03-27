import { describe, it, expect, vi, beforeEach } from "vitest";

const getMock = vi.fn();
const postMock = vi.fn();
const patchMock = vi.fn();
const deleteMock = vi.fn();
const putMock = vi.fn();

vi.mock("axios", () => {
  return {
    default: {
      create: () => ({
        get: getMock,
        post: postMock,
        patch: patchMock,
        delete: deleteMock,
        put: putMock,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      }),
    },
  };
});

describe("api service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("commentOnApplication falla si asunto está vacío", async () => {
    const { commentOnApplication } = await import("./api");

    await expect(
      commentOnApplication(10, "   ", "mensaje")
    ).rejects.toThrow("El comentario requiere asunto y mensaje");
  });

  it("updateApplicationStatus falla si estado está vacío", async () => {
    const { updateApplicationStatus } = await import("./api");

    await expect(
      updateApplicationStatus(10, "   ")
    ).rejects.toThrow("Selecciona un estado válido para la postulación");
  });

  it("createInterview falla si faltan fecha, hora o medio", async () => {
    const { createInterview } = await import("./api");

    await expect(
      createInterview({
        postulacion: 1,
        fecha: "",
        hora: "10:00",
        medio: "Meet",
      })
    ).rejects.toThrow("La entrevista requiere fecha, hora y medio");
  });

  it("markCandidateAsFavorite falla si candidateId está vacío", async () => {
    const { markCandidateAsFavorite } = await import("./api");

    await expect(
      markCandidateAsFavorite("   ")
    ).rejects.toThrow("No se pudo identificar al candidato para marcarlo como favorito");
  });

  it("removeFavorite falla si candidateId está vacío", async () => {
    const { removeFavorite } = await import("./api");

    await expect(
      removeFavorite("   ")
    ).rejects.toThrow("No se pudo identificar al candidato para eliminar de favoritos");
  });
});
