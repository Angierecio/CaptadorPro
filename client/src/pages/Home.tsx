import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Building2,
  Users,
  TrendingUp,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { useLocation } from "wouter";

// ─── Mock chart data ──────────────────────────────────────────────────────────
const monthlyData = [
  { mes: "Sep", propiedades: 12, leads: 8 },
  { mes: "Oct", propiedades: 19, leads: 14 },
  { mes: "Nov", propiedades: 15, leads: 11 },
  { mes: "Dic", propiedades: 22, leads: 17 },
  { mes: "Ene", propiedades: 28, leads: 21 },
  { mes: "Feb", propiedades: 35, leads: 26 },
];

const PORTAL_COLORS = [
  "oklch(0.68 0.17 85)",
  "oklch(0.48 0.13 240)",
  "oklch(0.60 0.15 220)",
  "oklch(0.60 0.18 145)",
  "oklch(0.55 0.22 25)",
];

const STATUS_COLORS: Record<string, string> = {
  nuevo: "oklch(0.48 0.13 240)",
  contactado: "oklch(0.60 0.15 220)",
  en_negociacion: "oklch(0.68 0.17 85)",
  captado: "oklch(0.60 0.18 145)",
  descartado: "oklch(0.55 0.22 25)",
  vendido: "oklch(0.32 0.16 145)",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  accent = false,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  accent?: boolean;
}) {
  return (
    <Card
      className="relative overflow-hidden border-0 shadow-elegant transition-all hover:shadow-elegant-lg"
      style={accent ? { background: "linear-gradient(135deg, oklch(0.22 0.10 240) 0%, oklch(0.29 0.13 240) 100%)" } : {}}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className={`text-sm font-medium ${accent ? "text-white/70" : "text-muted-foreground"}`}>
              {title}
            </p>
            <p className={`text-3xl font-serif font-semibold tracking-tight ${accent ? "text-white" : "text-foreground"}`}>
              {value}
            </p>
            {subtitle && (
              <p className={`text-xs ${accent ? "text-white/60" : "text-muted-foreground"}`}>{subtitle}</p>
            )}
          </div>
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: accent
                ? "oklch(0.98 0.005 240 / 0.15)"
                : "oklch(0.22 0.10 240 / 0.08)",
            }}
          >
            <Icon className="h-5 w-5" style={{ color: accent ? "oklch(0.68 0.17 85)" : "oklch(0.28 0.12 240)" }} />
          </div>
        </div>
        {trendLabel && (
          <div className="flex items-center gap-1.5 mt-4">
            {trend === "up" ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
            ) : trend === "down" ? (
              <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
            ) : null}
            <span className={`text-xs font-medium ${accent ? "text-white/70" : "text-muted-foreground"}`}>
              {trendLabel}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: metrics, isLoading } = trpc.agents.metrics.useQuery();

  const propertiesBySource = (metrics?.propertiesBySource ?? []).map((item, i) => ({
    name: item.portal ?? "Desconocido",
    value: item.count,
    color: PORTAL_COLORS[i % PORTAL_COLORS.length],
  }));

  const propertiesByStatus = (metrics?.propertiesByStatus ?? []).map(item => ({
    name: item.status ?? "Desconocido",
    value: item.count,
    color: STATUS_COLORS[item.status ?? ""] ?? "oklch(0.60 0.06 240)",
  }));

  const propertiesByType = (metrics?.propertiesByType ?? []).map(item => ({
    tipo: item.type ?? "Otro",
    cantidad: item.count,
  }));

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-foreground">
            Bienvenido, {user?.name?.split(" ")[0] ?? "Agente"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Aquí tienes el resumen de tu actividad de captación
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setLocation("/scraping")}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Nueva captación
          </Button>
          <Button
            onClick={() => setLocation("/properties")}
            className="gap-2"
            style={{ background: "oklch(0.22 0.10 240)" }}
          >
            <Plus className="h-4 w-4" />
            Añadir propiedad
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-elegant">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Propiedades"
            value={metrics?.totalProperties ?? 0}
            subtitle={`+${metrics?.newPropertiesThisMonth ?? 0} este mes`}
            icon={Building2}
            trend="up"
            trendLabel={`${metrics?.newPropertiesThisMonth ?? 0} nuevas en 30 días`}
            accent
          />
          <StatCard
            title="Total Leads"
            value={metrics?.totalLeads ?? 0}
            subtitle={`+${metrics?.newLeadsThisWeek ?? 0} esta semana`}
            icon={Users}
            trend="up"
            trendLabel={`${metrics?.newLeadsThisWeek ?? 0} nuevos esta semana`}
          />
          <StatCard
            title="Leads Captados"
            value={metrics?.capturedLeads ?? 0}
            subtitle="Propietarios convertidos"
            icon={CheckCircle2}
            trend="up"
            trendLabel="Acuerdos cerrados"
          />
          <StatCard
            title="Tasa de Conversión"
            value={`${metrics?.conversionRate ?? 0}%`}
            subtitle="Leads → Captados"
            icon={Target}
            trend={
              (metrics?.conversionRate ?? 0) > 20
                ? "up"
                : (metrics?.conversionRate ?? 0) > 10
                ? "neutral"
                : "down"
            }
            trendLabel="Sobre total de leads"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolution Chart */}
        <Card className="lg:col-span-2 border-0 shadow-elegant">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Evolución de Captación</CardTitle>
            <CardDescription>Propiedades y leads por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradProp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.28 0.12 240)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="oklch(0.28 0.12 240)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.68 0.17 85)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="oklch(0.68 0.17 85)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "oklch(0.50 0.06 240)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "oklch(0.50 0.06 240)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid oklch(0.90 0.015 240)", fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="propiedades" name="Propiedades" stroke="oklch(0.28 0.12 240)" strokeWidth={2} fill="url(#gradProp)" />
                <Area type="monotone" dataKey="leads" name="Leads" stroke="oklch(0.68 0.17 85)" strokeWidth={2} fill="url(#gradLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Properties by Source */}
        <Card className="border-0 shadow-elegant">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Por Portal</CardTitle>
            <CardDescription>Distribución por fuente</CardDescription>
          </CardHeader>
          <CardContent>
            {propertiesBySource.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Sin datos aún</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Ejecuta tu primera captación</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={propertiesBySource}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {propertiesBySource.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "10px", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {propertiesBySource.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                        <span className="text-muted-foreground capitalize">{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties by Type */}
        <Card className="border-0 shadow-elegant">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Propiedades por Tipo</CardTitle>
            <CardDescription>Distribución de inmuebles captados</CardDescription>
          </CardHeader>
          <CardContent>
            {propertiesByType.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Building2 className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Sin propiedades aún</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={propertiesByType} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 240)" />
                  <XAxis dataKey="tipo" tick={{ fontSize: 11, fill: "oklch(0.50 0.06 240)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "oklch(0.50 0.06 240)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "10px", fontSize: 12 }} />
                  <Bar dataKey="cantidad" name="Cantidad" radius={[4, 4, 0, 0]} fill="oklch(0.28 0.12 240)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Properties by Status */}
        <Card className="border-0 shadow-elegant">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Estado de Propiedades</CardTitle>
            <CardDescription>Pipeline de captación actual</CardDescription>
          </CardHeader>
          <CardContent>
            {propertiesByStatus.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Sin datos de pipeline</p>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                {propertiesByStatus.map((item, i) => {
                  const total = propertiesByStatus.reduce((s, x) => s + x.value, 0);
                  const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                          <span className="text-muted-foreground capitalize">{item.name.replace("_", " ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.value}</span>
                          <span className="text-xs text-muted-foreground">({pct}%)</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: item.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      {(metrics?.recentJobs?.length ?? 0) > 0 && (
        <Card className="border-0 shadow-elegant">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Últimas Captaciones Automáticas</CardTitle>
                <CardDescription>Historial reciente del motor de scraping</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/scraping")} className="text-xs gap-1">
                Ver todo <ArrowUpRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.recentJobs?.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                      job.status === "completado" ? "bg-emerald-100" :
                      job.status === "error" ? "bg-red-100" :
                      "bg-amber-100"
                    }`}>
                      {job.status === "completado" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : job.status === "error" ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">Trabajo #{job.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-sm font-medium">{job.propertiesNew ?? 0} nuevas</p>
                      <p className="text-xs text-muted-foreground">{job.propertiesFound ?? 0} encontradas</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs capitalize ${
                        job.status === "completado" ? "bg-emerald-100 text-emerald-700" :
                        job.status === "error" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {job.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
