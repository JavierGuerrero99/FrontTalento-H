import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Edit, Trash2, Send, Calendar, Briefcase } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import api, { listVacancies } from "../services/api";
import { editVacancy } from "../services/api";

interface VacantesEmpresaProps {
  empresaId: number;
}


export function VacantesEmpresa({ empresaId }: VacantesEmpresaProps) {
  const [vacantes, setVacantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "borrador" | "publicado">("all");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVacante, setEditingVacante] = useState<any | null>(null);
  const [editValues, setEditValues] = useState({
    titulo: "",
    descripcion: "",
    requisitos: "",
    fecha_expiracion: "",
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
      listVacancies(empresaId)
        .then((data) => {
          if (!mounted) return;
          setVacantes(data || []);
          setError(null);
        })
      .catch((e) => {
        if (!mounted) return;
        setError("No se pudieron cargar las vacantes");
        console.error(e);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [empresaId]);

  // No recordar el filtro entre empresas: resetear a "Todos" al cambiar de empresa
  useEffect(() => {
    setStatusFilter("all");
  }, [empresaId]);

  // Handlers para acciones
  const handleEdit = (vacante: any) => {
    setEditingVacante(vacante);
    const date = vacante.fecha_expiracion
      ? new Date(vacante.fecha_expiracion)
      : null;
    const yyyyMMdd = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      : "";
    setEditValues({
      titulo: vacante.titulo || "",
      descripcion: vacante.descripcion || "",
      requisitos: vacante.requisitos || "",
      fecha_expiracion: yyyyMMdd,
    });
    setIsEditOpen(true);
  };

  const onEditChange = (field: keyof typeof editValues, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const submitEdit = async () => {
    if (!editingVacante) return;
    try {
      const payload: any = {
        titulo: editValues.titulo.trim(),
        descripcion: editValues.descripcion.trim(),
        requisitos: editValues.requisitos.trim(),
      };
      if (editValues.fecha_expiracion) {
        payload.fecha_expiracion = `${editValues.fecha_expiracion}T00:00:00`;
      }
      await editVacancy(editingVacante.id, payload);
      setIsEditOpen(false);
      setEditingVacante(null);
      await refreshVacantes();
    } catch (e) {
      alert("Error al guardar cambios de la vacante");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Seguro que deseas eliminar esta vacante?')) {
      try {
        await import('../services/api').then(({ deleteVacancy }) => deleteVacancy(id));
        await refreshVacantes();
      } catch (e) {
        alert('Error al eliminar la vacante');
      }
    }
  };

  const handlePublish = async (id: number) => {
    if (window.confirm('¿Seguro que deseas publicar esta vacante?')) {
      try {
        await import('../services/api').then(({ publishVacancy }) => publishVacancy(id));
        await refreshVacantes();
      } catch (e) {
        alert('Error al publicar la vacante');
      }
    }
  };

  const refreshVacantes = async () => {
    setLoading(true);
    try {
        const data = await listVacancies(empresaId);
      setVacantes(data || []);
      setError(null);
    } catch (e) {
      setError("No se pudieron cargar las vacantes");
    } finally {
      setLoading(false);
    }
  };

  // Debug: log state of vacancies
  if (vacantes.length > 0) {
    console.log('📋 Vacantes cargadas:', vacantes.map(v => ({ id: v.id, titulo: v.titulo, estado: v.estado, tipo: typeof v.estado })));
  }

  const filteredVacantes = vacantes.filter((v) => {
    const s = (v?.estado || "").toLowerCase();
    if (statusFilter === "all") return true;
    if (statusFilter === "borrador") return s === "borrador" || s === "";
    if (statusFilter === "publicado") return s === "publicado";
    return true;
  });

  const totalCount = vacantes.length;
  const publishedCount = vacantes.filter((v) => (v?.estado || "").toLowerCase() === "publicado").length;
  const draftCount = totalCount - publishedCount;

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background to-muted/10 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Vacantes</h1>
          </div>
          <p className="text-lg text-muted-foreground">Gestiona y publica tus ofertas de empleo</p>
          {/* Filtro por estado */}
          <div className="mt-4 mb-10 flex items-center justify-between py-2 px-2 rounded-md bg-muted/30">
            <span className="text-sm text-muted-foreground hidden sm:inline">Filtrar por estado</span>
            <Tabs value={statusFilter} onValueChange={(v: string) => setStatusFilter(v as "all" | "borrador" | "publicado")}>
              <TabsList>
                <TabsTrigger
                  value="all"
                  className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 data-[state=active]:border-primary data-[state=active]:shadow-sm"
                >
                  Todos
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground/80">{totalCount}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="borrador"
                  className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 data-[state=active]:border-primary data-[state=active]:shadow-sm"
                >
                  Borrador
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground/80">{draftCount}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="publicado"
                  className="text-muted-foreground data-[state=active]:text-primary data-[state=active]:bg-primary/10 data-[state=active]:border-primary data-[state=active]:shadow-sm"
                >
                  Publicado
                  <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-foreground/80">{publishedCount}</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {/* Divider to separate filter from content */}
          <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-border to-transparent mb-8 rounded" />
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="mt-4 text-muted-foreground">Cargando vacantes...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State (sin vacantes) */}
        {!loading && !error && vacantes.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Sin vacantes</h3>
            <p className="text-muted-foreground">No hay vacantes registradas para esta empresa.</p>
          </div>
        )}

        {/* Empty State (sin resultados por filtro) */}
        {!loading && !error && vacantes.length > 0 && filteredVacantes.length === 0 && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No hay vacantes con el estado seleccionado.</p>
          </div>
        )}

        {/* Vacantes Grid */}
        {!loading && !error && filteredVacantes.length > 0 && (
          <div className="mt-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredVacantes.map((vacante) => {
              const estado = (vacante.estado || "").toLowerCase();
              const isPublicado = estado === "publicado";
              return (
                <Card
                  key={vacante.id}
                  className="hover:shadow-lg transition-shadow cursor-default border border-border/60"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="mb-2 line-clamp-2">{vacante.titulo}</CardTitle>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Expira: {vacante.fecha_expiracion
                              ? new Date(vacante.fecha_expiracion).toLocaleDateString("es-CO", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Sin fecha"}
                          </span>
                        </p>
                      </div>
                      <Badge
                        variant={isPublicado ? "default" : "secondary"}
                        className={isPublicado ? "bg-green-500 text-white hover:bg-green-600" : "bg-yellow-400/20 text-yellow-800"}
                      >
                        {isPublicado ? "Publicado" : "Borrador"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1 text-sm">
                      <h4 className="font-semibold text-foreground">Descripción</h4>
                      <p className="text-muted-foreground line-clamp-3">{vacante.descripcion}</p>
                    </div>
                    <div className="space-y-1 text-sm">
                      <h4 className="font-semibold text-foreground">Requisitos</h4>
                      <p className="text-muted-foreground line-clamp-3">{vacante.requisitos}</p>
                    </div>
                    <div className="flex flex-col gap-3 pt-2 border-t pt-4 mt-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[11px]">
                          ID #{vacante.id}
                        </Badge>
                        {isPublicado ? (
                          <Badge variant="outline" className="text-[11px] border-green-500/60 text-green-700">
                            Visible para candidatos
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[11px] border-yellow-500/60 text-yellow-700">
                            En borrador
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 sm:justify-end w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleEdit(vacante)}
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </Button>
                        {estado !== "publicado" && (
                          <Button
                            size="sm"
                            variant="default"
                            className="gap-2 text-primary-foreground"
                            onClick={() => handlePublish(vacante.id)}
                          >
                            <Send className="w-4 h-4" />
                            Publicar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => handleDelete(vacante.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar vacante</DialogTitle>
              <DialogDescription>Actualiza la información de la vacante seleccionada.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={editValues.titulo}
                  onChange={(e) => onEditChange("titulo", e.target.value)}
                  placeholder="Ej. Desarrollador Frontend"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={editValues.descripcion}
                  onChange={(e) => onEditChange("descripcion", e.target.value)}
                  rows={4}
                  placeholder="Describe la vacante..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="requisitos">Requisitos</Label>
                <Textarea
                  id="requisitos"
                  value={editValues.requisitos}
                  onChange={(e) => onEditChange("requisitos", e.target.value)}
                  rows={3}
                  placeholder="Lista los requisitos..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fecha">Fecha de expiración</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={editValues.fecha_expiracion}
                  onChange={(e) => onEditChange("fecha_expiracion", e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button onClick={submitEdit}>Guardar cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default VacantesEmpresa;
