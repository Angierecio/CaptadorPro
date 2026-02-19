import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users, Search, Plus, Phone, Mail, Calendar, Eye,
  ChevronLeft, ChevronRight, AlertCircle, Clock, CheckCircle2,
  TrendingUp, UserCheck, XCircle,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  nuevo: { label: "Nuevo", class: "bg-blue-50 text-blue-700 border-blue-200", icon: AlertCircle },
  contactado: { label: "Contactado", class: "bg-sky-50 text-sky-700 border-sky-200", icon: Phone },
  interesado: { label: "Interesado", class: "bg-violet-50 text-violet-700 border-violet-200", icon: TrendingUp },
  en_negociacion: { label: "En negociación", class: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  captado: { label: "Captado", class: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  descartado: { label: "Descartado", class: "bg-gray-50 text-gray-500 border-gray-200", icon: XCircle },
  perdido: { label: "Perdido", class: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

const PRIORITY_CONFIG: Record<string, { label: string; class: string }> = {
  baja: { label: "Baja", class: "bg-gray-100 text-gray-600" },
  media: { label: "Media", class: "bg-blue-100 text-blue-700" },
  alta: { label: "Alta", class: "bg-amber-100 text-amber-700" },
  urgente: { label: "Urgente", class: "bg-red-100 text-red-700" },
};

function LeadRow({ lead, onClick }: { lead: any; onClick: () => void }) {
  const status = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.nuevo;
  const priority = PRIORITY_CONFIG[lead.priority] ?? PRIORITY_CONFIG.media;
  const StatusIcon = status.icon;

  return (
    <tr
      className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm" style={{ background: "oklch(0.95 0.015 240)", color: "oklch(0.28 0.12 240)" }}>
            {lead.ownerName?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-medium text-sm group-hover:text-primary transition-colors">{lead.ownerName}</p>
            <p className="text-xs text-muted-foreground capitalize">{lead.ownerType}</p>
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="space-y-0.5">
          {lead.ownerPhone && (
            <p className="text-xs flex items-center gap-1.5 text-muted-foreground">
              <Phone className="h-3 w-3" />{lead.ownerPhone}
            </p>
          )}
          {lead.ownerEmail && (
            <p className="text-xs flex items-center gap-1.5 text-muted-foreground">
              <Mail className="h-3 w-3" />{lead.ownerEmail}
            </p>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4">
        <Badge className={`text-xs border gap-1 ${status.class}`}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </td>
      <td className="py-3.5 px-4">
        <Badge className={`text-xs ${priority.class}`}>{priority.label}</Badge>
      </td>
      <td className="py-3.5 px-4">
        <p className="text-xs text-muted-foreground capitalize">{lead.source ?? "Manual"}</p>
      </td>
      <td className="py-3.5 px-4">
        {lead.nextContactDate ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(lead.nextContactDate).toLocaleDateString("es-ES")}
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </td>
      <td className="py-3.5 px-4">
        <p className="text-xs text-muted-foreground">
          {new Date(lead.createdAt).toLocaleDateString("es-ES")}
        </p>
      </td>
      <td className="py-3.5 px-4">
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  );
}

function AddLeadDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    ownerName: "", ownerPhone: "", ownerEmail: "",
    ownerType: "particular" as const,
    status: "nuevo" as const,
    priority: "media" as const,
    source: "", notes: "",
  });

  const createMutation = trpc.leads.create.useMutation({
    onSuccess: () => {
      toast.success("Lead creado correctamente");
      setOpen(false);
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" style={{ background: "oklch(0.22 0.10 240)" }}>
          <Plus className="h-4 w-4" />
          Nuevo lead
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Nuevo Lead</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }}
          className="space-y-4 mt-2"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Nombre del propietario *</Label>
              <Input required placeholder="Nombre completo" value={form.ownerName} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input placeholder="+34 600 000 000" value={form.ownerPhone} onChange={e => setForm(f => ({ ...f, ownerPhone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="email@ejemplo.com" value={form.ownerEmail} onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo de propietario</Label>
              <Select value={form.ownerType} onValueChange={v => setForm(f => ({ ...f, ownerType: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="particular">Particular</SelectItem>
                  <SelectItem value="agencia">Agencia</SelectItem>
                  <SelectItem value="promotora">Promotora</SelectItem>
                  <SelectItem value="banco">Banco</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prioridad</Label>
              <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Baja</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Fuente</Label>
              <Input placeholder="Idealista, referido, llamada entrante..." value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Notas</Label>
              <Textarea placeholder="Información adicional sobre el lead..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending} style={{ background: "oklch(0.22 0.10 240)" }}>
              {createMutation.isPending ? "Guardando..." : "Crear lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Leads() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState({ search: "", status: "all", priority: "all", page: 0 });
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.leads.list.useQuery({
    search: filters.search || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    priority: filters.priority !== "all" ? filters.priority : undefined,
    limit: 20,
    offset: filters.page * 20,
  });

  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  // Summary counts
  const statusCounts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
    acc[key] = data?.items.filter(l => l.status === key).length ?? 0;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold">CRM / Leads</h1>
          <p className="text-muted-foreground mt-1">{data?.total ?? 0} propietarios en seguimiento</p>
        </div>
        <AddLeadDialog onSuccess={() => utils.leads.list.invalidate()} />
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const StatusIcon = cfg.icon;
          const count = data?.items.filter(l => l.status === key).length ?? 0;
          return (
            <button
              key={key}
              onClick={() => setFilters(f => ({ ...f, status: f.status === key ? "all" : key, page: 0 }))}
              className={`rounded-xl p-3 text-center transition-all border ${filters.status === key ? `${cfg.class} border-current` : "bg-card border-border hover:border-primary/30"}`}
            >
              <StatusIcon className={`h-4 w-4 mx-auto mb-1 ${filters.status === key ? "" : "text-muted-foreground"}`} />
              <p className="text-xs font-medium">{cfg.label}</p>
              <p className="text-lg font-serif font-semibold">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-elegant">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, teléfono, email..."
                className="pl-9"
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 0 }))}
              />
            </div>
            <Select value={filters.priority} onValueChange={v => setFilters(f => ({ ...f, priority: v, page: 0 }))}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Prioridad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-elegant overflow-hidden">
        {isLoading ? (
          <CardContent className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </CardContent>
        ) : data?.items.length === 0 ? (
          <CardContent className="py-20 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Sin leads</h3>
            <p className="text-sm text-muted-foreground mb-4">Añade leads manualmente o ejecuta el motor de captación.</p>
            <AddLeadDialog onSuccess={() => utils.leads.list.invalidate()} />
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Propietario</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contacto</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Prioridad</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fuente</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Próx. contacto</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Creado</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {data?.items.map(lead => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    onClick={() => setLocation(`/leads/${lead.id}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {filters.page * 20 + 1}–{Math.min((filters.page + 1) * 20, data?.total ?? 0)} de {data?.total ?? 0}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={filters.page === 0} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={filters.page >= totalPages - 1} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
