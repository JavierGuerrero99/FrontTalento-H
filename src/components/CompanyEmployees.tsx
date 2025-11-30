import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Users, Mail, BadgeCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { getCompanyEmployees } from "../services/api";
import { toast } from "react-hot-toast";

interface CompanyEmployeesProps {
  companyId: number;
  onBack?: () => void;
}

interface CompanyEmployee {
  id?: number | string;
  nombre?: string;
  name?: string;
  correo?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  rol?: string;
  cargo?: string;
  telefono?: string;
  phone?: string;
  documento?: string;
  numero_documento?: string;
  [key: string]: unknown;
}

export function CompanyEmployees({ companyId, onBack }: CompanyEmployeesProps) {
  const [employees, setEmployees] = useState<CompanyEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companySummary, setCompanySummary] = useState<{ name?: string; total?: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setEmployees([]);
    setCompanySummary(null);
    getCompanyEmployees(companyId)
      .then((data) => {
        if (!mounted) return;
        const raw = data as any;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.trabajadores)
          ? raw.trabajadores
          : Array.isArray(raw?.results)
          ? raw.results
          : [];
        setEmployees(list as CompanyEmployee[]);
        if (raw && typeof raw === "object" && !Array.isArray(raw)) {
          const name = typeof raw.empresa === "string" ? raw.empresa : undefined;
          const total = typeof raw.total_trabajadores === "number" ? raw.total_trabajadores : list.length;
          setCompanySummary({ name, total });
        } else {
          setCompanySummary({ total: list.length });
        }
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Error al cargar empleados", err);
        const message =
          (err as any)?.response?.data?.detail ||
          (err as any)?.response?.data?.error ||
          "No se pudieron cargar los empleados";
        setError(typeof message === "string" ? message : "No se pudieron cargar los empleados");
        toast.error(typeof message === "string" ? message : "No se pudieron cargar los empleados");
        setCompanySummary(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [companyId]);

  const hasEmployees = employees.length > 0;

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Card key={idx} className="border border-border/60">
              <CardHeader className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-destructive bg-muted/10 rounded-xl p-4">
          {error}
        </div>
      );
    }

    if (!hasEmployees) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/10 px-8 py-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Sin empleados asignados</h3>
            <p className="text-sm text-muted-foreground">
              Aún no tienes colaboradores vinculados a esta empresa.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {employees.map((employee, index) => {
          const name =
            employee.nombre?.toString().trim() ||
            employee.name?.toString().trim() ||
            [employee.first_name, employee.last_name]
              .filter((part): part is string => Boolean(part?.toString().trim()))
              .join(" ") ||
            employee.email?.toString().trim() ||
            employee.correo?.toString().trim() ||
            "Empleado";

          const email =
            employee.email?.toString().trim() ||
            employee.correo?.toString().trim() ||
            (employee as any)?.user?.email?.toString().trim() ||
            undefined;

          const role =
            employee.cargo?.toString().trim() ||
            employee.role?.toString().trim() ||
            employee.rol?.toString().trim() ||
            undefined;

          const phone =
            employee.telefono?.toString().trim() ||
            employee.phone?.toString().trim() ||
            undefined;

          const document =
            employee.documento?.toString().trim() ||
            employee.numero_documento?.toString().trim() ||
            undefined;

          const initials = name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0]?.toUpperCase())
            .join("")
            .slice(0, 2) || "--";

          const key = employee.id ?? email ?? `${name}-${index}`;

          return (
            <Card key={key} className="border border-border/60">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials || "--"}
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">{name}</CardTitle>
                    {email && (
                      <CardDescription className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        <span>{email}</span>
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role && (
                    <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                      <BadgeCheck className="h-3 w-3" />
                      {role}
                    </Badge>
                  )}
                  {document && (
                    <Badge variant="outline" className="text-xs">
                      Documento: {document}
                    </Badge>
                  )}
                  {phone && (
                    <Badge variant="outline" className="text-xs">
                      Tel: {phone}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              {employee && (
                <CardContent className="text-sm text-muted-foreground">
                  {(employee as any)?.departamento && (
                    <p>Departamento: {(employee as any).departamento}</p>
                  )}
                  {(employee as any)?.fecha_ingreso && (
                    <p>
                      Ingreso: {new Date((employee as any).fecha_ingreso).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    );
  }, [employees, error, hasEmployees, loading]);

  return (
    <section className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Empleados asignados</h2>
          <p className="text-sm text-muted-foreground">
            Consulta los colaboradores vinculados a esta empresa.
          </p>
          {companySummary && (
            <p className="text-xs text-muted-foreground/80">
              {companySummary.name ? `${companySummary.name} • ` : ""}
              Total colaboradores: {companySummary.total ?? employees.length}
            </p>
          )}
        </div>
        {onBack && (
          <Button variant="ghost" size="sm" className="self-start sm:self-auto" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Regresar
          </Button>
        )}
      </div>
      {content}
    </section>
  );
}

export default CompanyEmployees;
