import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import api, { getVacancy } from "../services/api";

interface VacancyDetailProps {
  vacancyId: number;
  onBack?: () => void;
}

export function VacancyDetail({ vacancyId, onBack }: VacancyDetailProps) {
  const [vacancy, setVacancy] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getVacancy(vacancyId)
      .then((data) => {
        if (!mounted) return;
        setVacancy(data);
        setError(null);
      })
      .catch((e) => {
        if (!mounted) return;
        console.error("Error cargando vacante:", e);
        setError("No se pudo cargar la vacante");
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [vacancyId]);

  if (loading) return <div className="text-center py-8">Cargando vacante...</div>;
  if (error) {
    // Solo toast notification
    return null;
  }
  if (!vacancy) return null;

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl">{vacancy.titulo}</CardTitle>
            <CardDescription className="mt-2">{vacancy.empresa?.nombre || `Empresa #${vacancy.empresa}`}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onBack || (() => window.history.back())}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Atrás
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Descripción</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{vacancy.descripcion}</p>
        </div>

        {vacancy.requisitos && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Requisitos</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{vacancy.requisitos}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {vacancy.fecha_expiracion && (
            <div>
              <p className="font-semibold text-muted-foreground">Fecha de expiración</p>
              <p>{new Date(vacancy.fecha_expiracion).toLocaleDateString("es-CO")}</p>
            </div>
          )}
          {vacancy.fecha_creacion && (
            <div>
              <p className="font-semibold text-muted-foreground">Publicada el</p>
              <p>{new Date(vacancy.fecha_creacion).toLocaleDateString("es-CO")}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="default">Aplicar a esta vacante</Button>
          <Button variant="ghost" onClick={onBack || (() => window.history.back())}>Volver</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default VacancyDetail;
