import { useCallback, useEffect, useMemo, useState } from "react";
import { Navbar } from "./components/Navbar";
import { CompanyRegistrationForm } from "./components/CompanyRegistrationForm";
import { RegisterForm } from "./components/RegisterForm";
import { LoginForm } from "./components/LoginForm";
import { PasswordRecover } from "./components/PasswordRecover";
import { ProfileSection } from "./components/ProfileSection";
import { JobListings } from "./components/JobListings";
import { CompanyCard } from "./components/CompanyCard";
import { CompanyList } from "./components/CompanyList";
import { CompaniesList } from "./components/CompaniesList";
import { CreateVacancyForm } from "./components/CreateVacancyForm";
import { VacancyDetail } from "./components/VacancyDetail";
import { VacancyApplications } from "./components/VacancyApplications";
import { VacancyApplicationDetail } from "./components/VacancyApplicationDetail";
import { VacantesEmpresa } from "./components/VacantesEmpresa";
import { CompanyEmployees } from "./components/CompanyEmployees";
import { Toaster } from "react-hot-toast";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { MyVacancies } from "./components/MyVacancies";
import { getProfile } from "./services/api";
import { BackButton } from "./components/BackButton";
export default function App() {

  // Restaurar estado a partir del token en localStorage para mantener sesión al recargar
  const initialNavigationState = useMemo(() => {
    if (typeof window === "undefined") {
      return { isAuthenticated: false, section: "login" as const };
    }
    try {
      const hasToken = !!localStorage.getItem("access_token");
      return { isAuthenticated: hasToken, section: hasToken ? "trabajos" : "login" };
    } catch {
      return { isAuthenticated: false, section: "login" as const };
    }
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialNavigationState.isAuthenticated);
  const [activeSection, setActiveSection] = useState<string>(initialNavigationState.section);
  const [navigationStack, setNavigationStack] = useState<string[]>([initialNavigationState.section]);
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = useState(false);
  const [companySearchTerm, setCompanySearchTerm] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFetched, setProfileFetched] = useState(false);

  const handleNavigate = useCallback(
    (section: string, options: { replace?: boolean; reset?: boolean } = {}) => {
      setActiveSection(section);
      setNavigationStack((prev) => {
        if (options.reset) {
          return [section];
        }

        if (prev.length === 0) {
          return [section];
        }

        if (options.replace) {
          const next = [...prev];
          next[next.length - 1] = section;
          return next;
        }

        const last = prev[prev.length - 1];
        if (last === section) {
          return prev;
        }

        return [...prev, section];
      });
    },
    []
  );

  const goBack = useCallback(() => {
    let didGoBack = false;
    setNavigationStack((prev) => {
      if (prev.length <= 1) {
        return prev;
      }

      const next = prev.slice(0, -1);
      const target = next[next.length - 1];
      setActiveSection(target);
      didGoBack = true;
      return next;
    });
    return didGoBack;
  }, []);

  const canGoBack = navigationStack.length > 1;

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    handleNavigate("login", { reset: true });
    try {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } catch {}
  }, [handleNavigate]);

  const goBackOrNavigate = useCallback(
    (fallbackSection: string) => {
      const didGoBack = goBack();
      if (!didGoBack) {
        handleNavigate(fallbackSection, { replace: true });
      }
    },
    [goBack, handleNavigate]
  );

  // Detectar si estamos en la URL de reset de contraseña enviada por correo
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const resetMatch = pathname.match(/^\/reset-password\/([^/]+)\/([^/]+)\/?$/);
  const resetUid = resetMatch?.[1] || null;
  const resetToken = resetMatch?.[2] || null;

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated) {
      setUserRole(null);
      setUserId(null);
      setUserEmail(null);
      setProfileFetched(false);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    setProfileFetched(false);

    getProfile()
      .then((profile) => {
        if (cancelled) return;
        const rawRole =
          profile?.role ||
          profile?.rol ||
          profile?.user_role ||
          (Array.isArray(profile?.groups) && profile.groups.length > 0 ? profile.groups[0] : null);
        const normalizedRole = rawRole ? String(rawRole).toLowerCase() : null;
        setUserRole(normalizedRole);
        const derivedId =
          typeof profile?.id === "number"
            ? profile.id
            : typeof profile?.user?.id === "number"
            ? profile.user.id
            : null;
        const derivedEmail =
          profile?.email ||
          profile?.correo ||
          profile?.user?.email ||
          profile?.user?.correo ||
          null;
        setUserId(derivedId);
        setUserEmail(derivedEmail ? String(derivedEmail) : null);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error al obtener el perfil del usuario", error);
        setUserRole(null);
        setUserId(null);
        setUserEmail(null);
      })
      .finally(() => {
        if (cancelled) return;
        setProfileLoading(false);
        setProfileFetched(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const normalizedRole = useMemo(() => userRole?.toLowerCase() ?? null, [userRole]);
  const isRRHH = normalizedRole === "rrhh";

  useEffect(() => {
    if (!isAuthenticated) return;
    if (isRRHH && (activeSection === "empresas" || activeSection === "mis-empresas")) {
      handleNavigate("mis-vacantes", { replace: true });
    }
  }, [isAuthenticated, isRRHH, activeSection, handleNavigate]);

  const hideNavbarSections = ["login", "recover", "registro"];
  const shouldShowNavbar = !hideNavbarSections.includes(activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "border border-border/60 bg-background/95 backdrop-blur text-foreground shadow-lg",
          duration: 4000,
          style: {
            fontFamily: "inherit",
          },
        }}
      />
      {shouldShowNavbar && (
        <Navbar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          userRole={userRole}
        />
      )}
      
      <main className="py-8 px-4">
        <div className="flex flex-col items-center gap-6">
          <div className="w-full max-w-7xl flex justify-start">
            <BackButton onClick={() => goBack()} disabled={!canGoBack} />
          </div>
          {resetUid && resetToken ? (
            <div className="w-full flex flex-col items-center gap-6">
              <ResetPasswordForm
                uid={resetUid}
                token={resetToken}
                onGoToLogin={() => {
                  handleNavigate("login", { reset: true, replace: true });
                  if (typeof window !== "undefined") {
                    window.history.pushState({}, "", "/");
                  }
                }}
              />
            </div>
          ) : (
            <>
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

          {activeSection === "mis-empresas" && !isRRHH && (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="text-center space-y-2">
                <h1 className="text-primary">Mis Empresas</h1>
                <p className="text-muted-foreground">
                  Gestiona todas tus empresas registradas
                </p>
              </div>
              <div className="w-full max-w-6xl">
                <CompanyList
                  onSelectCompany={(id) => handleNavigate(`empresa-${id}`)}
                />
              </div>
            </div>
          )}

          {activeSection.startsWith("empresa-") && (() => {
            const parts = activeSection.split("-");
            const id = Number(parts[1]);
            if (activeSection.endsWith("crear-vacante")) {
              return (
                <div className="w-full flex flex-col items-center gap-6">
                  <div className="text-center space-y-2">
                    <h1 className="text-primary">Crear Vacante</h1>
                    <p className="text-muted-foreground">Completa los datos de la vacante para la empresa seleccionada</p>
                  </div>
                  <CreateVacancyForm
                    companyId={id}
                    onCreated={() => handleNavigate(`empresa-${id}-vacantes`)}
                    onNavigate={handleNavigate}
                  />
                </div>
              );
            }
            if (activeSection.endsWith("vacantes")) {
              return (
                <div className="w-full flex flex-col items-center gap-6">
                  <div className="text-center space-y-2">
                    <h1 className="text-primary">Vacantes de la Empresa</h1>
                  </div>
                  <VacantesEmpresa empresaId={id} />
                </div>
              );
            }
            if (activeSection.endsWith("empleados")) {
              return (
                <div className="w-full flex flex-col items-center gap-6">
                  <div className="text-center space-y-2">
                    <h1 className="text-primary">Empleados de la Empresa</h1>
                  </div>
                  <div className="w-full max-w-5xl">
                    <CompanyEmployees
                      companyId={id}
                      onBack={() => goBackOrNavigate(`empresa-${id}`)}
                    />
                  </div>
                </div>
              );
            }
            return (
              <div className="w-full flex flex-col items-center gap-6">
                <div className="text-center space-y-2">
                  <h1 className="text-primary">Detalle de Empresa</h1>
                </div>
                <CompanyCard
                  companyId={id}
                  isRRHH={isRRHH}
                  onCreateVacancy={(companyId) => handleNavigate(`empresa-${companyId}-crear-vacante`)}
                  onListVacancies={(companyId) => handleNavigate(`empresa-${companyId}-vacantes`)}
                  onListEmployees={(companyId) => handleNavigate(`empresa-${companyId}-empleados`)}
                />
              </div>
            );
          })()}

          {activeSection === "empresas" && !isRRHH && (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="text-center space-y-2">
                <h1 className="text-primary">Empresas</h1>
                <p className="text-muted-foreground">
                  Consulta y registra empresas en Talento-Hub
                </p>
              </div>
              <div className="w-full max-w-4xl space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Buscador empresas */}
                  <div className="w-full sm:flex-1">
                    <input
                      type="text"
                      placeholder="Buscar por nombre de empresa..."
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      value={companySearchTerm}
                      onChange={(e) => setCompanySearchTerm(e.target.value)}
                    />
                  </div>
                  {/* Botón crear empresa */}
                  <div className="w-full sm:w-auto flex justify-end">
                    <Dialog open={isCreateCompanyOpen} onOpenChange={setIsCreateCompanyOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full sm:w-auto">
                          Crear empresa
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogTitle>Registrar empresa</DialogTitle>
                        <DialogDescription>
                          Completa la información para registrar una nueva empresa.
                        </DialogDescription>
                        <CompanyRegistrationForm />
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <CompaniesList searchTerm={companySearchTerm} />
              </div>
            </div>
          )}

          {activeSection === "mis-vacantes" && isRRHH && (
            <div className="w-full flex flex-col items-center gap-6">
              <div className="text-center space-y-2">
                <h1 className="text-primary">Mis Vacantes</h1>
                <p className="text-muted-foreground">
                  Gestiona las vacantes en las que has sido asignado como responsable.
                </p>
              </div>
              <div className="w-full max-w-6xl">
                {profileLoading && (
                  <div className="w-full flex justify-center py-16 text-muted-foreground">
                    Cargando tu información...
                  </div>
                )}
                {!profileLoading && profileFetched && (
                  <MyVacancies
                    userId={userId}
                    userEmail={userEmail}
                    onViewVacancy={(id) => handleNavigate(`vacante-${id}-postulaciones`)}
                    onBack={() => goBackOrNavigate("trabajos")}
                  />
                )}
              </div>
            </div>
          )}

          {activeSection.startsWith("vacante-") && (() => {
            const match = activeSection.match(/^vacante-(\d+)(?:-(.+))?$/);
            if (!match) return null;
            const id = Number(match[1]);
            if (Number.isNaN(id)) return null;
            const subSection = match[2] ?? null;

            if (subSection === "postulaciones") {
              return (
                <div className="w-full flex flex-col items-center gap-6">
                  <div className="text-center space-y-2">
                    <h1 className="text-primary">Postulaciones de la Vacante</h1>
                    <p className="text-muted-foreground">
                      Revisa y gestiona las personas que se han postulado a esta oportunidad.
                    </p>
                  </div>
                  <div className="w-full max-w-6xl">
                    <VacancyApplications
                      vacancyId={id}
                      onBack={() => goBackOrNavigate("mis-vacantes")}
                      onViewApplication={(slug: string) => handleNavigate(`vacante-${id}-postulacion-${slug}`)}
                    />
                  </div>
                </div>
              );
            }

            if (subSection?.startsWith("postulacion-")) {
              const applicationSlug = subSection.slice("postulacion-".length);
              return (
                <div className="w-full flex flex-col items-center gap-6">
                  <div className="text-center space-y-2">
                    <h1 className="text-primary">Detalle de Postulación</h1>
                    <p className="text-muted-foreground">
                      Revisa la hoja de vida completa y la información de la vacante.
                    </p>
                  </div>
                  <div className="w-full max-w-7xl">
                    <VacancyApplicationDetail
                      vacancyId={id}
                      applicationSlug={applicationSlug}
                      onBack={() => goBackOrNavigate(`vacante-${id}-postulaciones`)}
                    />
                  </div>
                </div>
              );
            }

            return (
              <div className="w-full flex flex-col items-center gap-6">
                <div className="text-center space-y-2">
                  <h1 className="text-primary">Detalle de Vacante</h1>
                </div>
                <VacancyDetail
                  vacancyId={id}
                  onBack={() => goBackOrNavigate(isRRHH ? "mis-vacantes" : "trabajos")}
                />
              </div>
            );
          })()}
          
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
            <div className="w-full flex flex-col items-center justify-center gap-6 min-h-[70vh]">
              <div className="text-center space-y-2">
                <h1 className="text-primary">Bienvenido a Talento-Hub</h1>
                <p className="text-muted-foreground">Inicia sesión para continuar</p>
              </div>
              <LoginForm
                onSwitchToRegister={() => handleNavigate("registro")}
                onSwitchToRecover={() => handleNavigate("recover")}
                onLoginSuccess={() => {
                  setIsAuthenticated(true);
                  try { localStorage.setItem("isAuthenticated", "true"); } catch {}
                  handleNavigate("trabajos", { reset: true });
                }}
              />
            </div>
          )}

          {activeSection === "recover" && (
            <div className="w-full flex flex-col items-center justify-center gap-6 min-h-[70vh]">
              <div className="text-center space-y-2">
                <h1 className="text-primary">Recuperar Contraseña</h1>
                <p className="text-muted-foreground">Ingresa tu correo para recuperar tu contraseña</p>
              </div>
              <PasswordRecover onBack={() => goBackOrNavigate("login")} />
            </div>
          )}

          {activeSection === "registro" && (
            <div className="w-full flex flex-col items-center justify-center gap-6 min-h-[70vh]">
              <div className="text-center space-y-2">
                <h1 className="text-primary">Registro</h1>
                <p className="text-muted-foreground">
                  Crea una cuenta como candidato o empresa
                </p>
              </div>
              <RegisterForm
                onSwitchToLogin={() => handleNavigate("login")}
                onRegisterSuccess={() => {
                  setIsAuthenticated(true);
                  try { localStorage.setItem("isAuthenticated", "true"); } catch {}
                  handleNavigate("trabajos", { reset: true });
                }}
              />
            </div>
          )}
          </>
          )}
        </div>
      </main>
    </div>
  );
}
