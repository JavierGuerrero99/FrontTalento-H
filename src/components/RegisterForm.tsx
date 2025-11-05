import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { UserPlus, Mail, Lock, User, Building2 } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// Schema de validación para candidatos
const candidateSchema = z.object({
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(30, "El nombre de usuario no puede exceder 30 caracteres")
    .optional(),
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  lastName: z
    .string()
    .min(3, "El apellido debe tener al menos 3 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres"),
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Debe ser un correo electrónico válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(50, "La contraseña no puede exceder 50 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

// Schema de validación para empresas
const companySchema = z.object({
  companyName: z
    .string()
    .min(3, "El nombre de la empresa debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  nit: z
    .string()
    .min(9, "El NIT debe tener al menos 9 dígitos")
    .regex(/^[0-9-]+$/, "El NIT solo puede contener números y guiones"),
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Debe ser un correo electrónico válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(50, "La contraseña no puede exceder 50 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type CandidateFormData = z.infer<typeof candidateSchema>;
type CompanyFormData = z.infer<typeof companySchema>;

interface RegisterFormProps {
  onRegisterSuccess?: (email: string, type: "candidate" | "company") => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"candidate" | "company">("candidate");

  const candidateForm = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
  });

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const onSubmitCandidate = async (data: CandidateFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log("Registro de candidato con datos:", data);
      const auth = await import("../services/auth").then(m => m.default);
      // Enviar datos al backend
      await auth.registerCandidate({
        username: data.username ?? data.email.split("@")[0],
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        password: data.password
      });
      if (onRegisterSuccess) {
        onRegisterSuccess(data.email, "candidate");
      }
    } catch (error: any) {
      console.error("Error de registro de candidato:", error);
      setSubmitError(
        error.response?.data?.detail ||
        "Error al registrar candidato. Por favor, verifica los datos e intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitCompany = async (data: CompanyFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const auth = await import("../services/auth").then(m => m.default);
      
      // Enviar datos al backend
      await auth.registerCompany({
        companyName: data.companyName,
        nit: data.nit,
        email: data.email,
        password: data.password
      });
      
      console.log("Registro de empresa exitoso:", data.email);
      
      // Intentar hacer login automáticamente después del registro
      await auth.login(data.email, data.password);
      
      if (onRegisterSuccess) {
        onRegisterSuccess(data.email, "company");
      }
    } catch (error: any) {
      console.error("Error de registro:", error);
      setSubmitError(
        error.response?.data?.detail || 
        "Error al registrar. Por favor, verifica los datos e intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-center">Crear Cuenta</CardTitle>
        <CardDescription className="text-center">
          Regístrate como candidato o empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
  <Tabs value={activeTab} onValueChange={(v: string) => setActiveTab(v as "candidate" | "company") }>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="candidate" className="gap-2">
              <User className="w-4 h-4" />
              Candidato
            </TabsTrigger>
            <TabsTrigger value="company" className="gap-2">
              <Building2 className="w-4 h-4" />
              Empresa
            </TabsTrigger>
          </TabsList>

          {/* Formulario para Candidatos */}
          <TabsContent value="candidate">
            <form onSubmit={candidateForm.handleSubmit(onSubmitCandidate)} className="space-y-4">
              {/* Nombres */}
              <div className="space-y-2">
                <Label htmlFor="name">Nombres</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Juan Diego"
                    className="pl-10"
                    {...candidateForm.register("name")}
                  />
                </div>
                {candidateForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {candidateForm.formState.errors.name.message}
                  </p>)}
                <Label htmlFor="lastName">Apellidos</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Pérez Urriaga"
                    className="pl-10"
                    {...candidateForm.register("lastName")}
                  />
                </div>
                {candidateForm.formState.errors.lastName && (
                  <p className="text-sm text-destructive">
                    {candidateForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="candidate-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="candidate-email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    {...candidateForm.register("email")}
                  />
                </div>
                {candidateForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {candidateForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="candidate-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="candidate-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...candidateForm.register("password")}
                  />
                </div>
                {candidateForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {candidateForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="candidate-confirm-password">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="candidate-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...candidateForm.register("confirmPassword")}
                  />
                </div>
                {candidateForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {candidateForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrarme"}
              </Button>
            </form>
          </TabsContent>

          {/* Formulario para Empresas */}
          <TabsContent value="company">
            <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-4">
              {/* Nombre de la empresa */}
              <div className="space-y-2">
                <Label htmlFor="company-name">Nombre de la Empresa</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company-name"
                    type="text"
                    placeholder="Mi Empresa S.A.S"
                    className="pl-10"
                    {...companyForm.register("companyName")}
                  />
                </div>
                {companyForm.formState.errors.companyName && (
                  <p className="text-sm text-destructive">
                    {companyForm.formState.errors.companyName.message}
                  </p>
                )}
              </div>

              {/* NIT */}
              <div className="space-y-2">
                <Label htmlFor="nit">NIT</Label>
                <Input
                  id="nit"
                  type="text"
                  placeholder="900123456-7"
                  {...companyForm.register("nit")}
                />
                {companyForm.formState.errors.nit && (
                  <p className="text-sm text-destructive">
                    {companyForm.formState.errors.nit.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="company-email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company-email"
                    type="email"
                    placeholder="empresa@email.com"
                    className="pl-10"
                    {...companyForm.register("email")}
                  />
                </div>
                {companyForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {companyForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="company-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...companyForm.register("password")}
                  />
                </div>
                {companyForm.formState.errors.password && (
                  <p className="text-sm text-destructive">
                    {companyForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-2">
                <Label htmlFor="company-confirm-password">Confirmar Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="company-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...companyForm.register("confirmPassword")}
                  />
                </div>
                {companyForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {companyForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrarse como Empresa"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Link para ir al login */}
        <div className="text-center text-sm mt-4">
          <span className="text-muted-foreground">¿Ya tienes una cuenta? </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:underline"
          >
            Inicia sesión aquí
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
