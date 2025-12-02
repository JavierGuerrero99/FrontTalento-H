import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User, Mail, Upload, Pencil } from "lucide-react";
import api, {
  getProfile,
  updateProfile,
  getAdditionalProfile,
  updateAdditionalProfile,
  makeAbsoluteUrl,
} from "../services/api";
import { toast } from "react-hot-toast";

export function ProfileSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAdditional, setSavingAdditional] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cvLoading, setCvLoading] = useState<"download" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    id: 0,
    username: "",
    nombres: "",
    apellidos: "",
    email: "",
    avatar_url: "",
    telefono: "",
    ubicacion: "",
    documento: "",
    hoja_vida_url: "",
  });
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [editingAdditional, setEditingAdditional] = useState(false);
  const [originalAdditional, setOriginalAdditional] = useState({
    telefono: "",
    ubicacion: "",
    documento: "",
    hoja_vida_url: "",
    foto_perfil: "",
  });
  const resumeBlobUrlRef = useRef<{ url: string; timestamp: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [data, additional] = await Promise.all([
          getProfile(),
          getAdditionalProfile().catch((err) => {
            console.error("Error cargando perfil adicional", err);
            return null;
          }),
        ]);
        if (!mounted) return;
        setProfile({
          id: data.id,
          username: data.username || "",
          nombres: data.nombres || data.first_name || data.primer_nombre || data.nombre || "",
          apellidos: data.apellidos || data.last_name || data.segundo_nombre || "",
          email: data.email || "",
          avatar_url: additional?.foto_perfil || data.avatar_url || "",
          telefono:
            additional?.telefono || data.telefono || data.phone || "",
          ubicacion:
            additional?.ubicacion || data.ubicacion || data.location || "",
          documento:
            additional?.documento || data.documento || data.document || "",
          hoja_vida_url:
            additional?.hoja_vida ||
            additional?.hoja_vida_url ||
            additional?.cv_url ||
            data.hoja_vida ||
            data.hoja_vida_url ||
            data.cv_url ||
            "",
        });
        setOriginalAdditional({
          telefono: additional?.telefono || data.telefono || data.phone || "",
          ubicacion: additional?.ubicacion || data.ubicacion || data.location || "",
          documento: additional?.documento || data.documento || data.document || "",
          hoja_vida_url:
            additional?.hoja_vida ||
            additional?.hoja_vida_url ||
            additional?.cv_url ||
            data.hoja_vida ||
            data.hoja_vida_url ||
            data.cv_url ||
            "",
          foto_perfil: additional?.foto_perfil || data.avatar_url || "",
        });
        setError(null);
      } catch (e) {
        const errorMessage = "No se pudo cargar el perfil";
        setError(errorMessage);
        toast.error(errorMessage);
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
      // 1) Actualizar datos básicos del perfil
      const basicPayload = {
        first_name: profile.nombres.trim(),
        last_name: profile.apellidos.trim(),
        email: profile.email.trim(),
      };
      const updatedBasic = await updateProfile(profile.id, basicPayload);

      // 2) Actualizar datos adicionales (teléfono, ubicación, documento)
      const updatedAdditional = await updateAdditionalProfile({
        telefono: profile.telefono.trim() || null,
        ubicacion: profile.ubicacion.trim() || null,
        documento: profile.documento.trim() || null,
      });

      setProfile((prev) => ({
        ...prev,
        ...updatedBasic,
        telefono: updatedAdditional.telefono ?? prev.telefono,
        ubicacion: updatedAdditional.ubicacion ?? prev.ubicacion,
        documento: updatedAdditional.documento ?? prev.documento,
        hoja_vida_url:
          updatedAdditional.hoja_vida ||
            updatedAdditional.hoja_vida_url ||
            updatedAdditional.cv_url ||
            prev.hoja_vida_url,
        id: profile.id,
      }));
      setError(null);
      const successMessage = "Perfil actualizado correctamente";
      setSuccess(successMessage);
      toast.success(successMessage);
    } catch (e) {
      const errorMessage = "Error al actualizar el perfil";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdditional = async () => {
    setSavingAdditional(true);
    try {
      const updatedAdditional = await updateAdditionalProfile({
        telefono: profile.telefono.trim() || null,
        ubicacion: profile.ubicacion.trim() || null,
        documento: profile.documento.trim() || null,
      });
      setProfile((prev) => ({
        ...prev,
        telefono: updatedAdditional.telefono ?? prev.telefono,
        ubicacion: updatedAdditional.ubicacion ?? prev.ubicacion,
        documento: updatedAdditional.documento ?? prev.documento,
        hoja_vida_url:
          updatedAdditional.hoja_vida ||
            updatedAdditional.hoja_vida_url ||
            updatedAdditional.cv_url ||
            prev.hoja_vida_url,
      }));
      setOriginalAdditional((prev) => ({
        ...prev,
        telefono: updatedAdditional.telefono ?? profile.telefono,
        ubicacion: updatedAdditional.ubicacion ?? profile.ubicacion,
        documento: updatedAdditional.documento ?? profile.documento,
        hoja_vida_url:
          updatedAdditional.hoja_vida ||
            updatedAdditional.hoja_vida_url ||
            updatedAdditional.cv_url ||
            profile.hoja_vida_url,
      }));
      const successMessage = "Datos adicionales actualizados correctamente";
      setSuccess(successMessage);
      toast.success(successMessage);
      setError(null);
      setEditingAdditional(false);
    } catch (e) {
      const errorMessage = "Error al actualizar los datos adicionales";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSavingAdditional(false);
    }
  };

  const handleCancelAdditional = () => {
    setProfile((prev) => ({
      ...prev,
      telefono: originalAdditional.telefono,
      ubicacion: originalAdditional.ubicacion,
      documento: originalAdditional.documento,
      hoja_vida_url: originalAdditional.hoja_vida_url,
      avatar_url: originalAdditional.foto_perfil || prev.avatar_url,
    }));
    setEditingAdditional(false);
  };

  const handleAvatarButtonClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setAvatarUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("foto_perfil", file);
      const updated = await updateAdditionalProfile(formData);
      const newAvatar = updated?.foto_perfil || updated?.avatar_url || profile.avatar_url;
      setProfile((prev) => ({
        ...prev,
        avatar_url: newAvatar,
      }));
      setOriginalAdditional((prev) => ({
        ...prev,
        foto_perfil: newAvatar,
      }));
      const successMessage = "Foto de perfil actualizada correctamente";
      setSuccess(successMessage);
      toast.success(successMessage);
    } catch (uploadError) {
      console.error(uploadError);
      const errorMessage = "No se pudo actualizar la foto de perfil";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };
  const currentCvUrl = makeAbsoluteUrl(profile.hoja_vida_url);

  const fetchCvBlob = async () => {
    if (!currentCvUrl) return null;
    if (resumeBlobUrlRef.current) {
      return resumeBlobUrlRef.current.url;
    }
    try {
      const response = await api.get(currentCvUrl, {
        responseType: "blob",
      });
      const blob = response.data as Blob;
      const blobUrl = URL.createObjectURL(blob);
      resumeBlobUrlRef.current = { url: blobUrl, timestamp: Date.now() };
      return blobUrl;
    } catch (cvError) {
      console.error(cvError);
      const errorMessage = "No se pudo cargar el documento PDF.";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  };

  const handleDownloadCv = async () => {
    if (!currentCvUrl || cvLoading) return;
    setError(null);
    setCvLoading("download");
    let blobUrl = await fetchCvBlob();
    if (blobUrl) {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = "hoja_de_vida.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        if (resumeBlobUrlRef.current && resumeBlobUrlRef.current.url === blobUrl) {
          URL.revokeObjectURL(blobUrl);
          resumeBlobUrlRef.current = null;
        }
      }, 1000);
    }
    setCvLoading(null);
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
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url || ""} />
              <AvatarFallback className="text-2xl">
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleAvatarButtonClick}
                disabled={avatarUploading}
              >
                <Upload className="w-4 h-4" />
                {avatarUploading ? "Subiendo..." : "Cambiar foto"}
              </Button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
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
                  disabled
                  className="pl-10 bg-muted cursor-not-allowed"
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
                  disabled
                  className="pl-3 bg-muted cursor-not-allowed"
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
                  disabled
                  className="pl-10 bg-muted cursor-not-allowed"
                />
              </div>
            </div>
          </div>
          {/* Botones de acción eliminados */}
        </CardContent>
      </Card>

      {/* Datos adicionales */}
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Datos adicionales</CardTitle>
              <CardDescription>
                Información complementaria para tu perfil profesional
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {!editingAdditional && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditingAdditional(true)}
                  className="gap-1"
                >
                  <Pencil className="w-3 h-3" /> Editar
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                placeholder="Ej: +57 300 123 4567"
                value={profile.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
                disabled={!editingAdditional}
                className={!editingAdditional ? "bg-muted cursor-not-allowed" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                placeholder="Ej: Bogotá, Colombia"
                value={profile.ubicacion}
                onChange={(e) => handleChange("ubicacion", e.target.value)}
                disabled={!editingAdditional}
                className={!editingAdditional ? "bg-muted cursor-not-allowed" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento">Documento</Label>
              <Input
                id="documento"
                placeholder="Ej: CC 1234567890"
                value={profile.documento}
                onChange={(e) => handleChange("documento", e.target.value)}
                disabled={!editingAdditional}
                className={!editingAdditional ? "bg-muted cursor-not-allowed" : ""}
              />
            </div>

          </div>
          {currentCvUrl && (
            <div className="rounded-md border border-dashed border-muted-foreground/30 bg-muted/10 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Hoja de vida registrada disponible para descarga.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={handleDownloadCv}
                  disabled={cvLoading !== null}
                >
                  {cvLoading === "download" ? "Descargando..." : "Descargar hoja de vida"}
                </Button>
              </div>
            </div>
          )}
          {!editingAdditional && (
            <p className="text-xs text-muted-foreground">
              Estos campos están bloqueados. Pulsa Editar para modificarlos.
            </p>
          )}
          {editingAdditional && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveAdditional}
                  disabled={savingAdditional}
                  variant="outline"
                  className="flex-1 border border-border/60 bg-card text-foreground shadow-sm hover:bg-secondary/60"
                >
                  {savingAdditional ? "Guardando datos..." : "Guardar datos adicionales"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelAdditional}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Al guardar se actualizarán teléfono, ubicación y documento.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ...existing code... */}
    </div>
  );
}
