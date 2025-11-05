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
      // Aquí llamarías al endpoint backend para envío de email de recuperación
      // Ejemplo: await api.post('/auth/password/reset/', { email: data.email });
      await new Promise((r) => setTimeout(r, 1000));
      setMessage('Si existe una cuenta con ese correo, recibirás instrucciones para reestablecer la contraseña.');
    } catch (err: any) {
      setError('Error al solicitar recuperación. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center">Recuperar Contraseña</CardTitle>
        <CardDescription className="text-center">Ingresa tu correo para recibir instrucciones</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

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
  );
}
