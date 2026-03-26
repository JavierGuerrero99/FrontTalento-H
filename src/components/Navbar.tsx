import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Building2, User, Menu, X, Briefcase, UserPlus, Layers } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { makeAbsoluteUrl } from "../services/api";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getUserCompanies } from "../services/api";

interface NavbarProps {
  activeSection?: string;
  onNavigate?: (section: string) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  userRole?: string | null;
  hideMisEmpresas?: boolean;
}

const normalizeRole = (rawRole: unknown): string | null => {
  if (!rawRole) return null;

  const value = String(rawRole).trim().toLowerCase();
  if (!value) return null;

  const compact = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s._-]+/g, "");

  if (compact.includes("admin")) return "admin";
  if (compact.includes("rrhh") || compact.includes("recursoshumanos") || compact === "hr") return "rrhh";
  if (compact.includes("candidato")) return "candidato";

  return compact;
};

export function Navbar({
  activeSection = "trabajos",
  onNavigate,
  isAuthenticated = false,
  onLogout,
  userRole = null,
  hideMisEmpresas = false,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companiesWithLogo, setCompaniesWithLogo] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      getUserCompanies()
        .then(async (data) => {
          console.log('🔎 Empresas cargadas en Navbar:', data);
          setCompanies(data);

          // Validar logos y guardar en nueva lista para no re-filtrar constantemente
          const validated = await Promise.all(
            data.map(async (c: any) => ({ ...c, _checkedLogo: await validateLogoUrl(getCompanyLogo(c)) }))
          );

          console.log('🔎 Empresas con logos validados:', validated.map((c: any) => ({ id: c.id, _checkedLogo: c._checkedLogo })));
          setCompaniesWithLogo(validated);
        })
        .catch((error: any) => {
          console.error("Error al cargar las empresas:", error?.response?.status, error?.response?.data || error);
          if (error?.response?.status === 401) {
            console.warn('401 al obtener empresas — token inválido o expirado. Intentando refrescar...');
          }
        });
    }
  }, [isAuthenticated]);

  // Helper para mostrar el nombre correcto de la empresa
  const getCompanyDisplayName = (company: any) =>
    company?.nombre ||
    company?.name ||
    company?.companyName ||
    company?.razon_social ||
    company?.razonSocial ||
    `Empresa ${company?.id ?? ""}`;

  // Mostrar el objeto completo en consola para detectar key del logo
  useEffect(() => {
    if (companies.length > 0) {
      console.log('🔎 company shapes example:', companies[0]);
    }
  }, [companies]);

  const getCompanyLogo = (company: any) => {
    // backend may return a string or an object
    if (!company) return undefined;
    let url;
    if (typeof company.logo === "string") url = company.logo;
    if (!url && company.logo?.url) url = company.logo.url;
    if (company.logo_url) {
      // Siempre codificar el último segmento (nombre de archivo) para evitar 400 por caracteres especiales
      try {
        // Si es absoluta
        if (/^https?:\/\//i.test(company.logo_url)) {
          const u = new URL(company.logo_url);
          const segs = u.pathname.split("/");
          segs[segs.length - 1] = encodeURIComponent(segs[segs.length - 1]);
          u.pathname = segs.join("/");
          return u.toString();
        }
      } catch (e) {
        // ignore and try as relative below
      }

      // Relativa -> convertir a absoluta y codificar el último segmento
      const abs = makeAbsoluteUrl(company.logo_url);
      if (!abs) return undefined;
      try {
        const u2 = new URL(abs);
        const segs2 = u2.pathname.split("/");
        segs2[segs2.length - 1] = encodeURIComponent(segs2[segs2.length - 1]);
        u2.pathname = segs2.join("/");
        return u2.toString();
      } catch (e) {
        return abs;
      }
    }
    if (company.logoUrl) return company.logoUrl;
    if (company.image) return makeAbsoluteUrl(company.image);
    // Si fue encontrada, convertir a absoluta si es relativo
    if (url) return makeAbsoluteUrl(url);
    return undefined;
  };

  // Construye y devuelve una URL segura para el logo codificando el nombre de archivo
  const validateLogoUrl = async (url?: string | undefined) => {
    if (!url) return undefined;
    try {
      // Asegurar que la url sea absoluta
      let finalUrl = url;
      if (!/^https?:\/\//i.test(finalUrl)) {
        const abs = makeAbsoluteUrl(finalUrl);
        if (abs) finalUrl = abs;
      }

      const u = new URL(finalUrl);
      const segs = u.pathname.split("/");
      segs[segs.length - 1] = encodeURIComponent(segs[segs.length - 1]);
      u.pathname = segs.join("/");
      return u.toString();
    } catch (err) {
      console.warn("Logo URL encoding failed for", url, err);
      return undefined;
    }
  };

  const handleNavigation = (section: string) => {
    if (onNavigate) {
      onNavigate(section);
    }
    setMobileMenuOpen(false);
  };

  const normalizedRole = normalizeRole(userRole);
  const isAdmin = normalizedRole === "admin";
  const isRRHH = normalizedRole === "rrhh";
  const canViewAdminSections = isAdmin;
  const roleLabel = normalizedRole
    ? normalizedRole === "candidato"
      ? null
      : normalizedRole === "admin"
      ? "Empresario"
      : normalizedRole === "rrhh"
      ? "Recursos Humanos"
      : normalizedRole
          .split(/[\s_-]+/)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
    : null;

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation("trabajos")}>
            <img
              src="/logo.png"
              alt="Talento-Hub logo"
              className="w-10 h-10 rounded-full object-contain bg-card"
            />
            <span className="text-primary font-semibold">Talento-Hub</span>
          </div>

          {/* Navegación Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {roleLabel && (
                  <Badge variant="secondary" className="uppercase tracking-wide text-[11px]">
                    {roleLabel}
                  </Badge>
                )}
                <Button
                  variant={activeSection === "trabajos" ? "default" : "ghost"}
                  onClick={() => handleNavigation("trabajos")}
                  className="gap-2"
                >
                  <Briefcase className="w-4 h-4" />
                  Trabajos
                </Button>

                <Button
                  variant={activeSection === "empresas" ? "default" : "ghost"}
                  onClick={() => handleNavigation("empresas")}
                  className="gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  Empresas
                </Button>

                {canViewAdminSections && (
                  <>
                    {!hideMisEmpresas && (
                      <Button
                        variant={activeSection === "mis-empresas" ? "default" : "ghost"}
                        onClick={() => handleNavigation("mis-empresas")}
                        className="gap-2"
                      >
                        <Layers className="w-4 h-4" />
                        Mis Empresas
                      </Button>
                    )}
                  </>
                )}

                {(isRRHH || isAdmin) && (
                  <Button
                    variant={activeSection === "mis-vacantes" ? "default" : "ghost"}
                    onClick={() => handleNavigation("mis-vacantes")}
                    className="gap-2"
                  >
                    <Layers className="w-4 h-4" />
                    Mis vacantes
                  </Button>
                )}

                <Button
                  variant={activeSection === "perfil" ? "default" : "ghost"}
                  onClick={() => handleNavigation("perfil")}
                  className="gap-2"
                >
                  <User className="w-4 h-4" />
                  Perfil
                </Button>

                <Button variant="ghost" onClick={() => onLogout && onLogout()} className="gap-2">
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant={activeSection === "login" ? "default" : "ghost"}
                  onClick={() => handleNavigation("login")}
                  className="gap-2"
                >
                  Iniciar sesión
                </Button>
                <Button
                  variant={activeSection === "registro" ? "default" : "ghost"}
                  onClick={() => handleNavigation("registro")}
                  className="gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Registro
                </Button>
                <Button
                  variant={activeSection === "recover" ? "default" : "ghost"}
                  onClick={() => handleNavigation("recover")}
                  className="gap-2"
                >
                  Recuperar contraseña
                </Button>
              </>
            )}
          </div>

          {/* Menú Mobile */}
          <div className="md:hidden">
            <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAuthenticated ? (
                  <>
                    {roleLabel && (
                      <DropdownMenuItem disabled className="uppercase text-[11px] tracking-wide opacity-70">
                        {roleLabel}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleNavigation("trabajos")}
                      className="gap-2 cursor-pointer"
                    >
                      <Briefcase className="w-4 h-4" />
                      Trabajos
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleNavigation("empresas")}
                      className="gap-2 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4" />
                      Empresas
                    </DropdownMenuItem>

                    {canViewAdminSections && (
                      <>
                        {!hideMisEmpresas && (
                          <DropdownMenuItem
                            onClick={() => handleNavigation("mis-empresas")}
                            className="gap-2 cursor-pointer"
                          >
                            <Layers className="w-4 h-4" />
                            Mis Empresas
                          </DropdownMenuItem>
                        )}
                      </>
                    )}

                    {(isRRHH || isAdmin) && (
                      <DropdownMenuItem
                        onClick={() => handleNavigation("mis-vacantes")}
                        className="gap-2 cursor-pointer"
                      >
                        <Layers className="w-4 h-4" />
                        Mis vacantes
                      </DropdownMenuItem>
                    )}

                    {canViewAdminSections && ((companiesWithLogo.length > 0) ? companiesWithLogo : companies).length > 0 && (
                      <div className="px-2 py-1">
                        {((companiesWithLogo.length > 0) ? companiesWithLogo : companies).map((company: any) => (
                          <DropdownMenuItem
                            key={company.id}
                            onClick={() => handleNavigation(`empresa-${company.id}`)}
                            className="gap-2 cursor-pointer"
                            title={getCompanyDisplayName(company)}
                          >
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                {company._checkedLogo ? (
                                    <ImageWithFallback
                                      src={company._checkedLogo}
                                      alt={getCompanyDisplayName(company)}
                                      className="w-6 h-6 object-cover rounded-full"
                                    />
                                  ) : (
                                  <AvatarFallback>{getCompanyDisplayName(company)?.[0] ?? "E"}</AvatarFallback>
                                )}
                              </Avatar>
                              <span className="truncate block max-w-[12rem]">{getCompanyDisplayName(company)}</span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    )}

                    <DropdownMenuItem
                      onClick={() => handleNavigation("perfil")}
                      className="gap-2 cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      Perfil
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => onLogout && onLogout()} className="gap-2 cursor-pointer">
                      Cerrar sesión
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => handleNavigation("login")} className="gap-2 cursor-pointer">
                      Iniciar sesión
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation("registro")} className="gap-2 cursor-pointer">
                      Registro
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation("recover")} className="gap-2 cursor-pointer">
                      Recuperar contraseña
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
