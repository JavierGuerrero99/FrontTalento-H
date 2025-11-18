import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { listUsers, assignUserRole } from "../services/api";

interface AssignEmployeesDialogProps {
  open: boolean;
  companyId: number | null;
  onOpenChange: (open: boolean) => void;
}

interface UserSummary {
  id: number;
  email?: string;
  username?: string;
  nombres?: string;
  apellidos?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

const formatUserName = (user: UserSummary) => {
  const name =
    user.nombres ||
    user.first_name ||
    user.username ||
    user.email ||
    `Usuario ${user.id}`;
  const lastName = user.apellidos || user.last_name;
  return lastName ? `${name} ${lastName}` : name;
};

export function AssignEmployeesDialog({ open, companyId, onOpenChange }: AssignEmployeesDialogProps) {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [filter, setFilter] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState("rrhh");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !companyId) {
      return;
    }
    let active = true;
    setLoadingUsers(true);
    setFetchError(null);
    listUsers()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data)) {
          setUsers(data as UserSummary[]);
        } else if (Array.isArray(data?.results)) {
          setUsers(data.results as UserSummary[]);
        } else {
          setUsers([]);
        }
      })
      .catch(() => {
        if (!active) return;
        setFetchError("No se pudieron cargar los usuarios disponibles");
      })
      .finally(() => {
        if (active) setLoadingUsers(false);
      });

    return () => {
      active = false;
    };
  }, [open, companyId]);

  useEffect(() => {
    if (!open) {
      setFilter("");
      setSelectedUserId(null);
      setSelectedRole("rrhh");
      setAssignError(null);
      setSuccessMessage(null);
    }
  }, [open]);

  const trimmedFilter = filter.trim();
  const hasSearchTerm = trimmedFilter.length >= 2;

  const filteredUsers = useMemo(() => {
    if (!hasSearchTerm) return [];
    const term = trimmedFilter.toLowerCase();
    return users.filter((user) => {
      const values = [
        user.email,
        user.username,
        user.nombres,
        user.apellidos,
        user.first_name,
        user.last_name,
      ]
        .filter(Boolean)
        .map((val) => String(val).toLowerCase());
      return values.some((val) => val.includes(term));
    });
  }, [hasSearchTerm, trimmedFilter, users]);

  const handleAssign = async () => {
    if (!companyId || !selectedUserId) {
      setAssignError("Selecciona un usuario a asignar");
      return;
    }
    setAssignError(null);
    setSuccessMessage(null);
    setAssigning(true);
    try {
      await assignUserRole(selectedUserId, {
        role: selectedRole,
        id_empresa: companyId,
      });
      setSuccessMessage("Usuario asignado correctamente a la empresa");
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUserId ? { ...user, role: selectedRole } : user,
        ),
      );
    } catch (error: any) {
      const backendMessage = error?.response?.data;
      if (backendMessage?.detail) {
        setAssignError(String(backendMessage.detail));
      } else if (backendMessage?.role) {
        setAssignError(Array.isArray(backendMessage.role) ? backendMessage.role.join(" ") : String(backendMessage.role));
      } else {
        setAssignError("No se pudo asignar el usuario. Intenta nuevamente");
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setFilter("");
      setSelectedUserId(null);
      setSelectedRole("rrhh");
      setAssignError(null);
      setSuccessMessage(null);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar empleados a la empresa</DialogTitle>
          <DialogDescription>
            Selecciona un usuario y define el rol que tendrá dentro de la empresa.
          </DialogDescription>
        </DialogHeader>

        {!companyId ? (
          <p className="text-sm text-muted-foreground">
            Selecciona una empresa para iniciar la asignación.
          </p>
        ) : (
          <div className="space-y-4">
            {fetchError && (
              <Alert variant="destructive">
                <AlertDescription>{fetchError}</AlertDescription>
              </Alert>
            )}

            {successMessage && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {assignError && (
              <Alert variant="destructive">
                <AlertDescription>{assignError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="assign-search">
                Buscar usuario
              </label>
              <Input
                id="assign-search"
                placeholder="Filtra por nombre o correo"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                disabled={loadingUsers}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Selecciona un usuario</p>
              <div className="border rounded-md">
                <ScrollArea className="h-48">
                  <div className="p-2 space-y-2">
                    {loadingUsers ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Cargando usuarios...
                      </p>
                    ) : !hasSearchTerm ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Escribe al menos 2 caracteres para buscar usuarios.
                      </p>
                    ) : filteredUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        No se encontraron usuarios con ese criterio.
                      </p>
                    ) : (
                      filteredUsers.map((user) => {
                        const isSelected = user.id === selectedUserId;
                        return (
                          <Button
                            key={user.id}
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className="w-full justify-between"
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            <span className="flex flex-col items-start">
                              <span className="font-medium leading-none">
                                {formatUserName(user)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {user.email || user.username || `ID ${user.id}`}
                              </span>
                            </span>
                            {user.role && (
                              <Badge variant="secondary" className="ml-2 capitalize">
                                {user.role}
                              </Badge>
                            )}
                          </Button>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rol a asignar</label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rrhh">RRHH</SelectItem>
                  <SelectItem value="candidato">Candidato</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => handleClose(false)} disabled={assigning}>
                Cancelar
              </Button>
              <Button
                onClick={handleAssign}
                disabled={assigning || !selectedUserId}
              >
                {assigning ? "Asignando..." : "Asignar usuario"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
