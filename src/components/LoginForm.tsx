import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { LogIn, Mail, Lock } from "lucide-react";

// Schema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Debe ser un correo electrónico válido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLoginSuccess?: (email: string) => void;
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onLoginSuccess, onSwitchToRegister }: LoginFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Por ahora, acepta cualquier login (sin validación real)
      console.log("Login exitoso:", data);
      
      if (onLoginSuccess) {
        onLoginSuccess(data.email);
      }
    } catch (error) {
      setSubmitError("Error al iniciar sesión. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <LogIn className="w-6 h-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">
          Ingresa tus credenciales para acceder a Talento-Hub
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* Error de envío */}
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Botón de submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>

          {/* Link para registrarse */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">¿No tienes una cuenta? </span>
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary hover:underline"
            >
              Regístrate aquí
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
