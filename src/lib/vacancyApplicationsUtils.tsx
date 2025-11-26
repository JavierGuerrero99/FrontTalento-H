import { ReactNode } from "react";
import { makeAbsoluteUrl } from "../services/api";

type NullableDate = string | number | Date | null | undefined;

export type ApplicationComment = {
  id?: string | number;
  subject?: string | null;
  message: string;
  createdAt?: NullableDate;
  author?: string | null;
};

type StatusStyles = Record<string, string>;

export const collectionKeys = [
  "results",
  "data",
  "postulaciones",
  "applications",
  "items",
  "postulations",
];

export const candidateKeys = [
  "candidato",
  "candidate",
  "usuario",
  "user",
  "postulante",
  "applicant",
  "perfil",
  "profile",
  "aspirante",
  "persona",
];

export const statusStyles: StatusStyles = {
  postulado: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200",
  "en revision": "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200",
  "en revisión": "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-200",
  rechazado: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200",
  entrevista: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200",
  contratado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200",
};

export const toArray = (value: any): any[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  for (const key of collectionKeys) {
    const collection = value?.[key];
    if (Array.isArray(collection)) return collection;
    if (Array.isArray(collection?.results)) return collection.results;
  }
  const nestedArray = Object.values(value).find((entry) => Array.isArray(entry));
  if (Array.isArray(nestedArray)) return nestedArray;
  return [];
};

export const buildName = (...parts: Array<string | undefined | null>) =>
  parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" ");

export const normalizeDate = (value: NullableDate) => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value;
  if (typeof value === "number") {
    const byNumber = new Date(value);
    return Number.isNaN(byNumber.getTime()) ? null : byNumber;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const normalized = trimmed.includes("T") || trimmed.includes(" ") ? trimmed : `${trimmed}T00:00:00`;
    const byString = new Date(normalized.replace(" ", "T"));
    return Number.isNaN(byString.getTime()) ? null : byString;
  }
  return null;
};

export const formatDateTime = (value: NullableDate) => {
  const date = normalizeDate(value);
  if (!date) return "Sin registro";
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const resolveCandidate = (application: any) => {
  for (const key of candidateKeys) {
    if (application?.[key]) return application[key];
  }
  return application;
};

export const resolveCandidateName = (application: any) => {
  const directName =
    application?.nombre_postulante ||
    application?.nombre_candidato ||
    application?.nombre ||
    application?.full_name ||
    application?.nombreCompleto ||
    application?.display_name;

  if (typeof directName === "string" && directName.trim()) {
    return directName.trim();
  }

  const candidate = resolveCandidate(application);
  const candidateName =
    candidate?.nombre_completo ||
    candidate?.nombreCompleto ||
    candidate?.full_name ||
    candidate?.display_name;

  if (typeof candidateName === "string" && candidateName.trim()) {
    return candidateName.trim();
  }

  const composed =
    buildName(
      candidate?.primer_nombre || candidate?.nombre || candidate?.first_name || candidate?.nombres,
      candidate?.segundo_nombre || candidate?.middle_name,
      candidate?.primer_apellido || candidate?.apellido || candidate?.last_name,
      candidate?.segundo_apellido || candidate?.apellido2,
    ) || candidate?.username || candidate?.user?.username;

  if (composed) return composed;

  return null;
};

const coerceId = (value: any) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const numeric = Number(trimmed);
    return Number.isNaN(numeric) ? trimmed : numeric;
  }
  return null;
};

export const resolveCandidateId = (application: any) => {
  const candidate = resolveCandidate(application);
  const candidates = [
    application?.candidato,
    application?.candidato_id,
    application?.candidatoId,
    application?.candidate_id,
    application?.candidateId,
    application?.postulante_id,
    application?.postulanteId,
    application?.usuario_id,
    application?.usuarioId,
    application?.id_candidato,
    candidate?.id,
    candidate?.pk,
    candidate?.uuid,
    candidate?.usuario_id,
    candidate?.usuarioId,
    candidate?.user?.id,
  ];

  for (const value of candidates) {
    const coerced = coerceId(value);
    if (coerced !== null) return coerced;
  }

  return null;
};

export const resolveCandidateEmail = (application: any) => {
  const candidate = resolveCandidate(application);
  return (
    application?.email ||
    application?.correo ||
    candidate?.email ||
    candidate?.correo ||
    candidate?.correo_electronico ||
    candidate?.user?.email ||
    candidate?.usuario?.email ||
    null
  );
};

export const resolveCandidatePhone = (application: any) => {
  const candidate = resolveCandidate(application);
  return (
    application?.telefono ||
    application?.celular ||
    candidate?.telefono ||
    candidate?.celular ||
    candidate?.phone ||
    candidate?.telefono_contacto ||
    candidate?.user?.telefono ||
    null
  );
};

export const resolveResumeUrl = (application: any) => {
  const candidate = resolveCandidate(application);
  const rawUrl =
    application?.cv ||
    application?.cv_url ||
    application?.cv_link ||
    application?.hoja_vida ||
    application?.hoja_vida_url ||
    application?.resume ||
    candidate?.cv ||
    candidate?.cv_url ||
    candidate?.hoja_vida;
  return makeAbsoluteUrl(rawUrl);
};

export const enhanceResumeViewerUrl = (url: string | null | undefined) => {
  if (!url) return null;
  const lower = url.toLowerCase();
  const isPdf = lower.includes(".pdf");
  if (!isPdf) return url;
  if (lower.includes("#zoom=") || lower.includes("google.com")) return url;
  const separator = url.includes("#") ? "&" : "#";
  return `${url}${separator}toolbar=0&navpanes=0&scrollbar=1&zoom=page-fit`;
};

export const resolveStatus = (application: any) => {
  const candidates = [
    application?.estado,
    application?.estado_postulacion,
    application?.status,
    application?.resultado,
    application?.decision,
  ];

  let statusValue: string | null = null;

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      statusValue = candidate.trim();
      break;
    }
    if (candidate && typeof candidate === "object") {
      const nested =
        candidate?.nombre ||
        candidate?.name ||
        candidate?.label ||
        candidate?.estado ||
        candidate?.value ||
        candidate?.status;
      if (typeof nested === "string" && nested.trim()) {
        statusValue = nested.trim();
        break;
      }
    }
  }

  if (!statusValue) {
    return {
      value: null,
      label: "Sin estado",
      className: "bg-amber-400/25 text-amber-700 dark:text-amber-200",
    };
  }

  const normalized = statusValue
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const className = statusStyles[normalized] || "bg-amber-400/25 text-amber-700 dark:text-amber-200";
  const displayLabel = statusValue.replaceAll("_", " ");

  return {
    value: statusValue,
    label: displayLabel,
    className,
  };
};

export const resolveFavorite = (application: any) => {
  const candidates = [
    application?.favorito_id,
    application?.favorite_id,
    application?.favoritoId,
    application?.favoriteId,
    application?.favorito?.id,
    application?.favorite?.id,
    application?.favorito?.pk,
    application?.favorite?.pk,
    application?.favorito,
    application?.favorite,
    (application as any)?.__favoriteId,
  ];

  let favoriteId: string | number | null = null;
  for (const value of candidates) {
    const coerced = coerceId(value);
    if (coerced !== null) {
      favoriteId = coerced;
      break;
    }
  }

  const explicitFlag =
    application?.es_favorito ??
    application?.is_favorite ??
    application?.favorito ??
    application?.favorite ??
    application?.marcado_favorito;

  const isFavorite = Boolean(explicitFlag || favoriteId !== null);

  return {
    favoriteId,
    isFavorite,
  };
};

export const resolveAppliedAt = (application: any) =>
  application?.fecha_postulacion ||
  application?.fecha ||
  application?.postulado_en ||
  application?.created_at ||
  application?.updated_at ||
  application?.fecha_creacion ||
  application?.applied_at;

export const resolveNotes = (application: any) =>
  application?.observaciones ||
  application?.comentarios ||
  application?.notas ||
  application?.mensaje ||
  application?.mensaje_postulacion;

export const resolveComments = (application: any): ApplicationComment[] => {
  if (!application) return [];

  const sources = [
    application?.comentarios,
    application?.comments,
    application?.comentarios_internos,
    application?.notas_comentarios,
    application?.notas,
  ];

  const normalized: ApplicationComment[] = [];

  const pushComment = (value: any, index: number) => {
    if (value === null || value === undefined) return;

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return;
      normalized.push({
        id: `comment-${index}`,
        message: trimmed,
      });
      return;
    }

    if (typeof value === "object") {
      const subject =
        value?.asunto ??
        value?.subject ??
        value?.titulo ??
        value?.title ??
        null;

      const rawMessage =
        value?.mensaje ??
        value?.message ??
        value?.comentario ??
        value?.note ??
        value?.descripcion ??
        value?.texto ??
        null;

      let message: string | null = null;
      if (typeof rawMessage === "string" && rawMessage.trim()) {
        message = rawMessage.trim();
      } else if (typeof subject === "string" && subject.trim()) {
        message = subject.trim();
      } else {
        try {
          message = JSON.stringify(value);
        } catch {
          message = String(value);
        }
      }

      if (!message) return;

      const createdAt =
        value?.fecha ||
        value?.fecha_creacion ||
        value?.created_at ||
        value?.updated_at ||
        value?.fecha_registro ||
        null;

      const authorCandidate =
        value?.autor ||
        value?.autor_nombre ||
        value?.creado_por ||
        value?.usuario ||
        value?.responsable ||
        value?.user?.nombre ||
        value?.user?.email ||
        value?.user?.username ||
        null;

      normalized.push({
        id: value?.id ?? value?.uuid ?? `comment-${index}`,
        subject: typeof subject === "string" ? subject : null,
        message,
        createdAt,
        author: typeof authorCandidate === "string" ? authorCandidate : null,
      });
      return;
    }

    const coerced = String(value).trim();
    if (coerced) {
      normalized.push({
        id: `comment-${index}`,
        message: coerced,
      });
    }
  };

  const firstSource = sources.find((source) => {
    if (Array.isArray(source)) return true;
    if (typeof source === "string" && source.trim()) return true;
    if (source && typeof source === "object") return true;
    return false;
  });

  if (Array.isArray(firstSource)) {
    firstSource.forEach((entry, idx) => pushComment(entry, idx));
  } else if (firstSource && typeof firstSource === "object") {
    Object.values(firstSource).forEach((entry, idx) => pushComment(entry, idx));
  } else if (typeof firstSource === "string") {
    pushComment(firstSource, 0);
  }

  const scored = normalized.map((entry, idx) => {
    const date = normalizeDate(entry.createdAt);
    const score = date ? date.getTime() : Number.MIN_SAFE_INTEGER + idx;
    return { entry, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.map(({ entry }) => entry);
};

export const renderMultilineText = (text?: string | null): ReactNode => {
  if (!text) return null;
  const segments = String(text)
    .split(/\r?\n/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  if (segments.length === 0) return null;

  return (
    <ul className="grid gap-2 text-sm leading-relaxed text-muted-foreground" role="list">
      {segments.map((segment, index) => (
        <li key={`item-${index}`} className="flex items-start gap-3">
          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/70" aria-hidden="true" />
          <span className="flex-1">{segment}</span>
        </li>
      ))}
    </ul>
  );
};

export const buildApplicationSlug = (application: any, index: number) => {
  const idLike =
    application?.id ||
    application?.postulacion_id ||
    application?.application_id ||
    application?.uuid ||
    application?.slug;
  if (idLike !== undefined && idLike !== null && idLike !== "") {
    return `id-${String(idLike)}`;
  }
  return `idx-${index}`;
};

export const matchesApplicationSlug = (application: any, index: number, slug: string) => {
  if (!slug) return false;
  const trimmed = slug.trim();
  if (!trimmed) return false;
  const normalizedSlug = trimmed.toLowerCase();
  if (normalizedSlug.startsWith("id-")) {
    const expected = buildApplicationSlug(application, index);
    return expected.toLowerCase() === normalizedSlug;
  }
  if (!normalizedSlug.startsWith("idx-")) return false;
  const idxPart = normalizedSlug.slice(4);
  const parsed = Number.parseInt(idxPart, 10);
  return Number.isInteger(parsed) && parsed === index;
};

export const findApplicationBySlug = (applications: any[], slug: string) => {
  for (let index = 0; index < applications.length; index += 1) {
    if (matchesApplicationSlug(applications[index], index, slug)) {
      return { application: applications[index], index };
    }
  }
  return { application: null, index: -1 };
};
