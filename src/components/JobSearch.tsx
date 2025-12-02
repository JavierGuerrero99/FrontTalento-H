import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { useState } from "react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface JobSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedJobType: string;
  onJobTypeChange: (value: string) => void;
  selectedExperience: string;
  onExperienceChange: (value: string) => void;
  remoteOnly: boolean;
  onRemoteOnlyChange: (value: boolean) => void;
  location: string;
  onLocationChange: (value: string) => void;
}

export function JobSearch({
  searchTerm,
  onSearchChange,
  selectedJobType,
  onJobTypeChange,
  selectedExperience,
  onExperienceChange,
  remoteOnly,
  onRemoteOnlyChange,
  location,
  onLocationChange,
}: JobSearchProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const jobTypes = [
    "Todos",
    "Tiempo completo",
    "Medio tiempo",
    "Contrato",
    "Freelance",
    "Pasantía",
  ];
  const experienceLevels = [
    "Todos",
    "Sin experiencia",
    "6 meses",
    "1 año",
    "3 años",
    "+5 años",
  ];

  const activeFiltersCount = [
    selectedJobType !== "Todos",
    selectedExperience !== "Todos",
    remoteOnly,
    location !== "",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onJobTypeChange("Todos");
    onExperienceChange("Todos");
    onRemoteOnlyChange(false);
    onLocationChange("");
    onSearchChange("");
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, empresa o palabra clave..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative flex-1 max-w-xs">
          <Input
            placeholder="Ubicación..."
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
          />
        </div>
        <Button className="gap-2">
          <Search className="w-4 h-4" />
          Buscar
        </Button>
      </div>

      {/* Filtros Desktop */}
      <div className="hidden md:flex gap-4 items-end flex-wrap">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Tipo de jornada
          </Label>
          <Select value={selectedJobType} onValueChange={onJobTypeChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo de jornada" />
            </SelectTrigger>
            <SelectContent>
              {jobTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Experiencia requerida
          </Label>
          <Select value={selectedExperience} onValueChange={onExperienceChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Experiencia" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 border rounded-md px-3 py-1.5 text-sm">
          <Switch
            id="remote-only"
            checked={remoteOnly}
            onCheckedChange={onRemoteOnlyChange}
          />
          <Label htmlFor="remote-only" className="cursor-pointer text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Solo remotos
          </Label>
        </div>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={clearAllFilters} className="gap-2">
            <X className="w-4 h-4" />
            Limpiar filtros ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Filtros Mobile */}
      <div className="md:hidden">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <Filter className="w-4 h-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filtros de búsqueda</SheetTitle>
              <SheetDescription>
                Personaliza tu búsqueda de empleos
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6">
              <div className="space-y-2">
                  <Label>Tipo de jornada</Label>
                <Select value={selectedJobType} onValueChange={onJobTypeChange}>
                  <SelectTrigger>
                      <SelectValue placeholder="Tipo de jornada" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                  <Label>Experiencia requerida</Label>
                <Select value={selectedExperience} onValueChange={onExperienceChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Experiencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="remote-mobile"
                  checked={remoteOnly}
                  onCheckedChange={onRemoteOnlyChange}
                />
                <Label htmlFor="remote-mobile">Solo trabajos remotos</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={() => setMobileFiltersOpen(false)}>
                  Aplicar filtros
                </Button>
                <Button variant="outline" onClick={clearAllFilters}>
                  Limpiar
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters badges */}
      {activeFiltersCount > 0 && (
        <div className="flex gap-2 flex-wrap">
          {selectedJobType !== "Todos" && (
            <Badge variant="secondary" className="gap-1">
              {selectedJobType}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onJobTypeChange("Todos")}
              />
            </Badge>
          )}
          {selectedExperience !== "Todos" && (
            <Badge variant="secondary" className="gap-1">
              {selectedExperience}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onExperienceChange("Todos")}
              />
            </Badge>
          )}
          {remoteOnly && (
            <Badge variant="secondary" className="gap-1">
              Remoto
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onRemoteOnlyChange(false)}
              />
            </Badge>
          )}
          {location && (
            <Badge variant="secondary" className="gap-1">
              {location}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onLocationChange("")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
