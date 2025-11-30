import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

// Schema de validación para candidatos
const candidateSchema = z.object({
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(30, "El nombre de usuario no puede exceder 30 caracteres")
    .optional(),
  first_name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  last_name: z
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

type CandidateFormData = z.infer<typeof candidateSchema>;

interface RegisterFormProps {
  onRegisterSuccess?: (email: string, type: "candidate") => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onRegisterSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const candidateForm = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
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
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password
      });
      toast.success("Registro completado. Revisa tu correo para confirmar tu cuenta.");
      if (onRegisterSuccess) {
        onRegisterSuccess(data.email, "candidate");
      }
    } catch (error: any) {
      console.error("Error de registro de candidato:", error);
      const backendData = error?.response?.data;

      // Intentar detectar mensaje específico de correo ya registrado
      const emailInUseMessage =
        backendData?.email?.[0] && typeof backendData.email[0] === "string"
          ? backendData.email[0]
          : null;

      if (emailInUseMessage === "El correo ya está en uso") {
        const message = "El correo ya está en uso. Intenta iniciar sesión o usa otro correo.";
        setSubmitError(message);
        toast.error(message);
      } else {
        const fallbackMessage =
          backendData?.detail ||
          "Error al registrar candidato. Por favor, verifica los datos e intenta de nuevo.";
        setSubmitError(fallbackMessage);
        toast.error(fallbackMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-xs sm:max-w-sm">
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
        <form onSubmit={candidateForm.handleSubmit(onSubmitCandidate)} className="space-y-4">
              {/* Nombres */}
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombres</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="Juan Diego"
                    className="pl-10"
                    {...candidateForm.register("first_name")}
                  />
                </div>
                {candidateForm.formState.errors.first_name && (
                  <p className="text-sm text-destructive">
                    {candidateForm.formState.errors.first_name.message}
                  </p>)}
                <Label htmlFor="last_name">Apellidos</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Pérez Urriaga"
                    className="pl-10"
                    {...candidateForm.register("last_name")}
                  />
                </div>
                {candidateForm.formState.errors.last_name && (
                  <p className="text-sm text-destructive">
                    {candidateForm.formState.errors.last_name.message}
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
                {!candidateForm.formState.errors.email && submitError?.includes("correo ya está en uso") && (
                  <div className="mt-1 flex items-start gap-2 rounded-md border border-border/60 bg-secondary/40 px-3 py-2 text-xs text-primary">
                    <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-primary" />
                    <span>Este correo ya está registrado. Prueba con otro o inicia sesión.</span>
                  </div>
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

              {/* submitError solo toast, Alert removido */}

              <Button type="submit" className="w-full cursor-pointer" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Registrarme"}
              </Button>
            </form>

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
    </div>
  );
}
