import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search, Plus, Play, CheckCircle2, XCircle, Clock,
  Globe, Settings, Trash2, RefreshCw, AlertCircle,
  Building2, Zap,
} from "lucide-react";
import { toast } from "sonner";

const PORTAL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  idealista: { label: "Idealista", color: "text-emerald-700", bg: "bg-emerald-50" },
  fotocasa: { label: "Fotocasa", color: "text-orange-700", bg: "bg-orange-50" },
  habitaclia: { label: "Habitaclia", color: "text-blue-700", bg: "bg-blue-50" },
  pisos_com: { label: "Pisos.com", color: "text-purple-700", bg: "bg-purple-50" },
  milanuncios: { label: "Milanuncios", color: "text-red-700", bg: "bg-red-50" },
  yaencontre: { label: "Yaencontre", color: "text-teal-700", bg: "bg-teal-50" },
  otro: { label: "Otro", color: "text-gray-700", bg: "bg-gray-50" },
};

function AddSourceDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    portal: "idealista" as const,
    baseUrl: "",
    scheduleInterval: 60,
    isActive: true,
  });

  const createMutation = trpc.scraping.createSource.useMutation({
    onSuccess: () => {
      toast.success("Fuente de captación creada");
      setOpen(false);
      setForm({ name: "", portal: "idealista", baseUrl: "", scheduleInterval: 60, isActive: true });
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  const PORTAL_URLS: Record<string, string> = {
    idealista: "https://www.idealista.com/venta-viviendas/",
    fotocasa: "https://www.fotocasa.es/es/comprar/viviendas/",
    habitaclia: "https://www.habitaclia.com/comprar/",
    pisos_com: "https://www.pisos.com/pisos/venta/",
    milanuncios: "https://www.milanuncios.com/pisos-en-venta/",
    yaencontre: "https://www.yaencontre.com/pisos/venta/",
    otro: "",
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" style={{ background: "oklch(0.22 0.10 240)" }}>
          <Plus className="h-4 w-4" />
          Nueva fuente
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Configurar Fuente de Captación</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => { e.preventDefault(); createMutation.mutate(form); }}
          className="space-y-4 mt-2"
        >
          <div className="space-y-1.5">
            <Label>Nombre de la fuente *</Label>
            <Input required placeholder="Ej: Idealista Madrid Pisos Venta" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Portal inmobiliario</Label>
            <Select
              value={form.portal}
              onValueChange={v => setForm(f => ({ ...f, portal: v as any, baseUrl: PORTAL_URLS[v] ?? "" }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(PORTAL_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>URL de búsqueda *</Label>
            <Input
              required
              placeholder="https://www.idealista.com/venta-viviendas/madrid/"
              value={form.baseUrl}
              onChange={e => setForm(f => ({ ...f, baseUrl: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">URL de la página de resultados del portal</p>
          </div>
          <div className="space-y-1.5">
            <Label>Intervalo de captación (minutos)</Label>
            <Select
              value={String(form.scheduleInterval)}
              onValueChange={v => setForm(f => ({ ...f, scheduleInterval: parseInt(v) }))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Cada 30 minutos</SelectItem>
                <SelectItem value="60">Cada hora</SelectItem>
                <SelectItem value="120">Cada 2 horas</SelectItem>
                <SelectItem value="360">Cada 6 horas</SelectItem>
                <SelectItem value="720">Cada 12 horas</SelectItem>
                <SelectItem value="1440">Una vez al día</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <div>
              <p className="text-sm font-medium">Activar fuente</p>
              <p className="text-xs text-muted-foreground">La fuente comenzará a captar automáticamente</p>
            </div>
            <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending} style={{ background: "oklch(0.22 0.10 240)" }}>
              {createMutation.isPending ? "Creando..." : "Crear fuente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SourceCard({ source, onRun, onToggle, onDelete }: {
  source: any;
  onRun: () => void;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
}) {
  const portal = PORTAL_CONFIG[source.portal] ?? PORTAL_CONFIG.otro;

  return (
    <Card className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${portal.bg}`}>
              <Globe className={`h-5 w-5 ${portal.color}`} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{source.name}</h3>
              <Badge className={`text-xs mt-0.5 ${portal.bg} ${portal.color} border-0`}>{portal.label}</Badge>
            </div>
          </div>
          <Switch
            checked={source.isActive}
            onCheckedChange={onToggle}
          />
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-xs text-muted-foreground truncate">
            <span className="font-medium text-foreground">URL:</span> {source.baseUrl}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Intervalo:</span> {source.scheduleInterval} min
          </p>
          {source.lastRunAt && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Última ejecución:</span>{" "}
              {new Date(source.lastRunAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          {source.nextRunAt && source.isActive && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Próxima:</span>{" "}
              {new Date(source.nextRunAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            onClick={onRun}
            style={{ background: "oklch(0.22 0.10 240)" }}
          >
            <Play className="h-3 w-3" />
            Ejecutar ahora
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Scraping() {
  const utils = trpc.useUtils();
  const [runningSourceId, setRunningSourceId] = useState<number | null>(null);

  const { data: sources, isLoading: sourcesLoading } = trpc.scraping.listSources.useQuery();
  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = trpc.scraping.listJobs.useQuery({});

  const runMutation = trpc.scraping.runScraping.useMutation({
    onSuccess: (data) => {
      toast.success(`Captación completada: ${data.propertiesNew} nuevas propiedades`);
      setRunningSourceId(null);
      utils.scraping.listJobs.invalidate();
      utils.properties.list.invalidate();
      utils.leads.list.invalidate();
    },
    onError: (err) => {
      toast.error(err.message);
      setRunningSourceId(null);
    },
  });

  const toggleMutation = trpc.scraping.updateSource.useMutation({
    onSuccess: () => utils.scraping.listSources.invalidate(),
  });

  const deleteMutation = trpc.scraping.deleteSource.useMutation({
    onSuccess: () => {
      toast.success("Fuente eliminada");
      utils.scraping.listSources.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleRun = (sourceId: number) => {
    setRunningSourceId(sourceId);
    runMutation.mutate({ sourceId });
  };

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Motor de Captación</h1>
          <p className="text-muted-foreground mt-1">
            Configura y ejecuta captaciones automáticas desde portales inmobiliarios
          </p>
        </div>
        <AddSourceDialog onSuccess={() => utils.scraping.listSources.invalidate()} />
      </div>

      {/* Info banner */}
      <Card className="border-0 shadow-elegant" style={{ background: "linear-gradient(135deg, oklch(0.22 0.10 240) 0%, oklch(0.29 0.13 240) 100%)" }}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "oklch(0.68 0.17 85)" }}>
              <Zap className="h-5 w-5" style={{ color: "oklch(0.15 0.06 240)" }} />
            </div>
            <div className="text-white">
              <h3 className="font-semibold mb-1">Motor de Captación con Inteligencia Artificial</h3>
              <p className="text-sm text-white/70">
                Nuestro motor utiliza IA para extraer y estructurar automáticamente los datos de propiedades desde los portales configurados.
                Cada ejecución genera propiedades y leads listos para gestionar en tu CRM.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sources Grid */}
      <div>
        <h2 className="text-base font-semibold mb-4">Fuentes Configuradas</h2>
        {sourcesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="border-0 shadow-elegant">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !sources || sources.length === 0 ? (
          <Card className="border-0 shadow-elegant">
            <CardContent className="py-16 text-center">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Sin fuentes configuradas</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Añade tu primera fuente de captación para comenzar a importar propiedades automáticamente.
              </p>
              <AddSourceDialog onSuccess={() => utils.scraping.listSources.invalidate()} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map(source => (
              <SourceCard
                key={source.id}
                source={source}
                onRun={() => handleRun(source.id)}
                onToggle={(active) => toggleMutation.mutate({ id: source.id, data: { isActive: active } })}
                onDelete={() => {
                  if (confirm("¿Eliminar esta fuente de captación?")) {
                    deleteMutation.mutate({ id: source.id });
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Running indicator */}
      {runningSourceId && (
        <Card className="border-0 shadow-elegant border-l-4" style={{ borderLeftColor: "oklch(0.68 0.17 85)" }}>
          <CardContent className="p-4 flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin" style={{ color: "oklch(0.68 0.17 85)" }} />
            <div>
              <p className="font-medium text-sm">Captación en progreso...</p>
              <p className="text-xs text-muted-foreground">El motor de IA está extrayendo propiedades. Esto puede tardar unos segundos.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Historial de Ejecuciones</h2>
          <Button variant="ghost" size="sm" onClick={() => refetchJobs()} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </Button>
        </div>
        <Card className="border-0 shadow-elegant overflow-hidden">
          {jobsLoading ? (
            <CardContent className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </CardContent>
          ) : !jobs || jobs.length === 0 ? (
            <CardContent className="py-12 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Sin ejecuciones registradas</p>
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Encontradas</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nuevas</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Duplicadas</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Inicio</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fin</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job: any) => (
                    <tr key={job.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium">#{job.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {job.status === "completado" ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : job.status === "error" ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : job.status === "en_proceso" ? (
                            <RefreshCw className="h-4 w-4 text-amber-500 animate-spin" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-400" />
                          )}
                          <span className="text-sm capitalize">{job.status.replace("_", " ")}</span>
                        </div>
                        {job.errorMessage && (
                          <p className="text-xs text-red-500 mt-0.5 max-w-xs truncate">{job.errorMessage}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">{job.propertiesFound ?? 0}</td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-emerald-600">{job.propertiesNew ?? 0}</span>
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{job.propertiesDuplicated ?? 0}</td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {job.startedAt ? new Date(job.startedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {job.completedAt ? new Date(job.completedAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
