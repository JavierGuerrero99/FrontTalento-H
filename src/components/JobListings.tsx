import { useEffect, useMemo, useState } from "react";
import { JobSearch } from "./JobSearch";
import { JobCard } from "./JobCard";
import { JobDetail } from "./JobDetail";
import type { Job } from "../lib/mockJobs";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";
import { listVacancies } from "../services/api";

export function JobListings() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedJobType, setSelectedJobType] = useState("Todos");
  const [selectedExperience, setSelectedExperience] = useState("Todos");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Cargar vacantes publicadas desde el backend
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    listVacancies()
      .then((data) => {
        if (!mounted) return;
        const onlyPublished = (data || []).filter((v: any) => (v?.estado || "").toLowerCase() === "publicado");
        const mapped: Job[] = onlyPublished.map((v: any, index: number) => {
          const rawModality =
            v.modalidad_trabajo ??
            v.modalidadTrabajo ??
            v.modalidad ??
            v.modalidadLaboral ??
            v.modalidad_laboral ??
            "";
          const normalizedModality = typeof rawModality === "string" ? rawModality.trim().toLowerCase() : "";
          const isRemote =
            Boolean(v.remoto) ||
            Boolean(v.es_remoto) ||
            normalizedModality.includes("remoto");

          return {
          id: v.id ?? index + 1,
          title: v.titulo ?? "Vacante sin título",
          company: v.empresa_nombre ?? v.empresa?.nombre ?? "Empresa no disponible",
          location: v.ubicacion ?? v.ciudad ?? "Ubicación no especificada",
          salary: v.salario ?? "Salario no especificado",
          type: v.tipo_jornada ?? v.tipo_contrato ?? "Tiempo completo",
          category: v.categoria ?? "General",
          experience: v.experiencia ?? "No especificado",
          description: v.descripcion ?? "Sin descripción",
          requirements: (v.requisitos ? String(v.requisitos).split("\n") : ["Sin requisitos específicos"]),
          benefits: v.beneficios ? String(v.beneficios).split("\n") : [],
          isRemote,
          postedDate: v.fecha_expiracion ?? v.fecha_publicacion ?? new Date().toISOString(),
          applicants: v.postulaciones_count ?? 0,
          };
        });
        setJobs(mapped);
        setError(null);
      })
      .catch((e) => {
        console.error("Error al cargar vacantes publicadas", e);
        if (!mounted) return;
        setError("No se pudieron cargar las vacantes. Intenta más tarde.");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Filtrar trabajos
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Filtro de búsqueda por texto
      const matchesSearch = 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de ubicación
      const matchesLocation = location === "" || 
        job.location.toLowerCase().includes(location.toLowerCase());

      // Filtro de categoría
      const matchesCategory = 
        selectedCategory === "Todas" || job.category === selectedCategory;

      // Filtro de tipo de empleo
      const matchesJobType = 
        selectedJobType === "Todos" || job.type === selectedJobType;

      // Filtro de experiencia
      const matchesExperience = 
        selectedExperience === "Todos" || job.experience === selectedExperience;

      // Filtro de remoto
      const matchesRemote = !remoteOnly || job.isRemote;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesCategory &&
        matchesJobType &&
        matchesExperience &&
        matchesRemote
      );
    });
  }, [jobs, searchTerm, location, selectedCategory, selectedJobType, selectedExperience, remoteOnly]);

  const handleViewDetails = (job: Job) => {
    setSelectedJob(job);
    setDetailsOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Búsqueda y filtros */}
      <JobSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedJobType={selectedJobType}
        onJobTypeChange={setSelectedJobType}
        selectedExperience={selectedExperience}
        onExperienceChange={setSelectedExperience}
        remoteOnly={remoteOnly}
        onRemoteOnlyChange={setRemoteOnly}
        location={location}
        onLocationChange={setLocation}
      />

      {/* Resultados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {filteredJobs.length} {filteredJobs.length === 1 ? "trabajo encontrado" : "trabajos encontrados"}
          </p>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4 animate-spin" />
            <span>Cargando vacantes...</span>
          </div>
        )}

        {error && !loading && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Grid de trabajos */}
        {!loading && !error && filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <div key={job.id} className="h-full flex">
                <JobCard job={job} onViewDetails={handleViewDetails} />
              </div>
            ))}
          </div>
        ) : !loading && !error ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No se encontraron trabajos que coincidan con tus criterios de búsqueda.
              Intenta ajustar los filtros o buscar otros términos.
            </AlertDescription>
          </Alert>
        ) : null}
      </div>

      {/* Modal de detalles */}
      <JobDetail
        job={selectedJob}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}
