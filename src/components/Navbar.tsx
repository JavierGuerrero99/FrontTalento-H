import { useState } from "react";
import { Button } from "./ui/button";
import { Building2, User, Menu, X, Briefcase, UserPlus } from "lucide-react";
import talentoHubLogo from "figma:asset/052c6a78ca3319cbddd4ec6681d537029ae56218.png";
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
            <img 
              src={talentoHubLogo} 
              alt="Talento-Hub" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-primary">Talento-Hub</span>
          </div>

          {/* Navegación Desktop */}
          <div className="hidden md:flex items-center gap-2">
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
            {isAuthenticated && (
              <>
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
            )}
            <Button
              variant={activeSection === "registro" ? "default" : "ghost"}
              onClick={() => handleNavigation("registro")}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Registro
            </Button>
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
                {isAuthenticated && (
                  <DropdownMenuItem
                    onClick={() => handleNavigation("perfil")}
                    className="gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    Perfil
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => handleNavigation("registro")}
                  className="gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Registro
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
