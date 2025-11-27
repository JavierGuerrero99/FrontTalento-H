import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Edit, Trash2, Send, Calendar, Briefcase, UserCog } from "lucide-react";
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
import { listVacancies, editVacancy } from "../services/api";
import { toast } from "react-hot-toast";
import { AssignVacancyHrDialog } from "./AssignVacancyHrDialog";

interface VacantesEmpresaProps {
  empresaId: number;
}


export function VacantesEmpresa({ empresaId }: VacantesEmpresaProps) {
  const colombiaCities = [
    "Bogotá",
    "Medellín",
    "Cali",
    "Barranquilla",
    "Cartagena",
    "Bucaramanga",
    "Pereira",
    "Santa Marta",
    "Manizales",
    "Cúcuta",
    "Ibagué",
    "Villavicencio",
    "Pasto",
    "Montería",
    "Neiva",
    "Armenia",
    "Sincelejo",
    "Popayán",
    "Valledupar",
    "Tunja",
    "Riohacha",
    "Yopal",
    "Floridablanca",
    "Soacha",
    "Palmira",
    "Envigado",
    "Itagüí",
    "Chía",
    "Zipaquirá",
    "Soledad",
    "Girón",
    "Dosquebradas",
    "Apartadó",
    "Turbo",
    "Rionegro",
    "Jamundí",
    "Sogamoso",
    "Facatativá",
    "Fusagasugá",
    "Florencia",
    "Quibdó",
    "Leticia",
    "San Andrés",
  ];
  const [vacantes, setVacantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "borrador" | "publicado">("all");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingVacante, setEditingVacante] = useState<any | null>(null);
  const [publishConfirmId, setPublishConfirmId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [assignHrVacancy, setAssignHrVacancy] = useState<any | null>(null);
  const [isAssignHrOpen, setIsAssignHrOpen] = useState(false);
  const [editValues, setEditValues] = useState({
    titulo: "",
    descripcion: "",
    requisitos: "",
    fecha_expiracion: "",
    ubicacion: "",
    salario: "",
    experiencia: "",
    beneficios: "",
    tipo_jornada: "",
    modalidad_trabajo: "",
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
      listVacancies(empresaId)
        .then((data) => {
          if (!mounted) return;
          setVacantes(data || []);
          setError(null);
          setSuccess(null);
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
      ubicacion: vacante.ubicacion || "",
      salario: vacante.salario != null ? String(vacante.salario) : "",
      experiencia: vacante.experiencia || "",
      beneficios: vacante.beneficios || "",
      tipo_jornada: vacante.tipo_jornada || "",
      modalidad_trabajo: vacante.modalidad_trabajo || "",
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
      if (editValues.ubicacion.trim()) payload.ubicacion = editValues.ubicacion.trim();
      if (editValues.salario.trim()) payload.salario = editValues.salario.trim();
      if (editValues.experiencia.trim()) payload.experiencia = editValues.experiencia.trim();
      if (editValues.beneficios.trim()) payload.beneficios = editValues.beneficios.trim();
      if (editValues.tipo_jornada.trim()) payload.tipo_jornada = editValues.tipo_jornada.trim();
      if (editValues.modalidad_trabajo.trim()) payload.modalidad_trabajo = editValues.modalidad_trabajo.trim();
      await editVacancy(editingVacante.id, payload);
      setIsEditOpen(false);
      setEditingVacante(null);
      const successMessage = "Vacante actualizada correctamente";
      setSuccess(successMessage);
      toast.success(successMessage);
      await refreshVacantes();
    } catch (e) {
      console.error("Error al guardar cambios de la vacante", e);
      const message =
        (e as any)?.response?.data?.detalle ||
        (e as any)?.response?.data?.detail ||
        (e as any)?.response?.data?.error ||
        "Error al guardar cambios de la vacante. Verifica que la fecha no sea pasada y que todos los campos sean válidos.";
      const errorMessage = typeof message === "string" ? message : "Error al guardar cambios de la vacante.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId == null) return;
    try {
      await import('../services/api').then(({ deleteVacancy }) => deleteVacancy(deleteConfirmId));
      const successMessage = 'Vacante eliminada correctamente';
      setSuccess(successMessage);
      toast.success(successMessage);
      setDeleteConfirmId(null);
      await refreshVacantes();
    } catch (e) {
      const errorMessage = 'Error al eliminar la vacante';
      setError(errorMessage);
      toast.error(errorMessage);
      setDeleteConfirmId(null);
    }
  };

  const handleConfirmPublish = async () => {
    if (publishConfirmId == null) return;
    try {
      await import('../services/api').then(({ publishVacancy }) => publishVacancy(publishConfirmId));
      const successMessage = 'Vacante publicada correctamente';
      setSuccess(successMessage);
      toast.success(successMessage);
      setPublishConfirmId(null);
      await refreshVacantes();
    } catch (e) {
      const errorMessage = 'Error al publicar la vacante';
      setError(errorMessage);
      toast.error(errorMessage);
      setPublishConfirmId(null);
    }
  };

  const handleOpenAssignHr = (vacante: any) => {
    setAssignHrVacancy(vacante);
    setIsAssignHrOpen(true);
  };

  const handleCloseAssignHr = () => {
    setIsAssignHrOpen(false);
    setAssignHrVacancy(null);
  };

  const refreshVacantes = async () => {
    setLoading(true);
    try {
        const data = await listVacancies(empresaId);
      setVacantes(data || []);
      setError(null);
    } catch (e) {
      const errorMessage = "No se pudieron cargar las vacantes";
      setError(errorMessage);
      toast.error(errorMessage);
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
    <>
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

        {/* Success */}
        {success && (
          <Alert className="mb-6 border-primary/50 bg-primary/10 text-primary">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
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
                        className={
                          isPublicado
                            ? "bg-primary text-primary-foreground [a&]:hover:bg-primary/90"
                            : "bg-secondary/70 text-primary"
                        }
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
                          <Badge variant="outline" className="text-[11px] border-primary/60 text-primary">
                            Visible para candidatos
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[11px] border-secondary/60 text-primary">
                            En borrador
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 sm:justify-end w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => handleOpenAssignHr(vacante)}
                        >
                          <UserCog className="w-4 h-4" />
                          Asignar RRHH
                        </Button>
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
                            onClick={() => setPublishConfirmId(vacante.id)}
                          >
                            <Send className="w-4 h-4" />
                            Publicar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() => setDeleteConfirmId(vacante.id)}
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
                <Label htmlFor="ubicacion">Ubicación</Label>
                <select
                  id="ubicacion"
                  className="border rounded-md px-3 py-2 text-sm w-full"
                  value={editValues.ubicacion}
                  onChange={(e) => onEditChange("ubicacion", e.target.value)}
                >
                  <option value="">Selecciona una ciudad</option>
                  {colombiaCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                  <option value="Otra">Otra</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salario">Salario</Label>
                <Input
                  id="salario"
                  type="number"
                  step="0.01"
                  value={editValues.salario}
                  onChange={(e) => onEditChange("salario", e.target.value)}
                  placeholder="Ej. 3000000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="experiencia">Experiencia requerida</Label>
                <select
                  id="experiencia"
                  className="border rounded-md px-3 py-2 text-sm w-full"
                  value={editValues.experiencia}
                  onChange={(e) => onEditChange("experiencia", e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Sin experiencia">Sin experiencia</option>
                  <option value="6 meses">6 meses</option>
                  <option value="1 año">1 año</option>
                  <option value="3 años">3 años</option>
                  <option value="+5 años">+5 años</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="beneficios">Beneficios</Label>
                <Textarea
                  id="beneficios"
                  value={editValues.beneficios}
                  onChange={(e) => onEditChange("beneficios", e.target.value)}
                  rows={3}
                  placeholder="Escribe un beneficio por línea..."
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
              <div className="grid gap-2">
                <Label htmlFor="tipo_jornada">Tipo de jornada</Label>
                <select
                  id="tipo_jornada"
                  className="border rounded-md px-3 py-2 text-sm w-full"
                  value={editValues.tipo_jornada}
                  onChange={(e) => onEditChange("tipo_jornada", e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Tiempo completo">Tiempo completo</option>
                  <option value="Medio tiempo">Medio tiempo</option>
                  <option value="Contrato">Contrato</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Pasantía">Pasantía</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="modalidad_trabajo">Modalidad de trabajo</Label>
                <select
                  id="modalidad_trabajo"
                  className="border rounded-md px-3 py-2 text-sm w-full"
                  value={editValues.modalidad_trabajo}
                  onChange={(e) => onEditChange("modalidad_trabajo", e.target.value)}
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Hibrido">Híbrido</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Presencial">Presencial</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button onClick={submitEdit}>Guardar cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Publish confirm dialog */}
        <Dialog open={publishConfirmId !== null} onOpenChange={(open: boolean) => !open && setPublishConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Publicar vacante</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que quieres publicar esta vacante? Luego será visible para los candidatos.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPublishConfirmId(null)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmPublish}>
                Sí, publicar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirm dialog */}
        <Dialog open={deleteConfirmId !== null} onOpenChange={(open: boolean) => !open && setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Eliminar vacante</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. ¿Quieres eliminar esta vacante?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleConfirmDelete}>
                Sí, eliminar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>
      <AssignVacancyHrDialog
        open={isAssignHrOpen}
        vacancy={assignHrVacancy}
        onClose={handleCloseAssignHr}
        onAssigned={async (message) => {
          setError(null);
          await refreshVacantes();
          setSuccess(message);
        }}
      />
    </>
  );
}

export default VacantesEmpresa;
