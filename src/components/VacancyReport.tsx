import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Loader2 } from "lucide-react";
import axios from "axios";

interface VacancyReportProps {
  vacancyId: number;
  onBack?: () => void;
}

export function VacancyReport({ vacancyId, onBack }: VacancyReportProps) {
    const [exportingId, setExportingId] = useState<number | null>(null);

    const rawBaseUrl = (import.meta as any).env?.VITE_API_URL ?? (import.meta as any).env?.VITE_API_BASE_URL;
    const fallbackBaseUrl = "http://127.0.0.1:8000/api";
    const resolvedBaseRoot = typeof rawBaseUrl === "string" && rawBaseUrl.trim().length > 0 ? rawBaseUrl.trim().replace(/\/+$/, "") : fallbackBaseUrl.replace(/\/+$/, "");
    const BASE_URL = /\/api$/i.test(resolvedBaseRoot) ? resolvedBaseRoot : `${resolvedBaseRoot}/api`;
    const handleExport = async (id: number) => {
      setExportingId(id);
      try {
        const response = await axios.get(`${BASE_URL}/metrics/vacante/${id}/export/pdf/`, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reporte-vacante-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        alert('No se pudo exportar el PDF.');
      } finally {
        setExportingId(null);
      }
    };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`${BASE_URL}/metrics/?id_vacante=${vacancyId}`)
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        setError("No se pudo cargar el reporte de la vacante.");
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [vacancyId]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-extrabold mb-6 text-primary flex items-center gap-2">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#6366f1" strokeWidth="2" d="M4 17V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10"/><path stroke="#6366f1" strokeWidth="2" d="M9 10v4m3-4v4m3-4v4"/></svg>
          Reporte de Vacante
        </h2>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> Cargando...</div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : data && Array.isArray(data.vacantes) && data.vacantes.length > 0 ? (
          data.vacantes.map((vacante: any) => (
            <div key={vacante.vacante_id} className="mb-8 p-6 border border-primary/30 rounded-xl bg-background shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <div className="flex items-center gap-2">
                  <div className="font-bold text-xl text-primary flex items-center gap-2">
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="2"/><path stroke="#6366f1" strokeWidth="2" d="M8 12h8"/></svg>
                    {vacante.titulo}
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                    {vacante.empresa_nombre}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(vacante.vacante_id)}
                  className="rounded-full px-4 border border-primary/50 shadow"
                  disabled={exportingId === vacante.vacante_id}
                >
                  {exportingId === vacante.vacante_id ? 'Exportando...' : 'Exportar'}
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 mt-2 mb-2">
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-semibold text-muted-foreground">ID:</span> {vacante.vacante_id}
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-semibold text-muted-foreground">Total postulaciones:</span>
                  <span className="font-bold text-green-600">{vacante.total_postulaciones}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-semibold text-muted-foreground">Última postulación:</span>
                  <span className="font-medium">{new Date(vacante.ultima_postulacion).toLocaleString()}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="font-semibold mb-2 text-sm text-muted-foreground">Postulaciones por estado:</div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {vacante.postulaciones_por_estado && Object.entries(vacante.postulaciones_por_estado).map(([estado, cantidad]) => (
                    <span key={estado} className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-200">
                      {estado}: <span className="font-bold">{String(cantidad)}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-muted-foreground">No hay datos de métricas disponibles.</div>
        )}
      </div>
      <div className="mt-8 flex justify-end">
        <Button variant="outline" size="lg" onClick={onBack} className="rounded-full px-6">Volver</Button>
      </div>
    </div>
  );
}
