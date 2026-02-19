import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2, MapPin, Euro, Ruler, BedDouble, Bath, ArrowLeft,
  Phone, Mail, User, Calendar, Globe, CheckCircle, XCircle,
  Car, Trees, Waves, Wind, Zap, Home,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  nuevo: { label: "Nuevo", class: "bg-blue-50 text-blue-700 border-blue-200" },
  contactado: { label: "Contactado", class: "bg-sky-50 text-sky-700 border-sky-200" },
  en_negociacion: { label: "En negociación", class: "bg-amber-50 text-amber-700 border-amber-200" },
  captado: { label: "Captado", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  descartado: { label: "Descartado", class: "bg-gray-50 text-gray-500 border-gray-200" },
  vendido: { label: "Vendido", class: "bg-green-50 text-green-700 border-green-200" },
};

function FeatureChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: boolean | null | undefined }) {
  if (value === null || value === undefined) return null;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${value ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-400"}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      {value ? <CheckCircle className="h-3 w-3 ml-auto" /> : <XCircle className="h-3 w-3 ml-auto" />}
    </div>
  );
}

export default function PropertyDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const id = parseInt(params.id ?? "0");

  const { data: property, isLoading, refetch } = trpc.properties.byId.useQuery({ id }, { enabled: !!id });

  const updateStatus = trpc.properties.updateStatus.useMutation({
    onSuccess: () => { toast.success("Estado actualizado"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Propiedad no encontrada</h3>
        <Button variant="outline" onClick={() => setLocation("/properties")}>Volver al listado</Button>
      </div>
    );
  }

  const status = STATUS_LABELS[property.status ?? "nuevo"] ?? { label: "Nuevo", class: "bg-blue-50 text-blue-700" };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/properties")} className="mt-1 gap-1 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-serif font-semibold">
              {property.title ?? property.address ?? "Propiedad"}
            </h1>
            <Badge className={`border ${status.class}`}>{status.label}</Badge>
            {property.sourcePortal && (
              <Badge variant="outline" className="capitalize">{property.sourcePortal}</Badge>
            )}
          </div>
          {property.address && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{[property.address, property.district, property.city, property.province].filter(Boolean).join(", ")}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {property.price && (
              <Card className="border-0 shadow-elegant text-center p-4">
                <Euro className="h-5 w-5 mx-auto mb-1" style={{ color: "oklch(0.68 0.17 85)" }} />
                <p className="text-lg font-semibold font-serif">{Number(property.price).toLocaleString("es-ES")}</p>
                <p className="text-xs text-muted-foreground">Precio</p>
              </Card>
            )}
            {property.squareMeters && (
              <Card className="border-0 shadow-elegant text-center p-4">
                <Ruler className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-semibold font-serif">{Number(property.squareMeters).toFixed(0)} m²</p>
                <p className="text-xs text-muted-foreground">Superficie</p>
              </Card>
            )}
            {property.rooms && (
              <Card className="border-0 shadow-elegant text-center p-4">
                <BedDouble className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-semibold font-serif">{property.rooms}</p>
                <p className="text-xs text-muted-foreground">Habitaciones</p>
              </Card>
            )}
            {property.bathrooms && (
              <Card className="border-0 shadow-elegant text-center p-4">
                <Bath className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-lg font-semibold font-serif">{property.bathrooms}</p>
                <p className="text-xs text-muted-foreground">Baños</p>
              </Card>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <Card className="border-0 shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <Card className="border-0 shadow-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Características</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <FeatureChip icon={Home} label="Ascensor" value={property.hasElevator} />
                <FeatureChip icon={Car} label="Garaje" value={property.hasParking} />
                <FeatureChip icon={Trees} label="Jardín" value={property.hasGarden} />
                <FeatureChip icon={Building2} label="Terraza" value={property.hasTerrace} />
                <FeatureChip icon={Waves} label="Piscina" value={property.hasPool} />
                <FeatureChip icon={Wind} label="Aire acondicionado" value={property.hasAirConditioning} />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                {property.floor && (
                  <div>
                    <p className="text-xs text-muted-foreground">Planta</p>
                    <p className="text-sm font-medium">{property.floor}</p>
                  </div>
                )}
                {property.yearBuilt && (
                  <div>
                    <p className="text-xs text-muted-foreground">Año de construcción</p>
                    <p className="text-sm font-medium">{property.yearBuilt}</p>
                  </div>
                )}
                {property.energyCertificate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Certificado energético</p>
                    <Badge variant="outline" className="mt-1">{property.energyCertificate}</Badge>
                  </div>
                )}
                {property.condition && (
                  <div>
                    <p className="text-xs text-muted-foreground">Estado</p>
                    <p className="text-sm font-medium capitalize">{property.condition.replace("_", " ")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Source info */}
          {property.sourceUrl && (
            <Card className="border-0 shadow-elegant">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span>Captado desde <span className="font-medium capitalize text-foreground">{property.sourcePortal}</span></span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={property.sourceUrl} target="_blank" rel="noopener noreferrer">Ver anuncio original</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status control */}
          <Card className="border-0 shadow-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Estado de captación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={property.status ?? "nuevo"}
                onValueChange={v => updateStatus.mutate({ id: property.id, status: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span>Captado: {new Date(property.capturedAt).toLocaleDateString("es-ES")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  <span>Actualizado: {new Date(property.updatedAt).toLocaleDateString("es-ES")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner contact */}
          {property.ownerName && (
            <Card className="border-0 shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Contacto del propietario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "oklch(0.95 0.015 240)" }}>
                    <User className="h-5 w-5" style={{ color: "oklch(0.28 0.12 240)" }} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{property.ownerName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{property.ownerType}</p>
                  </div>
                </div>
                {property.ownerPhone && (
                  <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                    <a href={`tel:${property.ownerPhone}`}>
                      <Phone className="h-3.5 w-3.5" />
                      {property.ownerPhone}
                    </a>
                  </Button>
                )}
                {property.ownerEmail && (
                  <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                    <a href={`mailto:${property.ownerEmail}`}>
                      <Mail className="h-3.5 w-3.5" />
                      {property.ownerEmail}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Price info */}
          {property.price && (
            <Card className="border-0 shadow-elegant" style={{ background: "linear-gradient(135deg, oklch(0.22 0.10 240) 0%, oklch(0.29 0.13 240) 100%)" }}>
              <CardContent className="p-5">
                <p className="text-xs text-white/60 mb-1">Precio de {property.operationType === "venta" ? "venta" : "alquiler"}</p>
                <p className="text-3xl font-serif font-semibold text-white">
                  {Number(property.price).toLocaleString("es-ES")} €
                </p>
                {property.squareMeters && property.price && (
                  <p className="text-xs text-white/60 mt-1">
                    {(Number(property.price) / Number(property.squareMeters)).toFixed(0)} €/m²
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
