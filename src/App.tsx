import { useState } from "react";
import { Navbar } from "./components/Navbar";
import { CompanyRegistrationForm } from "./components/CompanyRegistrationForm";
import { ProfileSection } from "./components/ProfileSection";
import { JobListings } from "./components/JobListings";

export default function App() {
  const [activeSection, setActiveSection] = useState("trabajos");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar activeSection={activeSection} onNavigate={setActiveSection} />
      
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
              <CompanyRegistrationForm />
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
        </div>
      </main>
    </div>
  );
}
