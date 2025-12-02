import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft, CalendarClock, ExternalLink, Loader2, RefreshCw, ClipboardList, FileText, NotebookPen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { commentOnApplication, getVacancy, getVacancyApplications, updateApplicationStatus, createInterview } from "../services/api";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { toast } from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "Postulado", label: "Postulado" },
  { value: "En revisión", label: "En revisión" },
  { value: "Rechazado", label: "Rechazado" },
  { value: "Entrevista", label: "Entrevista" },
  { value: "Proceso de Contratación", label: "Proceso de Contratación" },
  { value: "Contratado", label: "Contratado" },
];

type VacancyApplicationDetailProps = {
  vacancyId: number;
  applicationSlug: string;
  onBack?: () => void;
};

export function VacancyApplicationDetail({ vacancyId, applicationSlug, onBack }: VacancyApplicationDetailProps) {
      // ...existing code...
    // Estado para valoración y descripción de la entrevista
    const [interviewRating, setInterviewRating] = useState<number | null>(null);
    const [interviewReview, setInterviewReview] = useState("");
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    // Simulación de guardado (reemplazar con API real si existe)
    const handleSaveInterviewReview = async () => {
      setReviewSubmitting(true);
      try {
        // Aquí iría la llamada a la API para guardar la valoración y descripción
        await new Promise((resolve) => setTimeout(resolve, 800));
        toast.success("Valoración de la entrevista guardada");
        setReviewDialogOpen(false);
      } catch {
        toast.error("No se pudo guardar la valoración");
      } finally {
        setReviewSubmitting(false);
      }
    };
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
  const [isInterviewDialogOpen, setInterviewDialogOpen] = useState(false);
  const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewMedium, setInterviewMedium] = useState("Google Meet");
  const [interviewDescription, setInterviewDescription] = useState("");
  const [interviewSubmitting, setInterviewSubmitting] = useState(false);

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

  const resetInterviewForm = useCallback(() => {
    setInterviewDate("");
    setInterviewTime("");
    setInterviewMedium("Google Meet");
    setInterviewDescription("");
  }, []);

  const handleInterviewDialogChange = useCallback(
    (open: boolean) => {
      setInterviewDialogOpen(open);
      if (!open) {
        setInterviewSubmitting(false);
        resetInterviewForm();
      }
    },
    [resetInterviewForm, setInterviewSubmitting],
  );

  const canScheduleInterview = useMemo(() => {
    const effectiveStatus = `${statusValue || candidateStatus.value || ""}`
      .trim()
      .toLowerCase();
    return Boolean(applicationId && effectiveStatus === "entrevista");
  }, [applicationId, candidateStatus.value, statusValue]);

  const canReviewInterview = useMemo(() => {
    const effectiveStatus = `${statusValue || candidateStatus.value || ""}`
      .trim()
      .toLowerCase();
    return ["entrevista", "proceso de contratación", "contratado"].includes(effectiveStatus);
  }, [candidateStatus.value, statusValue]);

  const handleScheduleInterview = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!applicationId) {
        toast.error("No encontramos el identificador de la postulación para agendar la entrevista.");
        return;
      }

      const date = interviewDate.trim();
      const time = interviewTime.trim();
      const medium = interviewMedium.trim();
      const description = interviewDescription.trim();

      if (!date || !time || !medium) {
        toast.error("Completa la fecha, hora y medio de la entrevista.");
        return;
      }

      try {
        setInterviewSubmitting(true);
        await createInterview({
          postulacion: applicationId,
          fecha: date,
          hora: time,
          medio: medium,
          valoracion: null,
          descripcion: description || null,
        });
        toast.success("Entrevista agendada correctamente.");
        setInterviewDialogOpen(false);
        resetInterviewForm();
      } catch (scheduleError: any) {
        const backendMessage =
          scheduleError?.response?.data?.detail ||
          scheduleError?.response?.data?.mensaje ||
          scheduleError?.response?.data?.error ||
          scheduleError?.message;
        toast.error(backendMessage || "No se pudo agendar la entrevista. Inténtalo nuevamente.");
      } finally {
        setInterviewSubmitting(false);
      }
    },
    [applicationId, interviewDate, interviewDescription, interviewMedium, interviewTime, resetInterviewForm],
  );

  return (
    <>
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
      <CardContent className="space-y-10">
        {/* error solo toast, Alert removido */}

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
          <div className="grid gap-8 xl:grid-cols-[minmax(0,3.5fr)_minmax(0,1fr)] xl:items-start">
            <div className="flex min-h-[calc(100vh-160px)] w-full flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/50 p-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Hoja de vida</p>
                  <h3 className="text-xl font-semibold text-foreground">{displayName}</h3>
                  <div className="mt-2 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Postulado: {formatDateTime(appliedAt)}
                  </div>
                </div>
                <div className="flex w-full flex-col gap-4 text-sm text-muted-foreground">
                  <Badge variant="secondary" className={`self-start rounded-full px-3 py-1 text-xs capitalize ${candidateStatus.className}`}>
                    {candidateStatus.label}
                  </Badge>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/40 bg-muted/10 p-4 shadow-sm">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Estado de la postulación</Label>
                          <Select value={statusValue} onValueChange={setStatusValue}>
                            <SelectTrigger className="text-left">
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
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="w-full gap-2"
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
                        {(canScheduleInterview || canReviewInterview) ? (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {canScheduleInterview ? (
                              <Button
                                type="button"
                                size="sm"
                                className="w-full gap-2"
                                onClick={() => setInterviewDialogOpen(true)}
                              >
                                <CalendarClock className="h-4 w-4" />
                                Agendar entrevista
                              </Button>
                            ) : null}
                            {canReviewInterview ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="w-full gap-2"
                                onClick={() => !reviewSubmitting && setReviewDialogOpen(true)}
                                disabled={reviewSubmitting}
                              >
                                <NotebookPen className="h-4 w-4" />
                                Valorar
                              </Button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-muted/10 p-4 shadow-sm">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hoja de vida</Label>
                          <p className="text-xs leading-relaxed">
                            Abre el documento original en otra pestaña para revisarlo con más detalle o descargarlo.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          onClick={handleOpenResume}
                          disabled={!resumeUrl}
                        >
                          <ExternalLink className="h-4 w-4" />
                          Abrir en pestaña nueva
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-border/40" />
                  <div className="text-xs leading-relaxed text-muted-foreground/80">
                    Estos cambios son visibles solo para el equipo de selección y ayudan a coordinar los siguientes pasos del proceso.
                  </div>
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
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h4 className="text-base font-semibold text-foreground">Descripción de la vacante</h4>
                </div>
                <div className="mt-3 flex-1 overflow-y-auto rounded-lg border border-border/40 bg-muted/15 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {vacancy?.descripcion
                    ? renderMultilineText(vacancy.descripcion)
                    : <span className="block">Sin descripción registrada para esta vacante.</span>}
                </div>
              </div>
              <div className="flex flex-1 flex-col rounded-xl border border-border/50 bg-card p-6 shadow-sm backdrop-blur">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h4 className="text-base font-semibold text-foreground">Requisitos</h4>
                </div>
                <div className="mt-3 flex-1 overflow-y-auto rounded-lg border border-border/40 bg-muted/15 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
                  {vacancy?.requisitos
                    ? renderMultilineText(vacancy.requisitos)
                    : <span className="block">Sin requisitos especificados para esta vacante.</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección para valorar la entrevista solo si el estado es válido */}
          <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm backdrop-blur">
            <Accordion type="multiple" defaultValue={["internal-notes", "comments-history"]} className="space-y-4">
              <AccordionItem
                value="internal-notes"
                className="overflow-hidden rounded-lg border border-border/40 bg-muted/10"
              >
                <AccordionTrigger className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  <span className="inline-flex items-center gap-2">
                    <NotebookPen className="h-4 w-4 text-primary" aria-hidden="true" />
                    Comentarios internos
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
                    Registra notas sobre el postulante. Estos mensajes se envían mediante el endpoint de contacto.
                  </p>
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
                    <div className="flex flex-col gap-3 sm:items-center sm:justify-between text-xs text-muted-foreground">
                      <span className="leading-relaxed">
                        {applicationId
                          ? "Los comentarios se almacenan sin mostrarse al postulante."
                          : "No pudimos identificar el ID de la postulación."}
                      </span>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={commentSubmitting || !applicationId}
                        className="gap-2 self-end sm:w-auto"
                      >
                        {commentSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {commentSubmitting ? "Enviando..." : "Guardar comentario"}
                      </Button>
                    </div>
                  </form>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="comments-history"
                className="overflow-hidden rounded-lg border border-border/40 bg-muted/10"
              >
                <AccordionTrigger className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                  <span className="inline-flex items-center gap-2">
                    <NotebookPen className="h-4 w-4 text-primary" aria-hidden="true" />
                    Historial de comentarios
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground">
                  {applicationComments.length > 0 ? (
                    <ul className="space-y-4 pt-2">
                      {applicationComments.map((comment, index) => {
                        const key = comment.id ?? `comment-${index}`;
                        const formattedDate = comment.createdAt ? formatDateTime(comment.createdAt) : null;
                        return (
                          <li
                            key={key}
                            className="rounded-lg border border-border/40 bg-card/40 px-4 py-3 shadow-sm"
                          >
                            <div className="flex flex-col gap-2">
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
                              <div className="space-y-2 text-muted-foreground leading-relaxed">
                                {comment.message
                                  .split(/\r?\n/)
                                  .filter((line) => line.trim().length > 0)
                                  .map((line, lineIndex) => (
                                    <p key={`comment-${key}-line-${lineIndex}`}>{line}</p>
                                  ))}
                              </div>
                              {comment.author && (
                                <span className="text-xs text-muted-foreground/80">Autor: {comment.author}</span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="pt-2 text-sm leading-relaxed text-muted-foreground">
                      Aún no hay comentarios registrados para esta postulación.
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )
      </CardContent>
      </Card>
      <Dialog open={isInterviewDialogOpen} onOpenChange={handleInterviewDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar entrevista</DialogTitle>
            <DialogDescription>
              Define la fecha, hora y el medio para coordinar la reunión con la persona candidata.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleInterview} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="interview-date">Fecha</Label>
              <Input
                id="interview-date"
                type="date"
                value={interviewDate}
                onChange={(event) => setInterviewDate(event.target.value)}
                disabled={interviewSubmitting}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interview-time">Hora</Label>
              <Input
                id="interview-time"
                type="time"
                value={interviewTime}
                onChange={(event) => setInterviewTime(event.target.value)}
                disabled={interviewSubmitting}
                required
              />
            </div>
            {/* Campo 'Medio' eliminado */}
            <div className="grid gap-2">
              <Label htmlFor="interview-description">Descripción (opcional)</Label>
              <Textarea
                id="interview-description"
                value={interviewDescription}
                onChange={(event) => setInterviewDescription(event.target.value)}
                rows={3}
                disabled={interviewSubmitting}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleInterviewDialogChange(false)}
                disabled={interviewSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={interviewSubmitting}>
                {interviewSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {interviewSubmitting ? "Agendando..." : "Guardar entrevista"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
        <Dialog
          open={isReviewDialogOpen}
          onOpenChange={(open: boolean) => {
            if (!reviewSubmitting) {
              setReviewDialogOpen(open);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Valorar entrevista</DialogTitle>
              <DialogDescription>
                Registra la calificación y comentarios sobre la entrevista realizada a la persona candidata.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Label className="text-base font-medium">Valoración</Label>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`cursor-pointer text-3xl transition-colors border rounded-full ${interviewRating && interviewRating >= star ? "text-yellow-400 border-yellow-400" : "text-white border-gray-400 hover:text-yellow-300 hover:border-yellow-300"}`}
                        onClick={() => !reviewSubmitting && setInterviewRating(star)}
                        role="button"
                        aria-label={`Valoración ${star}`}
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (!reviewSubmitting && (event.key === "Enter" || event.key === " ")) {
                            setInterviewRating(star);
                          }
                        }}
                        style={{
                          marginRight: star < 5 ? "4px" : 0,
                          borderWidth: "2px",
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {interviewRating ? (
                    <span className="text-sm text-muted-foreground">{interviewRating} / 5</span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="interview-review" className="text-base font-medium">
                  Descripción de la entrevista
                </Label>
                <Textarea
                  id="interview-review"
                  value={interviewReview}
                  onChange={(event) => setInterviewReview(event.target.value)}
                  rows={4}
                  placeholder="Agrega comentarios sobre la entrevista..."
                  disabled={reviewSubmitting}
                  className="border-primary/40 focus:border-primary px-3 py-2"
                  style={{ minHeight: 80 }}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setReviewDialogOpen(false)}
                disabled={reviewSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleSaveInterviewReview}
                disabled={reviewSubmitting || !interviewRating}
                className={`${reviewSubmitting || !interviewRating ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {reviewSubmitting ? "Guardando..." : "Guardar valoración"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </>
  );
}
