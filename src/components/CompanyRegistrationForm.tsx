import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Upload } from "lucide-react";
import talentoHubLogo from "figma:asset/052c6a78ca3319cbddd4ec6681d537029ae56218.png";

// Schema de validación con campos obligatorios
const companySchema = z.object({
  nombre: z
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
  direccion: z
    .string()
    .min(1, "La dirección es obligatoria")
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede exceder 200 caracteres"),
  logo: z.any().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export function CompanyRegistrationForm() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

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
    // Simulación de envío de datos
    console.log("Datos de la empresa:", {
      ...data,
      logo: logoFile,
    });

    // Aquí se conectaría con el backend para guardar los datos
    await new Promise((resolve) => setTimeout(resolve, 1000));

    alert("¡Empresa registrada exitosamente!");
    reset();
    setLogoPreview(null);
    setLogoFile(null);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <img 
            src={talentoHubLogo} 
            alt="Talento-Hub Logo" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <CardTitle>Registro de Empresa</CardTitle>
            <CardDescription className="mt-1">
              Complete los datos de su empresa para registrarse en Talento-Hub
              <br />
              <span className="text-destructive">*</span> Campos obligatorios
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Campo Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre de la Empresa <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nombre"
              {...register("nombre")}
              placeholder="Ej: Tecnología Innovadora S.A.S"
              className={errors.nombre ? "border-destructive" : ""}
              required
            />
            {errors.nombre && (
              <p className="text-destructive text-sm">{errors.nombre.message}</p>
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
              required
            />
            {errors.nit && (
              <p className="text-destructive text-sm">{errors.nit.message}</p>
            )}
          </div>

          {/* Campo Dirección */}
          <div className="space-y-2">
            <Label htmlFor="direccion">
              Dirección <span className="text-destructive">*</span>
            </Label>
            <Input
              id="direccion"
              {...register("direccion")}
              placeholder="Ej: Calle 123 #45-67, Bogotá"
              className={errors.direccion ? "border-destructive" : ""}
              required
            />
            {errors.direccion && (
              <p className="text-destructive text-sm">{errors.direccion.message}</p>
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

          {/* Botón de Envío */}
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
