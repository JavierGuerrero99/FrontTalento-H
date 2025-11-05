import { useState } from "react";
import { Button } from "./ui/button";
import { Building2, User, Menu, X, Briefcase, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface NavbarProps {
  activeSection?: string;
  onNavigate?: (section: string) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export function Navbar({ activeSection = "trabajos", onNavigate, isAuthenticated = false, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          {/* Logo y nombre */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation("trabajos")}>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">TH</div>
            <span className="text-primary">Talento-Hub</span>
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
                  Empresas
                </Button>
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
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
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
                      Empresas
                    </DropdownMenuItem>
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
                    <DropdownMenuItem onClick={() => handleNavigation("login")} className="gap-2 cursor-pointer">Iniciar sesión</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation("registro")} className="gap-2 cursor-pointer">Registro</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation("recover")} className="gap-2 cursor-pointer">Recuperar contraseña</DropdownMenuItem>
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
