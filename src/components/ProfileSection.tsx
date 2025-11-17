import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User, Mail, Upload } from "lucide-react";
import { getProfile, updateProfile } from "../services/api";

export function ProfileSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    id: 0,
    username: "",
    nombres: "",
    apellidos: "",
    email: "",
    avatar_url: "",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getProfile();
        if (!mounted) return;
        setProfile({
          id: data.id,
          username: data.username || "",
          nombres: data.nombres || data.first_name || data.primer_nombre || data.nombre || "",
          apellidos: data.apellidos || data.last_name || data.segundo_nombre || "",
          email: data.email || "",
          avatar_url: data.avatar_url || "",
        });
        setError(null);
      } catch (e) {
        setError("No se pudo cargar el perfil");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (field: keyof typeof profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        first_name: profile.nombres.trim(),
        last_name: profile.apellidos.trim(),
        email: profile.email.trim(),
      };
      const updated = await updateProfile(profile.id, payload);
      setProfile((prev) => ({ ...prev, ...updated, id: profile.id }));
      setError(null);
      setSuccess("Perfil actualizado correctamente");
    } catch (e) {
      setError("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto py-10 text-center text-muted-foreground">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
          <CardDescription>
            Gestiona tu información personal y configuración de cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-500/60 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="text-2xl">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Cambiar foto
              </Button>
              <p className="text-muted-foreground text-sm">
                JPG, PNG o GIF. Máximo 5MB.
              </p>
            </div>
          </div>

          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                value={profile.username}
                disabled
                className="bg-muted cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombres">
                Nombres <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="nombres"
                  placeholder="Juan Carlos"
                  value={profile.nombres}
                  onChange={(e) => handleChange("nombres", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <div className="relative">
                <Input
                  id="apellidos"
                  placeholder="Pérez García"
                  value={profile.apellidos}
                  onChange={(e) => handleChange("apellidos", e.target.value)}
                  className="pl-3"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Correo electrónico <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@ejemplo.com"
                  value={profile.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              type="button"
              onClick={() => window.location.reload()}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tarjeta adicional de configuración */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de cuenta</CardTitle>
          <CardDescription>
            Administra tus preferencias y privacidad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p>Notificaciones por correo</p>
              <p className="text-muted-foreground text-sm">
                Recibe actualizaciones sobre tu cuenta
              </p>
            </div>
            <Button variant="outline" size="sm">
              Configurar
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p>Cambiar contraseña</p>
              <p className="text-muted-foreground text-sm">
                Actualiza tu contraseña periódicamente
              </p>
            </div>
            <Button variant="outline" size="sm">
              Cambiar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
