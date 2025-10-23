import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Upload, AlertCircle } from "lucide-react";
import { registerCompany } from "../services/auth";
import { Alert, AlertDescription } from "./ui/alert";

// Schema de validación con campos obligatorios
const companySchema = z.object({
  companyName: z
    .string()
    .min(1, "El nombre de la empresa es obligatorio")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  nit: z
    .string()
    .min(1, "El NIT es obligatorio")
    .min(5, "El NIT debe tener al menos 5 caracteres")
    .max(20, "El NIT no puede exceder 20 caracteres")
    .regex(/^[0-9-]+$/, "El NIT solo puede contener números y guiones"),
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Correo electrónico inválido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  logo: z.any().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

type Props = {
  onRegistrationSuccess?: () => void;
};

export function CompanyRegistrationForm({ onRegistrationSuccess }: Props) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setError(null);
      await registerCompany({
        companyName: data.companyName,
        nit: data.nit,
        email: data.email,
        password: data.password,
      });

      reset();
      setLogoPreview(null);
      setLogoFile(null);
      
      if (onRegistrationSuccess) {
        onRegistrationSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrar la empresa. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div>
          <CardTitle>Registro de Empresa</CardTitle>
          <CardDescription className="mt-1">
            Complete los datos de su empresa para registrarse en Talento-Hub
            <br />
            <span className="text-destructive">*</span> Campos obligatorios
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo Nombre */}
          <div className="space-y-2">
            <Label htmlFor="companyName">
              Nombre de la Empresa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="companyName"
              {...register("companyName")}
              placeholder="Ej: Tecnología Innovadora S.A.S"
              className={errors.companyName ? "border-destructive" : ""}
            />
            {errors.companyName && (
              <p className="text-destructive text-sm">{errors.companyName.message}</p>
            )}
          </div>

          {/* Campo NIT */}
          <div className="space-y-2">
            <Label htmlFor="nit">
              NIT <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nit"
              {...register("nit")}
              placeholder="Ej: 900123456-7"
              className={errors.nit ? "border-destructive" : ""}
            />
            {errors.nit && (
              <p className="text-destructive text-sm">{errors.nit.message}</p>
            )}
          </div>

          {/* Campo Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Correo Electrónico <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="empresa@ejemplo.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Campo Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Contraseña <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Campo Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo">
              Logo de la Empresa <span className="text-muted-foreground text-sm">(opcional)</span>
            </Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Formatos aceptados: JPG, PNG, SVG (Máx. 5MB)
                </p>
              </div>
              {logoPreview && (
                <div className="w-24 h-24 border-2 border-border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <img
                    src={logoPreview}
                    alt="Vista previa del logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              {!logoPreview && (
                <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Registrar Empresa"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setLogoPreview(null);
                setLogoFile(null);
                setError(null);
              }}
            >
              Limpiar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
