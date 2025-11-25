import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { getUserCompanies, makeAbsoluteUrl } from "../services/api";
import { toast } from "react-hot-toast";

interface CompanyListProps {
  onSelectCompany?: (companyId: number) => void;
}

export function CompanyList({ onSelectCompany }: CompanyListProps) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getUserCompanies()
      .then((data) => {
        if (!mounted) return;
        setCompanies(data || []);
        setError(null);
      })
      .catch((e) => {
        if (!mounted) return;
        const message = "No se pudieron cargar las empresas";
        setError(message);
        toast.error(message);
        console.error(e);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const getLogoUrl = (c: any) => {
    if (!c) return undefined;
    if (c.logo_url) {
      if (c.logo_url.startsWith("http")) {
        // Codificar el nombre de archivo para URLs remotas
        try {
          const u = new URL(c.logo_url);
          const segs = u.pathname.split("/");
          segs[segs.length - 1] = encodeURIComponent(segs[segs.length - 1]);
          u.pathname = segs.join("/");
          return u.toString();
        } catch {
          return c.logo_url;
        }
      }
      return makeAbsoluteUrl(c.logo_url);
    }
    if (c.logo) return typeof c.logo === "string" ? c.logo : c.logo?.url;
    return undefined;
  };

  const getCompanyName = (c: any) => c?.nombre || c?.name || c?.companyName || `Empresa ${c?.id ?? ""}`;

  if (loading) return <div className="text-center py-8">Cargando empresas...</div>;
  if (error) return <div className="text-destructive text-center py-8">{error}</div>;
  if (!companies || companies.length === 0)
    return <div className="text-center py-8 text-muted-foreground">No tienes empresas registradas</div>;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <Card key={company.id} className="flex flex-col hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 rounded-full overflow-hidden border border-border/60 bg-white/80 dark:bg-slate-900/80">
              {getLogoUrl(company) ? (
                <ImageWithFallback
                  src={getLogoUrl(company)}
                  alt={getCompanyName(company)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <AvatarFallback className="text-xl rounded-full">{getCompanyName(company)[0]}</AvatarFallback>
              )}
            </Avatar>
            <CardTitle className="text-base line-clamp-2">{getCompanyName(company)}</CardTitle>
            <CardDescription className="text-sm">NIT: {company.nit}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-end w-full">
            {company.descripcion && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4 text-center">{company.descripcion}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onSelectCompany?.(company.id)}
            >
              Ver detalles
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default CompanyList;
