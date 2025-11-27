import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import {
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Briefcase,
  Check,
  Star,
  Send,
  Bookmark
} from "lucide-react";
import type { Job } from "../lib/mockJobs";
import { applyToVacancy } from "../services/api";

interface JobDetailProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetail({ job, open, onOpenChange }: JobDetailProps) {
  if (!job) return null;

  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Formatear fecha de expiración/publicación como DD/MM/AAAA
  const posted = job.postedDate ? new Date(job.postedDate) : null;
  const formattedDate = posted
    ? `${String(posted.getDate()).padStart(2, "0")}/${String(posted.getMonth() + 1).padStart(2, "0")}/${posted.getFullYear()}`
    : "Fecha no disponible";

  useEffect(() => {
    if (!open) {
      setApplyError(null);
      setApplySuccess(null);
      setApplying(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  const handleApplyClick = () => {
    setApplyError(null);
    setApplySuccess(null);
    setInfoMessage(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ["pdf", "doc", "docx"];
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      setApplyError("Solo se permiten archivos PDF o Word (.doc, .docx)");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setApplyError(null);
    setApplySuccess(null);
    // Permitir volver a seleccionar el mismo archivo si el usuario cambia de opinión
    event.target.value = "";
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    const vacancyId = Number(job.id);
    if (!Number.isFinite(vacancyId)) {
      setApplyError("No se pudo identificar la vacante seleccionada");
      setSelectedFile(null);
      return;
    }

    setApplying(true);
    setApplyError(null);
    setApplySuccess(null);

    try {
      const response = await applyToVacancy(vacancyId, selectedFile);
      const backendMessage = response?.message || response?.detail;
      setApplySuccess(backendMessage || "Postulación enviada correctamente");
      setSelectedFile(null);
    } catch (error: any) {
      const backendData = error?.response?.data;
      if (typeof backendData === "string") {
        setApplyError(backendData);
      } else if (backendData?.detail) {
        setApplyError(String(backendData.detail));
      } else if (backendData?.error) {
        setApplyError(String(backendData.error));
      } else {
        setApplyError("No se pudo completar la postulación. Intenta nuevamente");
      }
    } finally {
      setApplying(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setApplyError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    setInfoMessage(`Trabajo guardado: ${job.title}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileChange}
        />
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            {applySuccess && (
              <Alert className="mb-4 border-primary/50 bg-primary/10 text-primary">
                <AlertDescription className="text-primary">{applySuccess}</AlertDescription>
              </Alert>
            )}
            {applyError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{applyError}</AlertDescription>
              </Alert>
            )}
            {selectedFile && (
              <div className="mb-4 overflow-hidden rounded-lg border border-muted bg-background shadow-sm">
                <div className="flex items-center gap-3 border-b border-muted/60 bg-muted/20 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Send className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">¿Listo para enviar tu hoja de vida?</p>
                    <p className="text-xs text-muted-foreground">Revisa el archivo seleccionado antes de confirmar.</p>
                  </div>
                </div>
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-start gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 p-3">
                    <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Archivo:</span> {selectedFile.name}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={handleConfirmUpload} disabled={applying} className="flex-1 sm:flex-none">
                      {applying ? "Enviando postulación..." : "Confirmar envío"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelUpload}
                      disabled={applying}
                      className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 sm:flex-none"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {infoMessage && (
              <Alert className="mb-4 border-primary/50 bg-primary/10 text-primary">
                <AlertDescription className="text-primary">{infoMessage}</AlertDescription>
              </Alert>
            )}
            <DialogHeader className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-2xl mb-2">{job.title}</DialogTitle>
                  <DialogDescription className="flex items-center gap-2 text-base">
                    <Building2 className="w-5 h-5" />
                    {job.company}
                  </DialogDescription>
                </div>
                <Badge variant={job.type === "Tiempo completo" ? "default" : "secondary"}>
                  {job.type}
                </Badge>
              </div>

              {/* Info rápida */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{job.experience}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{formattedDate}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{job.category}</Badge>
                {job.isRemote && <Badge variant="outline">Remoto</Badge>}
                <Badge variant="outline" className="gap-1">
                  <Users className="w-3 h-3" />
                  {job.applicants} candidatos
                </Badge>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <Button className="flex-1 gap-2" onClick={handleApplyClick} disabled={applying}>
                  <Send className="w-4 h-4" />
                  {applying ? "Enviando postulación..." : "Postularme a este trabajo"}
                </Button>
                <Button variant="outline" size="icon" onClick={handleSave}>
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            <Separator className="my-6" />

            {/* Descripción */}
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Descripción del puesto
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {job.description}
                </p>
              </div>

              <Separator />

              {/* Requisitos */}
              <div>
                <h3 className="mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Requisitos
                </h3>
                <ul className="space-y-2">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <Check className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Beneficios */}
              <div>
                <h3 className="mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Beneficios
                </h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <Star className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Botón final de aplicación (eliminado para evitar duplicados) */}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
