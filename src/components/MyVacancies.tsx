import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Calendar,
  RefreshCw,
  Briefcase,
  MapPin,
  DollarSign,
  ClipboardList,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { listAssignedVacancies, listVacancies } from "../services/api";

interface MyVacanciesProps {
  userId?: number | null;
  userEmail?: string | null;
  onViewVacancy?: (vacancyId: number) => void;
  onBack?: () => void;
}

const normalizeEmail = (value?: string | null) => (value ? value.trim().toLowerCase() : null);

const possibleEmailKeys = [
  "rrhh_email",
  "email_rrhh",
  "correo_rrhh",
  "responsable_rrhh_email",
  "asignado_rrhh_email",
  "assigned_rrhh_email",
  "gestor_rrhh_email",
];

const possibleIdKeys = [
  "rrhh_id",
  "responsable_rrhh_id",
  "recursos_humanos_id",
  "gestor_rrhh_id",
  "assigned_rrhh_id",
];

const possibleObjectKeys = [
  "rrhh",
  "rrhh_asignado",
  "responsable_rrhh",
  "recursos_humanos",
  "recurso_humano",
  "gestor_rrhh",
  "asignado_rrhh",
  "assigned_rrhh",
];

const possibleCollections = [
  "rrhh_asignados",
  "asignaciones_rrhh",
  "responsables_rrhh",
];

const extractEmailsFromValue = (value: any): string[] => {
  if (!value) return [];
  if (typeof value === "string") {
    return value.includes("@") ? [value.toLowerCase()] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => extractEmailsFromValue(item));
  }
  if (typeof value === "object") {
    const emails: string[] = [];
    if (typeof value.email === "string") emails.push(value.email.toLowerCase());
    if (typeof value.correo === "string") emails.push(value.correo.toLowerCase());
    if (typeof value.user_email === "string") emails.push(value.user_email.toLowerCase());
    if (value.user && typeof value.user.email === "string") emails.push(value.user.email.toLowerCase());
    possibleEmailKeys.forEach((key) => {
      if (typeof value[key] === "string") emails.push(value[key].toLowerCase());
    });
    return Array.from(new Set(emails));
  }
  return [];
};

const extractIdsFromValue = (value: any): number[] => {
  if (!value) return [];
  if (typeof value === "number") return [value];
  if (Array.isArray(value)) return value.flatMap((item) => extractIdsFromValue(item));
  if (typeof value === "object") {
    const ids: number[] = [];
    if (typeof value.id === "number") ids.push(value.id);
    if (value.user && typeof value.user.id === "number") ids.push(value.user.id);
    possibleIdKeys.forEach((key) => {
      if (typeof value[key] === "number") ids.push(value[key]);
    });
    return Array.from(new Set(ids));
  }
  return [];
};

const isAssignedToUser = (vacancy: any, userId?: number | null, userEmail?: string | null) => {
  const normalizedUserEmail = normalizeEmail(userEmail ?? undefined);
  const emails = new Set<string>();
  const ids = new Set<number>();

  possibleEmailKeys.forEach((key) => {
    if (typeof vacancy?.[key] === "string") {
      emails.add(vacancy[key].toLowerCase());
    }
  });

  possibleIdKeys.forEach((key) => {
    if (typeof vacancy?.[key] === "number") {
      ids.add(vacancy[key]);
    }
  });

  possibleObjectKeys.forEach((key) => {
    const value = vacancy?.[key];
    extractEmailsFromValue(value).forEach((email) => emails.add(email));
    extractIdsFromValue(value).forEach((id) => ids.add(id));
  });

  possibleCollections.forEach((key) => {
    const collection = vacancy?.[key];
    extractEmailsFromValue(collection).forEach((email) => emails.add(email));
    extractIdsFromValue(collection).forEach((id) => ids.add(id));
  });

  if (normalizedUserEmail && emails.has(normalizedUserEmail)) {
    return true;
  }
  if (userId && ids.has(userId)) {
    return true;
  }
  return false;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return date.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
};

const formatCurrency = (value?: string | number | null) => {
  if (value === null || value === undefined || value === "") return null;
  const amount = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(amount)) return String(value);
  return amount.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
};

interface AssignedVacancyCardProps {
  vacancy: any;
  onViewVacancy?: (vacancyId: number) => void;
}

const getStatusBadgeStyles = (estado: string) => {
  switch (estado) {
    case "publicado":
    case "activa":
    case "abierta":
      return "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600";
    case "pendiente":
    case "revision":
      return "bg-sky-500/90 text-white hover:bg-sky-600";
    case "cerrada":
    case "finalizada":
      return "bg-rose-500 text-white hover:bg-rose-600";
    default:
      return "bg-amber-400/25 text-amber-700 dark:text-amber-200";
  }
};

const AssignedVacancyCard = ({ vacancy, onViewVacancy }: AssignedVacancyCardProps) => {
  const estado = (vacancy?.estado || "").toLowerCase();
  const companyName =
    vacancy?.empresa?.nombre ||
    vacancy?.empresa_nombre ||
    vacancy?.company_name ||
    vacancy?.empresa?.razon_social ||
    `Empresa ${vacancy?.empresa_id ?? ""}`;
  const salarioFormateado = formatCurrency(vacancy.salario);

  return (
    <Card
      key={vacancy.id}
      className="flex h-full flex-col border border-border/40 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl dark:bg-slate-900/70"
      role="listitem"
      aria-labelledby={`vacancy-${vacancy.id}-title`}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle id={`vacancy-${vacancy.id}-title`} className="text-lg font-semibold leading-tight">
              {vacancy.titulo || `Vacante ${vacancy.id}`}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-1">{companyName}</p>
          </div>
          <Badge
            variant="secondary"
            className={`${getStatusBadgeStyles(estado)} capitalize`}
          >
            {estado ? estado.replaceAll("_", " ") : "Sin estado"}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-[11px]">
            ID #{vacancy.id}
          </Badge>
          {vacancy.asignacion_id && (
            <Badge variant="outline" className="text-[11px]" aria-label={`Asignación ${vacancy.asignacion_id}`}>
              Asignación #{vacancy.asignacion_id}
            </Badge>
          )}
          {vacancy?.modalidad_trabajo && (
            <Badge variant="outline" className="text-[11px]">
              {vacancy.modalidad_trabajo}
            </Badge>
          )}
          {vacancy?.tipo_jornada && (
            <Badge variant="outline" className="text-[11px]">
              {vacancy.tipo_jornada}
            </Badge>
          )}
        </div>

        <dl className="grid gap-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>
              <span className="sr-only">Fecha de expiración:</span>
              Expira: {formatDate(vacancy.fecha_expiracion)}
            </span>
          </div>
          {vacancy.fecha_asignacion && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>
                <span className="sr-only">Fecha de asignación:</span>
                Asignada: {formatDate(vacancy.fecha_asignacion)}
              </span>
            </div>
          )}
        </dl>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between space-y-4">
        <div className="space-y-4">
          {vacancy.descripcion && (
            <section aria-label="Descripción" className="space-y-1 text-sm">
              <p className="font-semibold text-foreground">Descripción</p>
              <p className="text-muted-foreground line-clamp-3">{vacancy.descripcion}</p>
            </section>
          )}
          {vacancy.requisitos && (
            <section aria-label="Requisitos" className="space-y-1 text-sm">
              <p className="font-semibold text-foreground">Requisitos</p>
              <p className="text-muted-foreground whitespace-pre-line line-clamp-4">{vacancy.requisitos}</p>
            </section>
          )}
          <section className="grid gap-2 text-sm text-muted-foreground">
            {vacancy.ubicacion && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>{vacancy.ubicacion}</span>
              </div>
            )}
            {salarioFormateado && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" aria-hidden="true" />
                <span>{salarioFormateado}</span>
              </div>
            )}
            {vacancy.experiencia && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" aria-hidden="true" />
                <span>Experiencia: {vacancy.experiencia}</span>
              </div>
            )}
            {vacancy.beneficios && (
              <div className="flex items-start gap-2">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                <span className="whitespace-pre-line">{vacancy.beneficios}</span>
              </div>
            )}
          </section>
        </div>

        <div className="flex justify-end pt-2">
          <Button size="sm" className="px-4" onClick={() => onViewVacancy?.(vacancy.id)}>
            Ver detalle
            <span className="sr-only"> de {vacancy.titulo || `Vacante ${vacancy.id}`}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const extractVacancyArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.vacantes)) return data.vacantes;
  if (Array.isArray(data?.vacantes_asignadas)) return data.vacantes_asignadas;
  if (Array.isArray(data?.assigned_vacancies)) return data.assigned_vacancies;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const normalizeAssignedVacancies = (items: any[]): any[] => {
  if (!Array.isArray(items)) return [];
  return items.map((entry) => {
    if (!entry) return entry;
    const sourceVacancy = entry.vacante || entry.vacancy || entry.job || entry.oferta || entry;
    if (!sourceVacancy || typeof sourceVacancy !== "object") {
      return {
        ...entry,
        asignacion_id: entry.asignacion_id ?? entry.assignment_id ?? entry.id,
        fecha_asignacion: entry.fecha_asignacion ?? entry.assignment_date,
      };
    }
    return {
      ...sourceVacancy,
      asignacion_id: entry.asignacion_id ?? entry.assignment_id ?? sourceVacancy.asignacion_id,
      fecha_asignacion: entry.fecha_asignacion ?? entry.assignment_date ?? sourceVacancy.fecha_asignacion,
      _assignmentMeta: {
        raw: entry,
      },
    };
  });
};

export function MyVacancies({ userId = null, userEmail = null, onViewVacancy, onBack }: MyVacanciesProps) {
  const [vacancies, setVacancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVacancies = useCallback(async () => {
    setLoading(true);
    try {
      let data: any;
      try {
        data = await listAssignedVacancies();
      } catch (primaryError) {
        console.warn("Fallo la carga desde mis_asignadas, se intenta con listado general", primaryError);
        data = await listVacancies();
      }
      const rawList = extractVacancyArray(data);
      const list = normalizeAssignedVacancies(rawList);
      const filtered = list.filter((vacancy) =>
        isAssignedToUser(vacancy, userId ?? undefined, userEmail ?? undefined)
      );
      setVacancies(filtered.length > 0 ? filtered : list);
      setError(null);
    } catch (err) {
      console.error("Error al cargar las vacantes asignadas", err);
      setError("No se pudieron cargar tus vacantes asignadas");
    } finally {
      setLoading(false);
    }
  }, [userEmail, userId]);

  useEffect(() => {
    if (!userId && !userEmail) {
      setVacancies([]);
      setLoading(false);
      return;
    }
    fetchVacancies();
  }, [fetchVacancies, userEmail, userId]);

  const hasVacancies = useMemo(() => vacancies.length > 0, [vacancies]);
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    }
  }, [onBack]);

  if (!userId && !userEmail) {
    return (
      <div className="w-full" role="status" aria-live="polite">
        <Alert>
          <AlertDescription>
            No pudimos determinar tu usuario. Vuelve a iniciar sesión para ver tus vacantes asignadas.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  return (
    <section
      className="relative isolate w-full overflow-hidden rounded-3xl border border-border/30 bg-gradient-to-br from-sky-50 via-white to-violet-50 p-6 shadow-2xl dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 sm:p-8"
      aria-labelledby="assigned-vacancies-heading"
    >
      <div className="pointer-events-none absolute -top-24 -right-16 -z-10 h-64 w-64 rounded-full bg-sky-300/40 blur-3xl dark:bg-indigo-500/30" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 -z-10 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl dark:bg-fuchsia-500/20" />

      <div className="space-y-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/40 bg-white/60 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground shadow-sm backdrop-blur dark:bg-slate-900/60">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Panel RRHH
            </div>
            <div className="space-y-2">
              <h2 id="assigned-vacancies-heading" className="text-3xl font-semibold text-slate-900 dark:text-slate-50 sm:text-4xl">
                Mis vacantes asignadas
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Lleva el control de cada proceso activo, revisa detalles clave y continua gestionando a tus candidatos sin perder el contexto.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2 text-muted-foreground hover:bg-slate-900/10 dark:hover:bg-slate-100/10"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Volver
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchVacancies}
              disabled={loading}
              className="gap-2 bg-primary/90 text-primary-foreground shadow-sm transition-all hover:bg-primary"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Actualizar
            </Button>
          </div>
        </header>

        {loading && (
          <div
            className="flex flex-col items-center gap-4 rounded-2xl border border-slate-200/60 bg-white/70 px-6 py-16 text-muted-foreground shadow-inner backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/50"
            role="status"
          >
            <Briefcase className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
            <p className="text-sm font-medium">Cargando tus vacantes asignadas...</p>
          </div>
        )}

        {!loading && error && (
          <Alert variant="destructive" role="alert" className="rounded-2xl border border-red-200/60 bg-red-50/80 backdrop-blur">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && !hasVacancies && (
          <div
            className="flex flex-col items-center gap-5 rounded-2xl border border-slate-200/60 bg-white/70 px-6 py-16 text-center text-muted-foreground shadow-inner backdrop-blur dark:border-slate-800/60 dark:bg-slate-900/50"
            role="status"
          >
            <Briefcase className="h-12 w-12 text-primary" aria-hidden="true" />
            <div className="space-y-2">
              <p className="text-base font-semibold text-foreground">Aún no tienes vacantes asignadas</p>
              <p className="text-sm leading-relaxed">
                Cuando recibas una asignación aparecerá aquí con toda la información necesaria para darle seguimiento.
              </p>
            </div>
            <Button size="sm" variant="outline" className="gap-2" onClick={fetchVacancies}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Volver a intentar
            </Button>
          </div>
        )}

        {!loading && !error && hasVacancies && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" role="list" aria-label="Listado de vacantes asignadas">
            {vacancies.map((vacancy) => (
              <AssignedVacancyCard key={vacancy.id} vacancy={vacancy} onViewVacancy={onViewVacancy} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
