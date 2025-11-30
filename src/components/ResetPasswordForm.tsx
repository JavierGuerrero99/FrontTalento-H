import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Lock } from "lucide-react";
import api from "../services/api";
import { toast } from "react-hot-toast";

const resetSchema = z
  .object({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

interface ResetPasswordFormProps {
  uid: string;
  token: string;
  onGoToLogin?: () => void;
}

export function ResetPasswordForm({ uid, token, onGoToLogin }: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post(`/auth/password-reset-confirm/${uid}/${token}/`, {
        password: data.password,
      });
      const successMessage = "Contraseña restablecida correctamente. Ya puedes iniciar sesión.";
      setSuccess(successMessage);
      toast.success(successMessage);
    } catch (err: any) {
      console.error("Error en confirmación de contraseña", err?.response || err);
      const detail = err?.response?.data?.detail || err?.response?.data?.error;
      const errorMessage =
        typeof detail === "string"
          ? detail
          : "No se pudo restablecer la contraseña. El enlace puede ser inválido o haber expirado.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-xs sm:max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">Restablecer contraseña</CardTitle>
          <CardDescription className="text-center">
            Ingresa tu nueva contraseña para completar el proceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* error y success solo toast, Alert removido */}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
            </Button>

            {onGoToLogin && (
              <div className="text-center text-sm mt-2">
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={onGoToLogin}
                >
                  Volver al inicio de sesión
                </button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
