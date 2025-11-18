import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import axios from "axios";
import { getAuthHeaders } from "../services/auth";

// Schema de validación
const companySchema = z.object({
  companyName: z
    .string()
    .min(2, "El nombre de la empresa es obligatorio")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  nit: z
    .string()
    .min(5, "El NIT debe tener al menos 5 caracteres")
    .max(20, "El NIT no puede exceder 20 caracteres")
    .regex(/^[0-9-]+$/, "El NIT solo puede contener números y guiones"),
  address: z
    .string()
    .min(4, "La dirección es obligatoria")
    .max(120, "La dirección no puede exceder 120 caracteres"),
  description: z
    .string()
    .min(10, "La descripción es obligatoria")
    .max(1000, "La descripción no puede exceder 1000 caracteres"),
  logo: z.any().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

export function CompanyRegistrationForm() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      nit: "",
      address: "",
      description: "",
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append("nombre", data.companyName);
      formData.append("nit", data.nit);
      formData.append("direccion", data.address);
      formData.append("descripcion", data.description);

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      await axios.post("http://localhost:8000/api/empresas/", formData, {
        headers: {
          ...(await getAuthHeaders()),
          "Content-Type": "multipart/form-data",
        },
      });

      reset();
      setLogoPreview(null);
      setLogoFile(null);
      setSuccess("Empresa registrada correctamente");
    } catch (err) {
      console.error(err);
      setError("Error al registrar la empresa. Intenta de nuevo.");
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div>
          <CardTitle>Registro de Empresa</CardTitle>
          <CardDescription className="mt-1">
            Complete los datos de su empresa
            <br />
            <span className="text-destructive">*</span> Campos obligatorios
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nombre */}
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

          {/* NIT */}
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

          {/* Dirección */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Dirección <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Ej: Calle 123 #45-67"
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && (
              <p className="text-destructive text-sm">{errors.address.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Descripción <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe brevemente a qué se dedica la empresa, su misión y principales servicios."
              className={errors.description ? "border-destructive" : ""}
              rows={4}
            />
            {errors.description && (
              <p className="text-destructive text-sm">{errors.description.message}</p>
            )}
          </div>

          {/* Logo */}
          <div className="space-y-2">
            <Label htmlFor="logo">Logo de la Empresa (opcional)</Label>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <p className="text-muted-foreground text-sm mt-1">
                  Formatos: JPG, PNG, SVG (Máx. 5MB)
                </p>
              </div>

              {logoPreview ? (
                <div className="w-24 h-24 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <img src={logoPreview} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-24 h-24 border-dashed border rounded-lg flex items-center justify-center bg-muted">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
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
