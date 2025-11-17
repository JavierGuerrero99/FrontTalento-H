import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Building2, User, Menu, X, Briefcase, UserPlus, Layers } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { makeAbsoluteUrl } from "../services/api";
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
}

export function Navbar({ activeSection = "trabajos", onNavigate, isAuthenticated = false, onLogout }: NavbarProps) {
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

  return (
    <nav className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation("trabajos")}>
            <img
              src="/logo.png"
              alt="Talento-Hub logo"
              className="w-10 h-10 rounded-full object-contain bg-white"
            />
            <span className="text-primary font-semibold">Talento-Hub</span>
          </div>

          {/* Navegación Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
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
                  Crear empresa
                </Button>

                {/* 🔥 NUEVA SECCIÓN: MIS EMPRESAS */}
                <Button
                  variant={activeSection === "mis-empresas" ? "default" : "ghost"}
                  onClick={() => handleNavigation("mis-empresas")}
                  className="gap-2"
                >
                  <Layers className="w-4 h-4" />
                  Mis Empresas
                </Button>                <Button
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
                      Crear empresa
                    </DropdownMenuItem>

                    {/* 🔥 NUEVA SECCIÓN MOBILE */}
                    <DropdownMenuItem
                      onClick={() => handleNavigation("mis-empresas")}
                      className="gap-2 cursor-pointer"
                    >
                      <Layers className="w-4 h-4" />
                      Mis Empresas
                    </DropdownMenuItem>

                    {((companiesWithLogo.length > 0) ? companiesWithLogo : companies).length > 0 && (
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
