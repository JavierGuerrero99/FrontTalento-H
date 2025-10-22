import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";

// Esquema de validación
const competenciaSchema = z.object({
  nombre: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres"),
  descripcion: z
    .string()
    .min(5, "La descripción debe tener al menos 5 caracteres")
    .max(300, "La descripción no puede exceder 300 caracteres"),
});

type CompetenciaFormData = z.infer<typeof competenciaSchema>;

export function CompetenciaForm({ onClose }: { onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompetenciaFormData>({
    resolver: zodResolver(competenciaSchema),
  });

  const onSubmit = async (data: CompetenciaFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:8000/api/competencias/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al registrar la competencia");
      }

      alert("Competencia creada exitosamente ✅");
      reset();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al registrar la competencia ❌");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-background shadow-xl">
        <CardHeader>
          <CardTitle>Crear Competencia</CardTitle>
          <CardDescription>
            Registra una nueva competencia para las vacantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                {...register("nombre")}
                placeholder="Ej: Comunicación efectiva"
                className={errors.nombre ? "border-destructive" : ""}
              />
              {errors.nombre && (
                <p className="text-destructive text-sm">
                  {errors.nombre.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                {...register("descripcion")}
                placeholder="Ej: Habilidad para expresarse claramente"
                className={errors.descripcion ? "border-destructive" : ""}
              />
              {errors.descripcion && (
                <p className="text-destructive text-sm">
                  {errors.descripcion.message}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
