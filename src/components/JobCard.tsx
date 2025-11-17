import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Building2, MapPin, DollarSign, Clock, Users, Briefcase } from "lucide-react";
import type { Job } from "../lib/mockJobs";

interface JobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
}

export function JobCard({ job, onViewDetails }: JobCardProps) {
  // Formatear fecha de expiración/publicación como DD/MM/AAAA
  const posted = job.postedDate ? new Date(job.postedDate) : null;
  const formattedDate = posted
    ? `${String(posted.getDate()).padStart(2, "0")}/${String(posted.getMonth() + 1).padStart(2, "0")}/${posted.getFullYear()}`
    : "Fecha no disponible";

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onViewDetails(job)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="mb-2">{job.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {job.company}
            </CardDescription>
          </div>
          <Badge variant={job.type === "Tiempo completo" ? "default" : "secondary"}>
            {job.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4" />
            <span>{job.salary}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-4 h-4" />
            <span>{job.experience}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{job.applicants} candidatos</span>
          </div>
          <div className="flex gap-2">
            {job.isRemote && (
              <Badge variant="outline" className="text-xs">
                Remoto
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {job.category}
            </Badge>
          </div>
        </div>

        <Button className="w-full" onClick={(e) => { e.stopPropagation(); onViewDetails(job); }}>
          Ver detalles
        </Button>
      </CardContent>
    </Card>
  );
}
