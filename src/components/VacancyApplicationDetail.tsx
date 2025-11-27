import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { commentOnApplication, getVacancy, getVacancyApplications, updateApplicationStatus } from "../services/api";
import {
  enhanceResumeViewerUrl,
  findApplicationBySlug,
  formatDateTime,
  renderMultilineText,
  resolveAppliedAt,
  resolveCandidateName,
  resolveComments,
  resolveResumeUrl,
  resolveStatus,
  toArray,
  ApplicationComment,
} from "../lib/vacancyApplicationsUtils";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { toast } from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "Postulado", label: "Postulado" },
  { value: "En revisión", label: "En revisión" },
  { value: "Rechazado", label: "Rechazado" },
  { value: "Entrevista", label: "Entrevista" },
  { value: "Contratado", label: "Contratado" },
];

type VacancyApplicationDetailProps = {
  vacancyId: number;
  applicationSlug: string;
  onBack?: () => void;
};

export function VacancyApplicationDetail({ vacancyId, applicationSlug, onBack }: VacancyApplicationDetailProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [vacancy, setVacancy] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentSubject, setCommentSubject] = useState("");
  const [commentValue, setCommentValue] = useState("");
  const [applicationComments, setApplicationComments] = useState<ApplicationComment[]>([]);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [applicationsData, vacancyData] = await Promise.all([
        getVacancyApplications(vacancyId),
        getVacancy(vacancyId).catch(() => null),
      ]);
      setApplications(toArray(applicationsData));
      setVacancy(vacancyData);
      setError(null);
    } catch (err) {
      console.error("Error al cargar la postulación", err);
      setError("No se pudo cargar la información de la postulación seleccionada");
    } finally {
      setLoading(false);
    }
  }, [vacancyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const { application: selectedApplication, index: applicationIndex } = useMemo(
    () => findApplicationBySlug(applications, applicationSlug),
    [applications, applicationSlug]
  );

  const candidateName = useMemo(
    () => (selectedApplication ? resolveCandidateName(selectedApplication) : null),
    [selectedApplication]
  );
  const candidateStatus = useMemo(
    () =>
      selectedApplication
        ? resolveStatus(selectedApplication)
        : { value: null, label: "Sin estado", className: "bg-secondary text-secondary-foreground" },
    [selectedApplication]
  );
  const appliedAt = useMemo(
    () => (selectedApplication ? resolveAppliedAt(selectedApplication) : null),
    [selectedApplication]
  );
  const resumeUrl = useMemo(
    () => (selectedApplication ? resolveResumeUrl(selectedApplication) : null),
    [selectedApplication]
  );
  const viewerUrl = useMemo(() => enhanceResumeViewerUrl(resumeUrl), [resumeUrl]);

  const displayName = useMemo(() => {
    if (candidateName && candidateName.trim()) {
      return candidateName;
    }
    if (applicationIndex !== undefined && applicationIndex >= 0) {
      return `Postulante #${applicationIndex + 1}`;
    }
    return "Postulación";
  }, [candidateName, applicationIndex]);

  useEffect(() => {
    const current = typeof candidateStatus.value === "string" ? candidateStatus.value : "";
    setStatusValue(current);
  }, [candidateStatus.value]);

  const applicationId = useMemo(() => {
    if (!selectedApplication) return null;
    const possibleKeys = [
      "id",
      "postulacion_id",
      "postulacionId",
      "application_id",
      "applicationId",
    ];
    for (const key of possibleKeys) {
      const value = selectedApplication?.[key];
      if (value !== null && value !== undefined && `${value}`.trim() !== "") {
        const numeric = Number(value);
        return Number.isNaN(numeric) ? `${value}` : numeric;
      }
    }
    return null;
  }, [selectedApplication]);

  useEffect(() => {
    if (selectedApplication) {
      setApplicationComments(resolveComments(selectedApplication));
    } else {
      setApplicationComments([]);
    }
  }, [selectedApplication]);

  const handleOpenResume = () => {
    if (!resumeUrl) return;
    try {
      window.open(resumeUrl, "_blank", "noopener,noreferrer");
    } catch {
      // no-op: some browsers may block the popup
    }
  };

  const handleSubmitComment = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const subject = commentSubject.trim();
      const message = commentValue.trim();
      if (!subject || !message) {
        toast.error("Completa el asunto y tu comentario antes de enviarlo.");
        return;
      }
      if (!applicationId) {
        toast.error("No encontramos el identificador de la postulación para enviar el comentario.");
        return;
      }

      try {
        setCommentSubmitting(true);
        await commentOnApplication(applicationId, subject, message);
        toast.success("Comentario enviado correctamente.");
        setApplicationComments((prev) => [
          {
            id: `local-${Date.now()}`,
            subject,
            message,
            createdAt: new Date().toISOString(),
            author: "Tú",
          },
          ...prev,
        ]);
        setCommentSubject("");
        setCommentValue("");
      } catch (submitError: any) {
        const backendMessage = submitError?.response?.data?.detail || submitError?.message;
        toast.error(backendMessage || "No se pudo enviar el comentario. Inténtalo nuevamente.");
      } finally {
        setCommentSubmitting(false);
      }
    },
    [applicationId, commentSubject, commentValue]
  );

  const handleUpdateStatus = useCallback(async () => {
    const trimmedStatus = statusValue.trim();
    if (!trimmedStatus) {
      toast.error("Selecciona un estado para actualizar la postulación.");
      return;
    }
    if (!applicationId) {
      toast.error("No encontramos el identificador de la postulación para cambiar su estado.");
      return;
    }

    try {
      setStatusUpdating(true);
      await updateApplicationStatus(applicationId, trimmedStatus);
      toast.success("Estado de la postulación actualizado.");
      setApplications((prev) =>
        prev.map((app, idx) => {
          if (idx !== applicationIndex) return app;
          return {
            ...app,
            estado: trimmedStatus,
            estado_postulacion: trimmedStatus,
            status: trimmedStatus,
            decision: trimmedStatus,
          };
        })
      );
    } catch (updateError: any) {
      const backendMessage = updateError?.response?.data?.detail || updateError?.message;
      toast.error(backendMessage || "No se pudo actualizar el estado. Inténtalo nuevamente.");
    } finally {
      setStatusUpdating(false);
    }
  }, [applicationId, statusValue, applicationIndex]);

  return (
    <Card className="border border-border/40 shadow-xl backdrop-blur">
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Vacante #{vacancyId}
          </Badge>
          <CardTitle className="text-2xl font-semibold leading-tight">
            {displayName}
          </CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Visualiza la hoja de vida completa del postulante junto con los detalles de la vacante.
          </CardDescription>
          {vacancy?.titulo && (
            <p className="text-sm text-muted-foreground">
              Vacante: <span className="font-medium text-foreground">{vacancy.titulo}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Actualizar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 text-muted-foreground hover:bg-muted/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && !loading && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-border/60 bg-card py-16 text-sm text-muted-foreground shadow-inner backdrop-blur">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando información de la postulación...
          </div>
        )}

        {!loading && !error && !selectedApplication && (
          <div className="rounded-xl border border-dashed border-border/60 bg-card p-10 text-center text-sm text-muted-foreground backdrop-blur">
            No encontramos la postulación solicitada. Vuelve al listado e inténtalo nuevamente.
          </div>
        )}

        {!loading && !error && selectedApplication && (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,3.5fr)_minmax(0,1fr)] xl:items-start">
            <div className="flex min-h-[calc(100vh-160px)] w-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/50 p-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Hoja de vida</p>
                  <h3 className="text-xl font-semibold text-foreground">{displayName}</h3>
                  <div className="mt-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Postulado: {formatDateTime(appliedAt)}
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className={`self-start px-3 py-1 text-xs capitalize ${candidateStatus.className}`}>
                    {candidateStatus.label}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Select value={statusValue} onValueChange={setStatusValue}>
                      <SelectTrigger className="w-[200px] text-left">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="gap-2"
                      onClick={handleUpdateStatus}
                      disabled={
                        statusUpdating ||
                        !statusValue.trim() ||
                        statusValue.trim() === (typeof candidateStatus.value === "string" ? candidateStatus.value : "")
                      }
                    >
                      {statusUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {statusUpdating ? "Actualizando..." : "Actualizar estado"}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 gap-2"
                    onClick={handleOpenResume}
                    disabled={!resumeUrl}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir en pestaña nueva
                  </Button>
                </div>
              </div>
              <div className="flex flex-1 items-stretch bg-muted/40">
                {viewerUrl ? (
                  <iframe
                    src={viewerUrl}
                    title={`Hoja de vida ${displayName}`}
                    className="h-full min-h-[720px] w-full"
                    style={{ border: "none", minHeight: "720px" }}
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                    El candidato no adjuntó una hoja de vida.
                  </div>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-4 xl:max-w-[360px] xl:self-stretch">
              <div className="flex flex-1 flex-col rounded-xl border border-border/50 bg-card p-6 shadow-sm backdrop-blur">
                <h4 className="text-base font-semibold text-foreground">Descripción de la vacante</h4>
                <div className="mt-3 flex-1 overflow-y-auto rounded-lg border border-border/40 bg-muted/15 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {vacancy?.descripcion
                    ? renderMultilineText(vacancy.descripcion)
                    : <span className="block">Sin descripción registrada para esta vacante.</span>}
                </div>
              </div>
              <div className="flex flex-1 flex-col rounded-xl border border-border/50 bg-card p-6 shadow-sm backdrop-blur">
                <h4 className="text-base font-semibold text-foreground">Requisitos</h4>
                <div className="mt-3 flex-1 overflow-y-auto rounded-lg border border-border/40 bg-muted/15 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {vacancy?.requisitos
                    ? renderMultilineText(vacancy.requisitos)
                    : <span className="block">Sin requisitos especificados para esta vacante.</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && selectedApplication && (
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Comentarios internos</h3>
                <p className="text-sm text-muted-foreground">
                  Registra notas sobre el postulante. Estos mensajes se envían mediante el endpoint de contacto.
                </p>
              </div>

              <form onSubmit={handleSubmitComment} className="flex flex-col gap-4">
                <Input
                  value={commentSubject}
                  onChange={(event) => setCommentSubject(event.target.value)}
                  placeholder="Asunto del comentario"
                  maxLength={120}
                  disabled={commentSubmitting}
                />
                <Textarea
                  value={commentValue}
                  onChange={(event) => setCommentValue(event.target.value)}
                  placeholder="Escribe aquí tus comentarios internos..."
                  minLength={3}
                  rows={4}
                  disabled={commentSubmitting}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {applicationId
                      ? "Los comentarios se almacenan sin mostrarse al postulante."
                      : "No pudimos identificar el ID de la postulación."}
                  </span>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={commentSubmitting || !applicationId}
                    className="gap-2"
                  >
                    {commentSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {commentSubmitting ? "Enviando..." : "Guardar comentario"}
                  </Button>
                </div>
              </form>

              <div className="border-t border-border/40 pt-4">
                <h4 className="text-sm font-semibold text-foreground">Comentarios</h4>
                {applicationComments.length > 0 ? (
                  <ul className="mt-3 space-y-4">
                    {applicationComments.map((comment, index) => {
                      const key = comment.id ?? `comment-${index}`;
                      const formattedDate = comment.createdAt ? formatDateTime(comment.createdAt) : null;
                      return (
                        <li
                          key={key}
                          className="rounded-lg border border-border/40 bg-muted/15 px-4 py-3 text-sm"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-medium text-foreground">
                                {comment.subject?.trim() || "Comentario"}
                              </span>
                              {formattedDate && (
                                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                  {formattedDate}
                                </span>
                              )}
                            </div>
                            <div className="text-muted-foreground leading-relaxed">
                              {comment.message
                                .split(/\r?\n/)
                                .filter((line) => line.trim().length > 0)
                                .map((line, lineIndex) => (
                                  <p key={`comment-${key}-line-${lineIndex}`}>{line}</p>
                                ))}
                            </div>
                            {comment.author && (
                              <span className="text-xs text-muted-foreground">Autor: {comment.author}</span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Aún no hay comentarios registrados para esta postulación.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
