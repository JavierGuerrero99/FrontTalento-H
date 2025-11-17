import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { createVacancy } from "../services/api";

interface CreateVacancyFormProps {
  companyId: number;
  onCreated?: (created: any) => void;
  onNavigate?: (path: string) => void;
}

export function CreateVacancyForm({ companyId, onCreated, onNavigate }: CreateVacancyFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [requisitos, setRequisitos] = useState("");
  const [fechaExpiracion, setFechaExpiracion] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdVacancy, setCreatedVacancy] = useState<any>(null);

  // No es necesario obtener el usuario actual; el backend lo extrae del token

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);

    if (!titulo.trim()) {
      setError("El título es obligatorio");
      return;
    }
    if (!descripcion.trim()) {
      setError("La descripción es obligatoria");
      return;
    }
    if (!requisitos.trim()) {
      setError("Los requisitos son obligatorios");
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (!fechaExpiracion) {
        setError("La fecha de expiración es obligatoria");
        setIsSubmitting(false);
        return;
      }

      // Convertir YYYY-MM-DD a YYYY-MM-DDTHH:MM:SS (ISO format)
      const isoDateTime = `${fechaExpiracion}T00:00:00`;
      
      const payload = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        requisitos: requisitos.trim(),
        fecha_expiracion: isoDateTime,
        empresa_id: companyId,
      };

      const created = await createVacancy(payload);
      setSuccess("Vacante creada correctamente");
      setCreatedVacancy(created);
      setTitulo("");
      setDescripcion("");
      setRequisitos("");
      setFechaExpiracion(undefined);
      if (onCreated) onCreated(created);
    } catch (err) {
      console.error('Error creando vacante', err);
      setError('No fue posible crear la vacante. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="w-full max-w-3xl" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && createdVacancy && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 space-y-3">
              <div>
                <p className="font-semibold">{createdVacancy.titulo || "Vacante creada correctamente"}</p>
                <p className="text-sm">{createdVacancy.descripcion}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    const navigate = onNavigate || ((path) => { window.location.hash = path; });
                    navigate(`vacante-${createdVacancy.id}`);
                  }}
                >
                  Ver vacante
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-green-700 hover:text-green-800 hover:bg-green-100"
                  onClick={() => (window.location.hash = "mis-empresas")}
                >
                  Volver a empresas
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div>
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="requisitos">Requisitos (separados por comas o en párrafos)</Label>
          <Textarea id="requisitos" value={requisitos} onChange={(e) => setRequisitos(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="fecha">Fecha de expiración</Label>
          <Input id="fecha" type="date" value={fechaExpiracion ?? ""} onChange={(e) => setFechaExpiracion(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="default" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear vacante"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => (window.location.hash = "mis-empresas")}>Cancelar</Button>
        </div>
      </div>
    </form>
  );
}

export default CreateVacancyForm;
