import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ArrowLeft, Eye, Loader2, RefreshCw, Star, StarOff } from "lucide-react";
import {
  getVacancy,
  getVacancyApplications,
  markCandidateAsFavorite,
  removeFavorite,
  listFavorites,
} from "../services/api";
import {
  buildApplicationSlug,
  formatDateTime,
  resolveAppliedAt,
  resolveCandidateId,
  resolveCandidateName,
  resolveFavorite,
  resolveStatus,
  toArray,
} from "../lib/vacancyApplicationsUtils";
import { toast } from "react-hot-toast";

type VacancyApplicationsProps = {
  vacancyId: number;
  onBack?: () => void;
  onViewApplication?: (applicationSlug: string) => void;
};

export function VacancyApplications({ vacancyId, onBack, onViewApplication }: VacancyApplicationsProps) {
    const [filterStatus, setFilterStatus] = useState<string>("");
  const [applications, setApplications] = useState<any[]>([]);
  const [vacancy, setVacancy] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favoriteProcessing, setFavoriteProcessing] = useState<string | null>(null);
  const [favoriteAction, setFavoriteAction] = useState<"add" | "remove" | null>(null);
  const [favoritesMap, setFavoritesMap] = useState<Record<string, string | number>>({});
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);

  const extractFavoriteId = useCallback((value: any): number | string | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number" || typeof value === "string") return value;
    if (typeof value === "object") {
      return (
        value?.id ??
        value?.favorito_id ??
        value?.favorite_id ??
        value?.favorito?.id ??
        value?.favorite?.id ??
        null
      );
    }
    return null;
  }, []);

  const extractCandidateIdFromFavoriteEntry = useCallback((entry: any): string | number | null => {
    if (!entry || typeof entry !== "object") return null;

    const candidates = [
      entry?.candidato,
      entry?.candidato_id,
      entry?.candidate,
      entry?.candidate_id,
      entry?.usuario,
      entry?.usuario_id,
      entry?.user,
      entry?.user_id,
      entry?.candidato?.id,
      entry?.candidate?.id,
      entry?.usuario?.id,
      entry?.user?.id,
    ];

    for (const candidate of candidates) {
      if (candidate === null || candidate === undefined) continue;
      if (typeof candidate === "number" || typeof candidate === "string") {
        return candidate;
      }
    }

    return null;
  }, []);

  const mergeFavoritesIntoApplications = useCallback(
    (apps: any[], map: Record<string, string | number>) =>
      apps.map((application) => {
        const candidateId = resolveCandidateId(application);
        const candidateKey = candidateId === null || candidateId === undefined ? null : String(candidateId);
        const mappedFavoriteId = candidateKey ? map[candidateKey] : undefined;
        const { favoriteId: resolvedFavoriteId, isFavorite: resolvedIsFavorite } = resolveFavorite(application);
        const favoriteId = mappedFavoriteId !== undefined ? mappedFavoriteId : resolvedFavoriteId;
        const isFavorite = mappedFavoriteId !== undefined ? true : resolvedIsFavorite;

        if (!isFavorite) {
          return {
            ...application,
            es_favorito: false,
            is_favorite: false,
            favorito_id: null,
            favorite_id: null,
            favorito: null,
            favorite: null,
            __favoriteId: null,
          };
        }

        return {
          ...application,
          es_favorito: true,
          is_favorite: true,
          favorito_id: favoriteId,
          favorite_id: favoriteId,
          favorito: favoriteId,
          favorite: favoriteId,
          __favoriteId: favoriteId,
        };
      }),
    []
  );

  const normalizeFavorites = useCallback(
    (collection: any[]) => {
      const map: Record<string, string | number> = {};
      collection.forEach((entry) => {
        const candidateId = extractCandidateIdFromFavoriteEntry(entry);
        if (candidateId === null || candidateId === undefined) return;
        const favoriteId = extractFavoriteId(entry) ?? candidateId;
        map[String(candidateId)] = favoriteId;
      });
      return map;
    },
    [extractCandidateIdFromFavoriteEntry, extractFavoriteId]
  );

  const fetchFavoritesMap = useCallback(async () => {
    try {
      const response = await listFavorites();
      const collection = Array.isArray(response)
        ? response
        : Array.isArray(response?.results)
        ? response.results
        : Array.isArray(response?.data)
        ? response.data
        : [];
      const map = normalizeFavorites(collection);
      setFavoritesMap(map);
      setApplications((prev) => mergeFavoritesIntoApplications(prev, map));
      return map;
    } catch (err) {
      console.error("No se pudieron obtener los favoritos", err);
      setFavoritesMap({});
      setApplications((prev) => mergeFavoritesIntoApplications(prev, {}));
      return {};
    }
  }, [mergeFavoritesIntoApplications, normalizeFavorites]);

  const updateFavoriteState = useCallback(
    (candidateId: string | number, isFavorite: boolean, favoriteId: string | number | null = null) => {
      if (candidateId === null || candidateId === undefined) return;
      const candidateKey = String(candidateId);

      setFavoritesMap((prev) => {
        const next = { ...prev };
        if (isFavorite) {
          next[candidateKey] = favoriteId ?? candidateId;
        } else {
          delete next[candidateKey];
        }
        setApplications((apps) => mergeFavoritesIntoApplications(apps, next));
        return next;
      });
    },
    [mergeFavoritesIntoApplications]
  );

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const [applicationsData, vacancyData, favorites] = await Promise.all([
        getVacancyApplications(vacancyId),
        getVacancy(vacancyId).catch(() => null),
        fetchFavoritesMap(),
      ]);
      const normalized = toArray(applicationsData);
      setApplications(mergeFavoritesIntoApplications(normalized, favorites));
      setVacancy(vacancyData);
      setError(null);
    } catch (err) {
      console.error("Error al cargar las postulaciones", err);
      setError("No se pudieron cargar las postulaciones de la vacante");
    } finally {
      setLoading(false);
    }
  }, [vacancyId, fetchFavoritesMap, mergeFavoritesIntoApplications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const totalApplications = useMemo(() => applications.length, [applications]);
  const favoritesCount = useMemo(
    () => applications.filter((application) => resolveFavorite(application).isFavorite).length,
    [applications]
  );

  const displayedApplications = useMemo(() => {
    let filtered = applications;
    if (filterFavoritesOnly) {
      filtered = filtered.filter((application) => resolveFavorite(application).isFavorite);
    }
    if (filterStatus) {
      filtered = filtered.filter((application) => {
        const status = resolveStatus(application).value;
        return status === filterStatus;
      });
    }
    return filtered;
  }, [applications, filterFavoritesOnly]);

  const displayedCount = displayedApplications.length;
  const summaryText = useMemo(() => {
    if (totalApplications === 0) {
      return "Aún no hay postulaciones registradas";
    }
    if (filterFavoritesOnly) {
      if (displayedCount === 0) {
        return "No hay postulaciones marcadas como favoritas";
      }
      return `Mostrando ${displayedCount} favorito${displayedCount === 1 ? "" : "s"}`;
    }
    return `Total de postulaciones: ${totalApplications}`;
  }, [totalApplications, filterFavoritesOnly, displayedCount]);

  const badgeLabel = useMemo(() => {
    if (displayedCount === 0) return null;
    if (filterFavoritesOnly) {
      return `${displayedCount} favorito${displayedCount === 1 ? "" : "s"}`;
    }
    return `${displayedCount} postulacion${displayedCount === 1 ? "" : "es"}`;
  }, [displayedCount, filterFavoritesOnly]);

  const showFavoritesEmptyState = !loading && !error && filterFavoritesOnly && totalApplications > 0 && displayedCount === 0;

  const findFavoriteIdForCandidate = useCallback(
    async (candidateId: string | number | null): Promise<string | number | null> => {
      if (candidateId === null || candidateId === undefined) return null;
      const candidateKey = String(candidateId);
      if (favoritesMap[candidateKey] !== undefined) {
        return favoritesMap[candidateKey];
      }

      const updatedMap = await fetchFavoritesMap();
      return updatedMap[candidateKey] ?? null;
    },
    [favoritesMap, fetchFavoritesMap]
  );

  const handleAddFavorite = useCallback(
    async (slug: string, candidateId: number | string | null) => {
      if (favoriteProcessing) return;

      if (candidateId === null || candidateId === undefined) {
        toast.error("No encontramos el candidato para marcar favorito.");
        return;
      }

      try {
        setFavoriteProcessing(slug);
        setFavoriteAction("add");
        const response = await markCandidateAsFavorite(candidateId);
        const alreadyFavoriteMessage =
          typeof response?.message === "string" &&
          response.message.toLowerCase().includes("ya está marcado");

        let newFavoriteId = extractFavoriteId(response);

        if (newFavoriteId === null || newFavoriteId === undefined) {
          newFavoriteId = await findFavoriteIdForCandidate(candidateId);
        }

        if (newFavoriteId === null || newFavoriteId === undefined) {
          await fetchApplications();
        } else {
          updateFavoriteState(candidateId, true, newFavoriteId);
        }

        if (alreadyFavoriteMessage) {
          toast.success(response.message);
        } else {
          toast.success("Marcado como favorito.");
        }
      } catch (favoriteError: any) {
        const backendMessage = favoriteError?.response?.data?.detail || favoriteError?.message;
        toast.error(backendMessage || "No se pudo marcar como favorito.");
      } finally {
        setFavoriteProcessing(null);
        setFavoriteAction(null);
      }
    },
    [
      favoriteProcessing,
      markCandidateAsFavorite,
      extractFavoriteId,
      fetchApplications,
      updateFavoriteState,
      findFavoriteIdForCandidate,
    ]
  );

  const handleRemoveFavorite = useCallback(
    async (slug: string, candidateId: number | string | null) => {
      if (favoriteProcessing) return;

      if (candidateId === null || candidateId === undefined) {
        toast.error("No encontramos el identificador del favorito para eliminarlo.");
        return;
      }

      try {
        setFavoriteProcessing(slug);
        setFavoriteAction("remove");
        await removeFavorite(candidateId);

        updateFavoriteState(candidateId, false, null);

        toast.success("Favorito eliminado.");
      } catch (favoriteError: any) {
        const backendMessage = favoriteError?.response?.data?.detail || favoriteError?.message;
        toast.error(backendMessage || "No se pudo eliminar de favoritos.");
      } finally {
        setFavoriteProcessing(null);
        setFavoriteAction(null);
      }
    },
    [favoriteProcessing, removeFavorite, updateFavoriteState]
  );

  return (
    <Card className="border border-border/40 shadow-xl backdrop-blur">
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Badge variant="outline" className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Vacante #{vacancyId}
          </Badge>
          <CardTitle className="text-2xl font-semibold leading-tight">
            {vacancy?.titulo || "Postulaciones de la vacante"}
          </CardTitle>
          <CardDescription className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Consulta los perfiles que han aplicado a esta vacante y gestiona sus postulaciones.
          </CardDescription>
          {vacancy?.empresa?.nombre && (
            <p className="text-sm text-muted-foreground">
              Empresa: <span className="font-medium text-foreground">{vacancy.empresa.nombre}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border rounded px-2 py-1 text-sm bg-background"
            style={{ minWidth: 180 }}
          >
            <option value="">Todos los estados</option>
            <option value="Postulado">Postulado</option>
            <option value="En revisión">En revisión</option>
            <option value="Rechazado">Rechazado</option>
            <option value="Entrevista">Entrevista</option>
            <option value="Proceso de Contratación">Proceso de Contratación</option>
            <option value="Contratado">Contratado</option>
          </select>
          <Button
            variant={filterFavoritesOnly ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilterFavoritesOnly((prev) => !prev)}
            className={`gap-2 ${filterFavoritesOnly ? "text-primary" : ""}`}
            aria-pressed={filterFavoritesOnly}
          >
            <Star
              className="h-4 w-4"
              fill={filterFavoritesOnly ? "currentColor" : "none"}
              strokeWidth={filterFavoritesOnly ? 0 : 1.5}
            />
            Favoritos ({favoritesCount})
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchApplications}
            disabled={loading}
            className="gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Actualizar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2 text-muted-foreground hover:bg-muted/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{summaryText}</p>
          {badgeLabel && (
            <Badge variant="secondary" className="px-3 py-1 text-xs">
              {badgeLabel}
            </Badge>
          )}
        </div>

        {/* error solo toast, Alert removido */}

        {loading && (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-border/60 bg-card py-12 text-sm text-muted-foreground shadow-inner backdrop-blur">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando postulaciones...
          </div>
        )}

        {!loading && !error && totalApplications === 0 && (
          <div className="rounded-xl border border-dashed border-border/60 bg-card p-10 text-center text-sm text-muted-foreground backdrop-blur">
            No se encontraron postulaciones para esta vacante por ahora. Invita candidatos o comparte la oferta para recibir aplicaciones.
          </div>
        )}

        {showFavoritesEmptyState && (
          <div className="rounded-xl border border-dashed border-border/60 bg-card p-10 text-center text-sm text-muted-foreground backdrop-blur">
            No hay postulaciones marcadas como favoritas todavía.
          </div>
        )}

        {!loading && !error && displayedCount > 0 && (
          <div className="rounded-xl border border-border/40 bg-card shadow-sm backdrop-blur">
            <Table className="mx-auto max-w-5xl [&_td]:text-center [&_th]:text-center">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Postulante</TableHead>
                  <TableHead className="min-w-[140px]">Estado</TableHead>
                  <TableHead className="min-w-[160px]">Fecha</TableHead>
                  <TableHead className="min-w-[120px] text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedApplications.map((application, index) => {
                  const name = resolveCandidateName(application) || `Postulante #${index + 1}`;
                  const { label: statusLabel, className: statusClassName } = resolveStatus(application);
                  const appliedAt = resolveAppliedAt(application);
                  const slug = buildApplicationSlug(application, index);
                  const candidateId = resolveCandidateId(application);
                  const { isFavorite } = resolveFavorite(application);
                  const isProcessing = favoriteProcessing === slug;
                  const isProcessingAdd = isProcessing && favoriteAction === "add";
                  const isProcessingRemove = isProcessing && favoriteAction === "remove";

                  return (
                    <TableRow key={slug} className="align-middle">
                      <TableCell className="whitespace-normal px-4 py-4">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <span className="font-medium text-foreground">{name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex justify-center">
                          <Badge variant="secondary" className={`px-3 py-1 text-xs capitalize ${statusClassName}`}>
                            {statusLabel}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                        <span className="block text-center whitespace-nowrap">{formatDateTime(appliedAt)}</span>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex justify-center gap-2">
                          {!isFavorite && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground"
                              aria-label="Marcar como favorito"
                              onClick={() => handleAddFavorite(slug, candidateId)}
                              disabled={
                                isProcessing ||
                                candidateId === null ||
                                candidateId === undefined
                              }
                            >
                              {isProcessingAdd ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Star className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          {isFavorite && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-primary hover:text-primary/80"
                              aria-label="Quitar de favoritos"
                              onClick={() => handleRemoveFavorite(slug, candidateId)}
                              disabled={
                                isProcessing ||
                                candidateId === null ||
                                candidateId === undefined
                              }
                            >
                              {isProcessingRemove ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => onViewApplication?.(slug)}
                          >
                            <Eye className="h-4 w-4" />
                            Ver
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
