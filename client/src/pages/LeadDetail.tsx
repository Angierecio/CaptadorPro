import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Phone, Mail, User, Calendar, MessageSquare,
  Plus, CheckCircle2, XCircle, Clock, TrendingUp, AlertCircle,
  PhoneCall, Video, MapPin, FileText, MessageCircle,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  nuevo: { label: "Nuevo", class: "bg-blue-50 text-blue-700 border-blue-200" },
  contactado: { label: "Contactado", class: "bg-sky-50 text-sky-700 border-sky-200" },
  interesado: { label: "Interesado", class: "bg-violet-50 text-violet-700 border-violet-200" },
  en_negociacion: { label: "En negociación", class: "bg-amber-50 text-amber-700 border-amber-200" },
  captado: { label: "Captado", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  descartado: { label: "Descartado", class: "bg-gray-50 text-gray-500 border-gray-200" },
  perdido: { label: "Perdido", class: "bg-red-50 text-red-600 border-red-200" },
};

const INTERACTION_ICONS: Record<string, React.ElementType> = {
  llamada: PhoneCall,
  email: Mail,
  visita: MapPin,
  whatsapp: MessageCircle,
  reunion: Video,
  nota: FileText,
  otro: MessageSquare,
};

const OUTCOME_CONFIG: Record<string, { label: string; class: string }> = {
  positivo: { label: "Positivo", class: "text-emerald-600" },
  neutral: { label: "Neutral", class: "text-blue-600" },
  negativo: { label: "Negativo", class: "text-red-600" },
  sin_respuesta: { label: "Sin respuesta", class: "text-gray-500" },
};

function AddInteractionDialog({ leadId, onSuccess }: { leadId: number; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "nota" as const,
    subject: "",
    content: "",
    outcome: "neutral" as const,
    nextAction: "",
  });

  const createMutation = trpc.leads.addInteraction.useMutation({
    onSuccess: () => {
      toast.success("Interacción registrada");
      setOpen(false);
      setForm({ type: "nota", subject: "", content: "", outcome: "neutral", nextAction: "" });
      onSuccess();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2" style={{ background: "oklch(0.22 0.10 240)" }}>
          <Plus className="h-3.5 w-3.5" />
          Registrar interacción
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Nueva Interacción</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => { e.preventDefault(); createMutation.mutate({ leadId, ...form }); }}
          className="space-y-4 mt-2"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="llamada">Llamada</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="visita">Visita</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="reunion">Reunión</SelectItem>
                  <SelectItem value="nota">Nota interna</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Resultado</Label>
              <Select value={form.outcome} onValueChange={v => setForm(f => ({ ...f, outcome: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="positivo">Positivo</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negativo">Negativo</SelectItem>
                  <SelectItem value="sin_respuesta">Sin respuesta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Asunto</Label>
              <Input placeholder="Resumen breve de la interacción" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Contenido *</Label>
              <Textarea required placeholder="Detalla lo que ocurrió en esta interacción..." value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Próxima acción</Label>
              <Input placeholder="¿Qué hay que hacer a continuación?" value={form.nextAction} onChange={e => setForm(f => ({ ...f, nextAction: e.target.value }))} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={createMutation.isPending} style={{ background: "oklch(0.22 0.10 240)" }}>
              {createMutation.isPending ? "Guardando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function LeadDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const id = parseInt(params.id ?? "0");

  const { data: lead, isLoading, refetch } = trpc.leads.byId.useQuery({ id }, { enabled: !!id });
  const { data: interactions, refetch: refetchInteractions } = trpc.leads.interactions.useQuery({ leadId: id }, { enabled: !!id });

  const updateLead = trpc.leads.update.useMutation({
    onSuccess: () => { toast.success("Lead actualizado"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <User className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Lead no encontrado</h3>
        <Button variant="outline" onClick={() => setLocation("/leads")}>Volver al CRM</Button>
      </div>
    );
  }

  const status = STATUS_CONFIG[lead.status ?? "nuevo"] ?? STATUS_CONFIG.nuevo;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/leads")} className="mt-1 gap-1 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-serif font-semibold">{lead.ownerName}</h1>
            <Badge className={`border ${status.class}`}>{status.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 capitalize">
            {lead.ownerType} · Fuente: {lead.source ?? "Manual"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: Interactions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Interaction history */}
          <Card className="border-0 shadow-elegant">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Historial de Interacciones</CardTitle>
                <AddInteractionDialog leadId={id} onSuccess={() => refetchInteractions()} />
              </div>
            </CardHeader>
            <CardContent>
              {!interactions || interactions.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Sin interacciones registradas</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Registra tu primera llamada, email o visita</p>
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />
                  <div className="space-y-4">
                    {interactions.map((interaction: any) => {
                      const Icon = INTERACTION_ICONS[interaction.type] ?? MessageSquare;
                      const outcome = OUTCOME_CONFIG[interaction.outcome ?? "neutral"];
                      return (
                        <div key={interaction.id} className="flex gap-4 relative">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-background" style={{ background: "oklch(0.95 0.015 240)" }}>
                            <Icon className="h-4 w-4" style={{ color: "oklch(0.28 0.12 240)" }} />
                          </div>
                          <div className="flex-1 bg-muted/30 rounded-xl p-4 hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="text-sm font-medium capitalize">{interaction.type}</p>
                                {interaction.subject && (
                                  <p className="text-xs text-muted-foreground">{interaction.subject}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {outcome && (
                                  <span className={`text-xs font-medium ${outcome.class}`}>{outcome.label}</span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {new Date(interaction.createdAt).toLocaleDateString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">{interaction.content}</p>
                            {interaction.nextAction && (
                              <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1.5 text-xs text-amber-600">
                                <Clock className="h-3 w-3" />
                                <span>Próxima acción: {interaction.nextAction}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {lead.notes && (
            <Card className="border-0 shadow-elegant">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <Card className="border-0 shadow-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Estado del lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={lead.status ?? "nuevo"}
                onValueChange={v => updateLead.mutate({ id, data: { status: v as any } })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={lead.priority ?? "media"}
                onValueChange={v => updateLead.mutate({ id, data: { priority: v as any } })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baja">Prioridad Baja</SelectItem>
                  <SelectItem value="media">Prioridad Media</SelectItem>
                  <SelectItem value="alta">Prioridad Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-0 shadow-elegant">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Datos de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0" style={{ background: "oklch(0.95 0.015 240)", color: "oklch(0.28 0.12 240)" }}>
                  {lead.ownerName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{lead.ownerName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{lead.ownerType}</p>
                </div>
              </div>
              {lead.ownerPhone && (
                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                  <a href={`tel:${lead.ownerPhone}`}>
                    <Phone className="h-3.5 w-3.5" />
                    {lead.ownerPhone}
                  </a>
                </Button>
              )}
              {lead.ownerEmail && (
                <Button variant="outline" size="sm" className="w-full gap-2" asChild>
                  <a href={`mailto:${lead.ownerEmail}`}>
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{lead.ownerEmail}</span>
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Creado: {new Date(lead.createdAt).toLocaleDateString("es-ES")}</span>
              </div>
              {lead.nextContactDate && (
                <div className="flex items-center gap-2 text-xs text-amber-600 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Próximo contacto: {new Date(lead.nextContactDate).toLocaleDateString("es-ES")}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{interactions?.length ?? 0} interacciones registradas</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
