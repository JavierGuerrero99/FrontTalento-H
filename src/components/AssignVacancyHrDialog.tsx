import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { assignVacancyHr } from "../services/api";
import { toast } from "react-hot-toast";

interface AssignVacancyHrDialogProps {
  open: boolean;
  vacancy: { id: number; titulo?: string } | null;
  onClose: () => void;
  onAssigned?: (message: string) => Promise<void> | void;
}
export function AssignVacancyHrDialog({
  open,
  vacancy,
  onClose,
  onAssigned,
}: AssignVacancyHrDialogProps) {
  const [email, setEmail] = useState("");
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail("");
      setAssignError(null);
      setAssigning(false);
    } else {
      setAssignError(null);
    }
  }, [open]);

  const handleAssign = async () => {
    const trimmedEmail = email.trim();
    if (!vacancy) {
      setAssignError("No hay una vacante seleccionada");
      return;
    }
    if (!trimmedEmail) {
      setAssignError("Ingresa el correo de la persona de RRHH");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setAssignError("Ingresa un correo válido");
      return;
    }

    setAssignError(null);
    setAssigning(true);
    try {
      await assignVacancyHr(vacancy.id, trimmedEmail);
      const successMessage = "Responsable de RRHH asignado correctamente";
      toast.success(successMessage);
      if (onAssigned) {
        await onAssigned(successMessage);
      }
      onClose();
    } catch (error: any) {
      const backendMessage = error?.response?.data;
      if (backendMessage?.detail) {
        setAssignError(String(backendMessage.detail));
      } else if (backendMessage?.error) {
        setAssignError(String(backendMessage.error));
      } else if (backendMessage?.message) {
        setAssignError(String(backendMessage.message));
      } else {
        setAssignError("No se pudo asignar el usuario. Intenta nuevamente");
      }
      const errorMessage =
        backendMessage?.detail ||
        backendMessage?.error ||
        backendMessage?.message ||
        "No se pudo asignar el usuario. Intenta nuevamente";
      if (typeof errorMessage === "string") {
        toast.error(errorMessage);
      }
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen: boolean) => !nextOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar RRHH</DialogTitle>
          <DialogDescription>
            {vacancy
              ? `Ingresa el correo de la persona de recursos humanos que gestionará la vacante "${vacancy.titulo || `ID ${vacancy.id}`}".`
              : "Ingresa el correo de la persona de recursos humanos para esta vacante."}
          </DialogDescription>
        </DialogHeader>

        {/* assignError solo toast, Alert removido */}

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="assign-hr-email">
              Correo electrónico de RRHH
            </label>
            <Input
              id="assign-hr-email"
              type="email"
              placeholder="nombre@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={assigning}
            />
            <p className="text-xs text-muted-foreground">
              El correo debe pertenecer a un usuario con permisos de recursos humanos.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={assigning}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={assigning}>
            {assigning ? "Asignando..." : "Asignar RRHH"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
