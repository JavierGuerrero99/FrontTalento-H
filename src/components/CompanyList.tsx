import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { AssignEmployeesDialog } from "./AssignEmployeesDialog";
import { getUserCompanies, makeAbsoluteUrl } from "../services/api";

interface CompanyListProps {
  onSelectCompany?: (companyId: number) => void;
  onCreateVacancy?: (companyId: number) => void;
  onListVacancies?: (companyId: number) => void;
  onAssignEmployees?: (companyId: number) => void;
}

export function CompanyList({ onSelectCompany, onCreateVacancy, onListVacancies, onAssignEmployees }: CompanyListProps) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [activeCompanyId, setActiveCompanyId] = useState<number | null>(null);

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
        setError("No se pudieron cargar las empresas");
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

  const handleAssignEmployees = (companyId: number) => {
    if (onAssignEmployees) {
      onAssignEmployees(companyId);
      return;
    }
    setActiveCompanyId(companyId);
    setAssignDialogOpen(true);
  };

  return (
    <>
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <Card key={company.id} className="flex flex-col hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="w-16 h-16 mb-2 rounded-full bg-muted">
              {getLogoUrl(company) ? (
                <ImageWithFallback
                  src={getLogoUrl(company)}
                  alt={getCompanyName(company)}
                  className="w-16 h-16 object-contain rounded-full"
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
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onSelectCompany?.(company.id)}
                >
                  Ver detalles
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    onCreateVacancy
                      ? onCreateVacancy(company.id)
                      : (window.location.hash = `empresa-${company.id}-crear-vacante`)
                  }
                >
                  Crear vacante
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1"
                  onClick={() =>
                    onListVacancies
                      ? onListVacancies(company.id)
                      : (window.location.hash = `empresa-${company.id}-vacantes`)
                  }
                >
                  Listar vacantes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleAssignEmployees(company.id)}
                >
                  Agregar empleados
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
      <AssignEmployeesDialog
        open={assignDialogOpen}
        companyId={activeCompanyId}
        onOpenChange={(nextOpen) => {
          setAssignDialogOpen(nextOpen);
          if (!nextOpen) {
            setActiveCompanyId(null);
          }
        }}
      />
    </>
  );
}

export default CompanyList;
