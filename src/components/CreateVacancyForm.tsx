import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { createVacancy } from "../services/api";
import { toast } from "react-hot-toast";

interface CreateVacancyFormProps {
  companyId: number;
  onCreated?: (created: any) => void;
  onNavigate?: (path: string) => void;
}

export function CreateVacancyForm({ companyId, onCreated, onNavigate }: CreateVacancyFormProps) {
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

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [requisitos, setRequisitos] = useState("");
  const [fechaExpiracion, setFechaExpiracion] = useState<string | undefined>(undefined);
  const [ubicacion, setUbicacion] = useState("");
  const [salario, setSalario] = useState("");
  const [experiencia, setExperiencia] = useState("");
  const [beneficios, setBeneficios] = useState("");
  const [tipoJornada, setTipoJornada] = useState("");
  const [modalidadTrabajo, setModalidadTrabajo] = useState("");
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
      const message = "El título es obligatorio";
      setError(message);
      toast.error(message);
      return;
    }
    if (!descripcion.trim()) {
      const message = "La descripción es obligatoria";
      setError(message);
      toast.error(message);
      return;
    }
    if (!requisitos.trim()) {
      const message = "Los requisitos son obligatorios";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setIsSubmitting(true);
      
      if (!fechaExpiracion) {
        const message = "La fecha de expiración es obligatoria";
        setError(message);
        toast.error(message);
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
        ubicacion: ubicacion.trim() || null,
        salario: salario.trim() || null,
        experiencia: experiencia.trim() || null,
        beneficios: beneficios.trim() || null,
        tipo_jornada: tipoJornada.trim() || null,
        modalidad_trabajo: modalidadTrabajo.trim() || null,
      };

      const created = await createVacancy(payload);
      const successMessage = "Vacante creada correctamente";
      setSuccess(successMessage);
      toast.success(successMessage);
      setCreatedVacancy(created);
      setTitulo("");
      setDescripcion("");
      setRequisitos("");
      setFechaExpiracion(undefined);
      setUbicacion("");
      setSalario("");
      setExperiencia("");
      setBeneficios("");
      setTipoJornada("");
      setModalidadTrabajo("");
      if (onCreated) onCreated(created);
    } catch (err) {
      console.error('Error creando vacante', err);
      const errorMessage = 'No fue posible crear la vacante. Intenta de nuevo.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="w-full max-w-3xl" onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Solo notificaciones toast, sin Alert ni bloque de éxito inline */}

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
          <Label htmlFor="ubicacion">Ubicación</Label>
          <select
            id="ubicacion"
            className="border rounded-md px-3 py-2 text-sm w-full"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
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

        <div>
          <Label htmlFor="salario">Salario (opcional)</Label>
          <Input
            id="salario"
            type="number"
            step="0.01"
            value={salario}
            onChange={(e) => setSalario(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="experiencia">Experiencia requerida</Label>
          <select
            id="experiencia"
            className="border rounded-md px-3 py-2 text-sm w-full"
            value={experiencia}
            onChange={(e) => setExperiencia(e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            <option value="Sin experiencia">Sin experiencia</option>
            <option value="6 meses">6 meses</option>
            <option value="1 año">1 año</option>
            <option value="3 años">3 años</option>
            <option value="+5 años">+5 años</option>
          </select>
        </div>

        <div>
          <Label htmlFor="beneficios">Beneficios (uno por línea)</Label>
          <Textarea id="beneficios" value={beneficios} onChange={(e) => setBeneficios(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="fecha">Fecha de expiración</Label>
          <Input id="fecha" type="date" value={fechaExpiracion ?? ""} onChange={(e) => setFechaExpiracion(e.target.value)} />
        </div>

        <div>
          <Label htmlFor="tipo_jornada">Tipo de jornada</Label>
          <select
            id="tipo_jornada"
            className="border rounded-md px-3 py-2 text-sm w-full"
            value={tipoJornada}
            onChange={(e) => setTipoJornada(e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            <option value="Tiempo completo">Tiempo completo</option>
            <option value="Medio tiempo">Medio tiempo</option>
            <option value="Contrato">Contrato</option>
            <option value="Freelance">Freelance</option>
            <option value="Pasantía">Pasantía</option>
          </select>
        </div>

        <div>
          <Label htmlFor="modalidad_trabajo">Modalidad de trabajo</Label>
          <select
            id="modalidad_trabajo"
            className="border rounded-md px-3 py-2 text-sm w-full"
            value={modalidadTrabajo}
            onChange={(e) => setModalidadTrabajo(e.target.value)}
          >
            <option value="">Selecciona una opción</option>
            <option value="Hibrido">Híbrido</option>
            <option value="Remoto">Remoto</option>
            <option value="Presencial">Presencial</option>
          </select>
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
