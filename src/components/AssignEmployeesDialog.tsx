import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { assignEmployeeToCompany } from "../services/api";

interface AssignEmployeesDialogProps {
  open: boolean;
  companyId: number | null;
  onOpenChange: (open: boolean) => void;
}

export function AssignEmployeesDialog({ open, companyId, onOpenChange }: AssignEmployeesDialogProps) {
  const [email, setEmail] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const helperId = "assign-employee-helper";

  useEffect(() => {
    if (!open) {
      setEmail("");
      setAssignError(null);
      setSuccessMessage(null);
    }
  }, [open]);

  const handleAssign = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!companyId) {
      setAssignError("Selecciona una empresa para asignar el empleado");
      return;
    }

    if (!email.trim()) {
      setAssignError("Ingresa el correo del empleado a asignar");
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setAssignError("Ingresa un correo electrónico válido");
      return;
    }

    setAssignError(null);
    setSuccessMessage(null);
    setAssigning(true);

    try {
      await assignEmployeeToCompany(companyId, normalizedEmail);
      setSuccessMessage("Empleado asignado correctamente a la empresa");
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
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEmail("");
      setAssignError(null);
      setSuccessMessage(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" aria-describedby={helperId}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">Asignar empleados a la empresa</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Ingresa el correo institucional del colaborador para vincularlo a la organización seleccionada.
          </DialogDescription>
        </DialogHeader>

        {!companyId ? (
          <p className="text-sm text-muted-foreground">Selecciona una empresa para iniciar la asignación.</p>
        ) : (
          <form onSubmit={handleAssign} className="space-y-5" noValidate>
            <section className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <h3 className="text-sm font-semibold text-foreground">Detalles del colaborador</h3>
              <p id={helperId} className="mt-1 text-xs text-muted-foreground">
                El usuario debe existir en la plataforma y contar con permisos de RRHH. Recibirás un mensaje inmediato si ocurre algún inconveniente.
              </p>
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="assign-email">
                  Correo electrónico
                </label>
                <Input
                  id="assign-email"
                  type="email"
                  autoComplete="email"
                  placeholder="colaborador@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-describedby={helperId}
                  aria-invalid={assignError ? "true" : "false"}
                  disabled={assigning}
                  className="transition focus-visible:ring-2 focus-visible:ring-primary/40"
                />
              </div>
            </section>

            <div className="space-y-3" aria-live="polite" aria-atomic="true">
              {successMessage && (
                <Alert className="border-green-200 bg-emerald-50 text-emerald-800">
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              {assignError && (
                <Alert variant="destructive" role="alert">
                  <AlertDescription>{assignError}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex flex-col-reverse items-center gap-2 pt-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleClose(false)}
                disabled={assigning}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={assigning || !email.trim()}>
                {assigning ? "Asignando..." : "Asignar"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
