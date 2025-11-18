import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { listCompanies } from "../services/api";

interface Company {
  id: number;
  nombre: string;
  nit: string;
  direccion: string;
  logo_url?: string | null;
  descripcion?: string | null;
}

interface CompaniesListProps {
  searchTerm: string;
}

export function CompaniesList({ searchTerm }: CompaniesListProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listCompanies();
        if (isMounted) {
          setCompanies(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error(err);
        if (isMounted) setError("Error al cargar las empresas.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filtered = companies.filter((c) => {
    if (!normalizedSearch) return true;
    return c.nombre.toLowerCase().includes(normalizedSearch);
  });

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!filtered.length) {
    return <p className="text-sm text-muted-foreground">No se encontraron empresas.</p>;
  }

  return (
    <div className="space-y-3">
      {filtered.map((company) => (
        <Card key={company.id} className="w-full">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-10 w-10">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.nombre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {company.nombre?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold">
                {company.nombre}
              </CardTitle>
              <p className="text-xs text-muted-foreground">NIT: {company.nit}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">Dirección:</span> {company.direccion}
            </p>
            {company.descripcion && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {company.descripcion}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
