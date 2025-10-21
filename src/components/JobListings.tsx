import { useState, useMemo } from "react";
import { JobSearch } from "./JobSearch";
import { JobCard } from "./JobCard";
import { JobDetail } from "./JobDetail";
import { mockJobs, type Job } from "../lib/mockJobs";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle } from "lucide-react";

export function JobListings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedJobType, setSelectedJobType] = useState("Todos");
  const [selectedExperience, setSelectedExperience] = useState("Todos");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filtrar trabajos
  const filteredJobs = useMemo(() => {
    return mockJobs.filter((job) => {
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
  }, [searchTerm, location, selectedCategory, selectedJobType, selectedExperience, remoteOnly]);

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

        {/* Grid de trabajos */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onViewDetails={handleViewDetails} />
            ))}
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No se encontraron trabajos que coincidan con tus criterios de búsqueda.
              Intenta ajustar los filtros o buscar otros términos.
            </AlertDescription>
          </Alert>
        )}
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
