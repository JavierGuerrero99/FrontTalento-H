import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
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
} from "lucide-react";
import type { Job } from "../lib/mockJobs";
import { applyToVacancy } from "../services/api";
import { toast } from "react-hot-toast";

interface JobDetailProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canApply?: boolean;
}

export function JobDetail({ job, open, onOpenChange, canApply = false }: JobDetailProps) {
  if (!job) return null;

  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
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
      setApplyDialogOpen(false);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [open]);

  const handleApplyClick = () => {
    setApplyError(null);
    setApplySuccess(null);
    setApplyDialogOpen(true);
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
      const successMessage = backendMessage || "Postulado con exito";
      setApplySuccess(successMessage);
      toast.success(successMessage);
      setApplyDialogOpen(false);
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
    setApplyDialogOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
            {/* applySuccess/applyError solo toast, Alert removido */}
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

              {/* Botón de postulación solo para candidatos */}
              {canApply && (
                <div className="flex gap-3">
                  <Button className="flex-1 gap-2" onClick={handleApplyClick}>
                    <Send className="w-4 h-4" />
                    Postularme a este trabajo
                  </Button>
                </div>
              )}
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

      {canApply && (
        <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Postularme a esta vacante</DialogTitle>
              <DialogDescription>
                Adjunta tu hoja de vida y confirma el envio de tu postulacion.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                Agregar hoja de vida
              </Button>

              {selectedFile && (
                <div className="rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Archivo seleccionado:</span> {selectedFile.name}
                </div>
              )}

              {applyError && (
                <p className="text-sm text-destructive">{applyError}</p>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex-1"
                  onClick={handleConfirmUpload}
                  disabled={!selectedFile || applying}
                >
                  {applying ? "Enviando postulación..." : "Confirmar postulación"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={handleCancelUpload}
                  disabled={applying}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
