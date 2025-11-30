import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Mail } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import api from "../services/api";
import { toast } from "react-hot-toast";

const recoverSchema = z.object({
  email: z.string().min(1, "El correo es obligatorio").email("Correo inválido"),
});

type RecoverFormData = z.infer<typeof recoverSchema>;

export function PasswordRecover({ onBack }: { onBack?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RecoverFormData>({
    resolver: zodResolver(recoverSchema),
  });

  const onSubmit = async (data: RecoverFormData) => {
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      await api.post("/auth/password-reset/", { email: data.email });
      const successMessage = "Si existe una cuenta con ese correo, recibirás instrucciones para restablecer la contraseña.";
      setMessage(successMessage);
      toast.success(successMessage);
    } catch (err: any) {
      console.error("Error en recuperación de contraseña", err?.response || err);
      const detail = err?.response?.data?.detail || err?.response?.data?.error;
      const errorMessage =
        typeof detail === "string"
          ? detail
          : "Error al solicitar recuperación. Intenta nuevamente.";
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
        <CardTitle className="text-center">Recuperar Contraseña</CardTitle>
        <CardDescription className="text-center">Ingresa tu correo para recibir instrucciones</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Error y mensaje solo toast, Alert removido */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="tu@email.com" className="pl-10" {...register('email')} />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
          </Button>

          <div className="text-center text-sm">
            <button type="button" className="text-primary hover:underline" onClick={onBack}>Volver al login</button>
          </div>
        </form>
      </CardContent>
      </Card>
    </div>
  );
}
