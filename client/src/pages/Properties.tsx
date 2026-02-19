import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Euro,
  Ruler,
  BedDouble,
  Bath,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, { label: string; class: string }> = {
  nuevo: { label: "Nuevo", class: "bg-blue-50 text-blue-700 border-blue-200" },
  contactado: { label: "Contactado", class: "bg-sky-50 text-sky-700 border-sky-200" },
  en_negociacion: { label: "En negociación", class: "bg-amber-50 text-amber-700 border-amber-200" },
  captado: { label: "Captado", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  descartado: { label: "Descartado", class: "bg-gray-50 text-gray-500 border-gray-200" },
  vendido: { label: "Vendido", class: "bg-green-50 text-green-700 border-green-200" },
};

const TYPE_LABELS: Record<string, string> = {
  piso: "Piso", casa: "Casa", chalet: "Chalet", local: "Local",
  oficina: "Oficina", garaje: "Garaje", terreno: "Terreno", nave: "Nave", otro: "Otro",
};

function PropertyCard({ property, onClick }: { property: any; onClick: () => void }) {
  const status = STATUS_LABELS[property.status] ?? { label: property.status, class: "bg-gray-100 text-gray-600" };
  const images = Array.isArray(property.images) ? property.images : [];

  return (
    <Card
      className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all cursor-pointer group overflow-hidden"
      onClick={onClick}
    >
      {/* Image placeholder */}
      <div
        className="h-40 flex items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, oklch(0.95 0.015 240) 0%, oklch(0.90 0.02 240) 100%)" }}
      >
        {images[0] ? (
          <img src={images[0]} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="h-12 w-12" style={{ color: "oklch(0.65 0.06 240)" }} />
        )}
        <div className="absolute top-3 left-3">
          <Badge className={`text-xs border ${status.class}`}>{status.label}</Badge>
        </div>
        {property.sourcePortal && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="text-xs capitalize bg-white/90 text-gray-700">
              {property.sourcePortal}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title & Type */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs capitalize">
              {TYPE_LABELS[property.propertyType] ?? property.propertyType}
            </Badge>
            <Badge variant="outline" className="text-xs capitalize">
              {property.operationType === "venta" ? "Venta" : "Alquiler"}
            </Badge>
          </div>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {property.title ?? property.address ?? "Propiedad sin título"}
          </h3>
        </div>

        {/* Location */}
        {(property.city || property.address) && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{[property.district, property.city].filter(Boolean).join(", ")}</span>
          </div>
        )}

        {/* Price */}
        {property.price && (
          <div className="flex items-center gap-1">
            <Euro className="h-4 w-4" style={{ color: "oklch(0.68 0.17 85)" }} />
            <span className="font-semibold text-base" style={{ color: "oklch(0.22 0.10 240)" }}>
              {Number(property.price).toLocaleString("es-ES")}
              {property.operationType === "alquiler" ? "/mes" : ""}
            </span>
          </div>
        )}

        {/* Features */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {property.squareMeters && (
            <span className="flex items-center gap-1">
              <Ruler className="h-3 w-3" />
              {Number(property.squareMeters).toFixed(0)} m²
            </span>
          )}
          {property.rooms && (
            <span className="flex items-center gap-1">
              <BedDouble className="h-3 w-3" />
              {property.rooms} hab.
            </span>
          )}
          {property.bathrooms && (
            <span className="flex items-center gap-1">
              <Bath className="h-3 w-3" />
              {property.bathrooms} baños
            </span>
          )}
        </div>

        {/* Owner */}
        {property.ownerName && (
          <div className="pt-2 border-t border-border/60">
            <p className="text-xs text-muted-foreground truncate">
              <span className="font-medium text-foreground">{property.ownerName}</span>
              {property.ownerPhone && (
                <span className="ml-2 text-muted-foreground">{property.ownerPhone}</span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Add Property Dialog ──────────────────────────────────────────────────────
function AddPropertyDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", address: "", city: "", province: "",
    propertyType: "piso" as const, operationType: "venta" as const,
    price: "", squareMeters: "", rooms: "", bathrooms: "",
    ownerName: "", ownerPhone: "", ownerEmail: "",
    description: "",
  });

  const createMutation = trpc.properties.create.useMutation({
    onSuccess: () => {
      toast.success("Propiedad creada correctamente");
      setOpen(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      rooms: form.rooms ? parseInt(form.rooms) : undefined,
      bathrooms: form.bathrooms ? parseInt(form.bathrooms) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" style={{ background: "oklch(0.22 0.10 240)" }}>
          <Plus className="h-4 w-4" />
          Nueva propiedad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Añadir Nueva Propiedad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Título del anuncio</Label>
              <Input placeholder="Ej: Piso luminoso en el centro" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de propiedad</Label>
              <Select value={form.propertyType} onValueChange={v => setForm(f => ({ ...f, propertyType: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Operación</Label>
              <Select value={form.operationType} onValueChange={v => setForm(f => ({ ...f, operationType: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="alquiler">Alquiler</SelectItem>
                  <SelectItem value="alquiler_vacacional">Alquiler vacacional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Dirección</Label>
              <Input placeholder="Calle, número, piso..." value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Ciudad</Label>
              <Input placeholder="Madrid, Barcelona..." value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Provincia</Label>
              <Input placeholder="Madrid, Barcelona..." value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Precio (€)</Label>
              <Input type="number" placeholder="250000" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Superficie (m²)</Label>
              <Input type="number" placeholder="80" value={form.squareMeters} onChange={e => setForm(f => ({ ...f, squareMeters: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Habitaciones</Label>
              <Input type="number" placeholder="3" value={form.rooms} onChange={e => setForm(f => ({ ...f, rooms: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Baños</Label>
              <Input type="number" placeholder="2" value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Descripción</Label>
              <Textarea placeholder="Descripción detallada del inmueble..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div className="col-span-2 pt-2 border-t">
              <p className="text-sm font-medium mb-3">Datos del propietario</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Nombre</Label>
                  <Input placeholder="Nombre completo" value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Teléfono</Label>
                  <Input placeholder="+34 600 000 000" value={form.ownerPhone} onChange={e => setForm(f => ({ ...f, ownerPhone: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" placeholder="propietario@email.com" value={form.ownerEmail} onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending} style={{ background: "oklch(0.22 0.10 240)" }}>
              {createMutation.isPending ? "Guardando..." : "Crear propiedad"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Properties() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({
    search: "", propertyType: "all", operationType: "all",
    status: "all", sourcePortal: "all",
    page: 0,
  });

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.properties.list.useQuery({
    search: filters.search || undefined,
    propertyType: filters.propertyType !== "all" ? filters.propertyType : undefined,
    operationType: filters.operationType !== "all" ? filters.operationType : undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    sourcePortal: filters.sourcePortal !== "all" ? filters.sourcePortal : undefined,
    limit: 12,
    offset: filters.page * 12,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 12);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Propiedades</h1>
          <p className="text-muted-foreground mt-1">
            {data?.total ?? 0} inmuebles en la base de datos
          </p>
        </div>
        <AddPropertyDialog onSuccess={() => utils.properties.list.invalidate()} />
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-elegant">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por dirección, ciudad, propietario..."
                className="pl-9"
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 0 }))}
              />
            </div>
            <Select value={filters.propertyType} onValueChange={v => setFilters(f => ({ ...f, propertyType: v, page: 0 }))}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.operationType} onValueChange={v => setFilters(f => ({ ...f, operationType: v, page: 0 }))}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Operación" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Venta y alquiler</SelectItem>
                <SelectItem value="venta">Venta</SelectItem>
                <SelectItem value="alquiler">Alquiler</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={v => setFilters(f => ({ ...f, status: v, page: 0 }))}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filters.sourcePortal} onValueChange={v => setFilters(f => ({ ...f, sourcePortal: v, page: 0 }))}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Portal" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los portales</SelectItem>
                <SelectItem value="idealista">Idealista</SelectItem>
                <SelectItem value="fotocasa">Fotocasa</SelectItem>
                <SelectItem value="habitaclia">Habitaclia</SelectItem>
                <SelectItem value="pisos_com">Pisos.com</SelectItem>
                <SelectItem value="milanuncios">Milanuncios</SelectItem>
              </SelectContent>
            </Select>
            {(filters.search || filters.propertyType !== "all" || filters.status !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ search: "", propertyType: "all", operationType: "all", status: "all", sourcePortal: "all", page: 0 })}
                className="text-muted-foreground"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="border-0 shadow-elegant overflow-hidden">
              <Skeleton className="h-40 w-full rounded-none" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "oklch(0.95 0.015 240)" }}>
            <Building2 className="h-8 w-8" style={{ color: "oklch(0.48 0.13 240)" }} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Sin propiedades</h3>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            Añade propiedades manualmente o ejecuta el motor de captación automática para importarlas.
          </p>
          <AddPropertyDialog onSuccess={() => utils.properties.list.invalidate()} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data?.items.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => setLocation(`/properties/${property.id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Mostrando {filters.page * 12 + 1}–{Math.min((filters.page + 1) * 12, data?.total ?? 0)} de {data?.total ?? 0}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === 0}
                  onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= totalPages - 1}
                  onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
