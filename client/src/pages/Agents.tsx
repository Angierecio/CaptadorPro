import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users, Building2, UserCheck, Shield, User,
  Calendar, Mail, TrendingUp, Crown,
} from "lucide-react";
import { toast } from "sonner";

function AgentCard({ agent, isCurrentUser, onRoleChange }: {
  agent: any;
  isCurrentUser: boolean;
  onRoleChange: (role: "user" | "admin") => void;
}) {
  const initials = agent.name
    ? agent.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AG";

  return (
    <Card className="border-0 shadow-elegant hover:shadow-elegant-lg transition-all">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 shrink-0" style={{ borderColor: agent.role === "admin" ? "oklch(0.68 0.17 85)" : "oklch(0.85 0.02 240)" }}>
            <AvatarFallback
              className="text-sm font-semibold"
              style={{
                background: agent.role === "admin" ? "oklch(0.22 0.10 240)" : "oklch(0.95 0.015 240)",
                color: agent.role === "admin" ? "oklch(0.98 0.005 240)" : "oklch(0.28 0.12 240)",
              }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm">{agent.name ?? "Sin nombre"}</h3>
              {isCurrentUser && (
                <Badge variant="outline" className="text-xs">Tú</Badge>
              )}
              {agent.role === "admin" ? (
                <Badge className="text-xs gap-1" style={{ background: "oklch(0.68 0.17 85)", color: "oklch(0.15 0.06 240)" }}>
                  <Crown className="h-3 w-3" />
                  Admin
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs gap-1">
                  <User className="h-3 w-3" />
                  Agente
                </Badge>
              )}
            </div>
            {agent.email && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{agent.email}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Miembro desde {new Date(agent.createdAt).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border/60">
          <div className="text-center">
            <p className="text-lg font-serif font-semibold" style={{ color: "oklch(0.28 0.12 240)" }}>
              {agent.propertiesCount ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Propiedades</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-serif font-semibold" style={{ color: "oklch(0.28 0.12 240)" }}>
              {agent.leadsCount ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Leads</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-serif font-semibold" style={{ color: "oklch(0.28 0.12 240)" }}>
              {agent.capturedCount ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Captados</p>
          </div>
        </div>

        {/* Role change (admin only, not self) */}
        {!isCurrentUser && (
          <div className="mt-4 pt-3 border-t border-border/60">
            <Select
              value={agent.role}
              onValueChange={v => onRoleChange(v as "user" | "admin")}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Agente</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Agents() {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data: agents, isLoading } = trpc.agents.list.useQuery();

  const updateRoleMutation = trpc.agents.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Rol actualizado correctamente");
      utils.agents.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const isAdmin = user?.role === "admin";

  const totalProperties = agents?.reduce((s, a) => s + (a.propertiesCount ?? 0), 0) ?? 0;
  const totalLeads = agents?.reduce((s, a) => s + (a.leadsCount ?? 0), 0) ?? 0;
  const totalCaptured = agents?.reduce((s, a) => s + (a.capturedCount ?? 0), 0) ?? 0;

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Equipo de Agentes</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los miembros de tu equipo y sus permisos
          </p>
        </div>
        {!isAdmin && (
          <Badge variant="secondary" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Solo administradores pueden gestionar roles
          </Badge>
        )}
      </div>

      {/* Team Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-elegant" style={{ background: "linear-gradient(135deg, oklch(0.22 0.10 240) 0%, oklch(0.29 0.13 240) 100%)" }}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.98 0.005 240 / 0.15)" }}>
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-3xl font-serif font-semibold text-white">{agents?.length ?? 0}</p>
              <p className="text-sm text-white/70">Agentes activos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.95 0.015 240)" }}>
              <Building2 className="h-6 w-6" style={{ color: "oklch(0.28 0.12 240)" }} />
            </div>
            <div>
              <p className="text-3xl font-serif font-semibold">{totalProperties}</p>
              <p className="text-sm text-muted-foreground">Propiedades totales</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ background: "oklch(0.95 0.015 240)" }}>
              <TrendingUp className="h-6 w-6" style={{ color: "oklch(0.68 0.17 85)" }} />
            </div>
            <div>
              <p className="text-3xl font-serif font-semibold">{totalCaptured}</p>
              <p className="text-sm text-muted-foreground">Captaciones exitosas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-elegant">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !agents || agents.length === 0 ? (
        <Card className="border-0 shadow-elegant">
          <CardContent className="py-20 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Sin agentes registrados</h3>
            <p className="text-sm text-muted-foreground">
              Los agentes aparecerán aquí cuando inicien sesión en la plataforma.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isCurrentUser={agent.openId === user?.openId}
              onRoleChange={(role) => {
                if (!isAdmin) {
                  toast.error("Solo los administradores pueden cambiar roles");
                  return;
                }
                updateRoleMutation.mutate({ userId: agent.id, role });
              }}
            />
          ))}
        </div>
      )}

      {/* Permissions info */}
      <Card className="border-0 shadow-elegant">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Permisos por Rol
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="gap-1" style={{ background: "oklch(0.68 0.17 85)", color: "oklch(0.15 0.06 240)" }}>
                  <Crown className="h-3 w-3" />
                  Administrador
                </Badge>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><UserCheck className="h-3.5 w-3.5 text-emerald-500" />Gestionar todos los agentes y roles</li>
                <li className="flex items-center gap-2"><UserCheck className="h-3.5 w-3.5 text-emerald-500" />Ver y gestionar todas las propiedades</li>
                <li className="flex items-center gap-2"><UserCheck className="h-3.5 w-3.5 text-emerald-500" />Acceso completo al CRM y leads</li>
                <li className="flex items-center gap-2"><UserCheck className="h-3.5 w-3.5 text-emerald-500" />Configurar fuentes de scraping</li>
                <li className="flex items-center gap-2"><UserCheck className="h-3.5 w-3.5 text-emerald-500" />Ver métricas globales del equipo</li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="gap-1">
                  <User className="h-3 w-3" />
                  Agente
                </Badge>
              </div>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><UserCheck className="h-3.5 w-3.5 text-emerald-500" />Gestionar sus propias propiedades</li>
                <li className="flex items-center gap-2"><UserCheck className="h-3.5 w-3.5 text-emerald-500" />Gestionar sus propios leads</li>
                <li className="flex items-center gap-2"><UserCheck className="h-3.5 w-3.5 text-emerald-500" />Ejecutar captaciones automáticas</li>
                <li className="flex items-center gap-2"><UserCheck className="h-3.5 w-3.5 text-emerald-500" />Ver dashboard con sus métricas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
