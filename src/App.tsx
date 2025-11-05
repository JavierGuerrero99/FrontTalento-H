import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { CompanyRegistrationForm } from "./components/CompanyRegistrationForm";
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";
import { PasswordRecover } from "./components/PasswordRecover";
import { ProfileSection } from "./components/ProfileSection";
import { JobListings } from "./components/JobListings";
export default function App() {

  // Siempre iniciar en login y limpiar autenticación
  const [activeSection, setActiveSection] = useState("login");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("access_token");
    setActiveSection("login");
    setIsAuthenticated(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
  <Navbar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        isAuthenticated={isAuthenticated}
        onLogout={() => {
          setIsAuthenticated(false);
          setActiveSection("login");
          try {
            localStorage.removeItem("isAuthenticated");
          } catch {}
        }}
      />
      
      <main className="py-8 px-4">
        <div className="flex flex-col items-center">
          {activeSection === "trabajos" && (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="text-center space-y-2">
                <h1 className="text-primary">Encuentra tu próximo trabajo</h1>
                <p className="text-muted-foreground">
                  Explora miles de oportunidades laborales en Colombia
                </p>
              </div>
              <JobListings />
            </div>
          )}

          {activeSection === "empresas" && (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="text-center space-y-2">
                <h1 className="text-primary">Gestión de Empresas</h1>
                <p className="text-muted-foreground">
                  Registra y administra las empresas en Talento-Hub
                </p>
              </div>
              <CompanyRegistrationForm 
                onRegistrationSuccess={() => {
                  setIsAuthenticated(true);
                  setActiveSection("trabajos");
                }}
              />
            </div>
          )}
          
          {activeSection === "perfil" && (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="text-center space-y-2">
                <h1 className="text-primary">Mi Perfil</h1>
                <p className="text-muted-foreground">
                  Administra tu información personal y configuración
                </p>
              </div>
              <ProfileSection />
            </div>
          )}

          {activeSection === "login" && (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="text-center space-y-2">
                <h1 className="text-primary">Bienvenido a Talento-Hub</h1>
                <p className="text-muted-foreground">Inicia sesión para continuar</p>
              </div>
              <LoginForm
                onSwitchToRegister={() => setActiveSection("registro")}
                onSwitchToRecover={() => setActiveSection("recover")}
                onLoginSuccess={() => {
                  setIsAuthenticated(true);
                  setActiveSection("trabajos");
                }}
              />
            </div>
          )}

          {activeSection === "recover" && (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="text-center space-y-2">
                <h1 className="text-primary">Recuperar Contraseña</h1>
                <p className="text-muted-foreground">Ingresa tu correo para recuperar tu contraseña</p>
              </div>
              <PasswordRecover onBack={() => setActiveSection('login')} />
            </div>
          )}

          {activeSection === "registro" && (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="text-center space-y-2">
                <h1 className="text-primary">Registro</h1>
                <p className="text-muted-foreground">
                  Crea una cuenta como candidato o empresa
                </p>
              </div>
              <RegisterForm
                onSwitchToLogin={() => setActiveSection("login")}
                onRegisterSuccess={() => {
                  setIsAuthenticated(true);
                  setActiveSection("trabajos");
                }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
