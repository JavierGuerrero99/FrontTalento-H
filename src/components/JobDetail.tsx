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
  Bookmark
} from "lucide-react";
import type { Job } from "../lib/mockJobs";

interface JobDetailProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobDetail({ job, open, onOpenChange }: JobDetailProps) {
  if (!job) return null;

  const daysAgo = Math.floor(
    (new Date().getTime() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const timeAgoText = daysAgo === 0 
    ? "Hoy" 
    : daysAgo === 1 
    ? "Hace 1 día" 
    : `Hace ${daysAgo} días`;

  const handleApply = () => {
    alert(`Aplicando a: ${job.title} en ${job.company}\n\nEn una versión completa, aquí se abriría el formulario de aplicación.`);
  };

  const handleSave = () => {
    alert(`Trabajo guardado: ${job.title}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
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
                  <span>{timeAgoText}</span>
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
                <Button className="flex-1 gap-2" onClick={handleApply}>
                  <Send className="w-4 h-4" />
                  Postularme
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

              {/* Botón final de aplicación */}
              <div className="pt-4">
                <Button className="w-full gap-2" size="lg" onClick={handleApply}>
                  <Send className="w-4 h-4" />
                  Postularme a este trabajo
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
