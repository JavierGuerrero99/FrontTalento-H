import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { getCompanyById, makeAbsoluteUrl, updateCompany } from "../services/api";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface CompanyCardProps {
  companyId: number;
}

export function CompanyCard({ companyId }: CompanyCardProps) {
  const [company, setCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDireccion, setFormDireccion] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getCompanyById(companyId)
      .then((data) => {
        if (!mounted) return;
        setCompany(data);
        setError(null);
      })
      .catch((e) => {
        if (!mounted) return;
        setError("No se pudo cargar la empresa");
        console.error(e);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [companyId]);

  const getLogoUrl = (c: any) => {
    if (!c) return undefined;
    if (c.logo_url) return c.logo_url.startsWith("http") ? c.logo_url : makeAbsoluteUrl(c.logo_url);
    if (c.logo) return typeof c.logo === "string" ? c.logo : c.logo?.url;
    return undefined;
  };

  const onStartEdit = () => {
    setFormName(company?.nombre || company?.name || "");
    setFormDireccion(company?.direccion || "");
    setFormDescripcion(company?.descripcion || "");
    setLogoPreview(getLogoUrl(company) || null);
    setLogoFile(null);
    setEditMode(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setLogoFile(null);
    setLogoPreview(null);
    setValidationError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    setValidationError(null);
    setSuccessMessage(null);

    // Validar campos
    if (!formName.trim()) {
      setValidationError("El nombre es obligatorio");
      return;
    }
    if (!formDireccion.trim()) {
      setValidationError("La dirección es obligatoria");
      return;
    }
    if (!formDescripcion.trim()) {
      setValidationError("La descripción es obligatoria");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("nombre", formName);
      fd.append("direccion", formDireccion);
      fd.append("descripcion", formDescripcion);
      if (logoFile) fd.append("logo", logoFile);
      setIsSaving(true);
      const updated = await updateCompany(companyId, fd);
      setCompany(updated);
      setEditMode(false);
      setLogoFile(null);
      setLogoPreview(null);
      console.log('✅ Empresa actualizada', updated);
      setSuccessMessage("Empresa actualizada correctamente");
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('❌ Error actualizando empresa', err);
      setValidationError('No se pudo actualizar la empresa. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Cargando empresa...</div>;
  if (error) return <div className="text-destructive">{error}</div>;
  if (!company) return null;

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex items-start gap-4 w-full justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              {getLogoUrl(company) ? (
                <ImageWithFallback
                  src={getLogoUrl(company)}
                  alt={company.nombre || company.name}
                  className="w-16 h-16 object-cover rounded-full"
                />
              ) : (
                <AvatarFallback className="text-2xl">{(company.nombre || company.name || "E")[0]}</AvatarFallback>
              )}
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold">{company.nombre || company.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                NIT: {company.nit} • Dirección: {company.direccion}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editMode ? (
              <Button variant="outline" onClick={onStartEdit}>Editar</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="default" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Guardando..." : "Guardar"}
                </Button>
                <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>Cancelar</Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!editMode ? (
          <div className="prose">
            {successMessage && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
              </Alert>
            )}
            <p><strong>Nombre:</strong> {company.nombre || company.name}</p>
            <p><strong>NIT:</strong> {company.nit}</p>
            <p><strong>Dirección:</strong> {company.direccion}</p>
            {company.descripcion && <p><strong>Descripción:</strong> {company.descripcion}</p>}
          </div>
        ) : (
          <div className="space-y-4 w-full max-w-xl">
            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label htmlFor="companyName">Nombre</Label>
              <Input id="companyName" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" value={formDireccion} onChange={(e) => setFormDireccion(e.target.value)} />
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <textarea
                id="descripcion"
                className="w-full border rounded-md px-3 py-2 text-sm min-h-[100px]"
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="logo">Logo (opcional)</Label>
              <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} />
              {logoPreview && (
                <div className="w-32 h-32 mt-2 border rounded overflow-hidden">
                  <img src={logoPreview} className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CompanyCard;
