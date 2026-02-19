import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  getInteractionsByLead,
  createInteraction,
} from "../db";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";

const leadFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedAgentId: z.number().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const leadsRouter = router({
  list: protectedProcedure.input(leadFiltersSchema).query(async ({ input }) => {
    return getLeads(input);
  }),

  byId: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const lead = await getLeadById(input.id);
    if (!lead) throw new TRPCError({ code: "NOT_FOUND", message: "Lead no encontrado" });
    return lead;
  }),

  create: protectedProcedure
    .input(
      z.object({
        propertyId: z.number().optional(),
        ownerName: z.string().min(1, "El nombre es requerido"),
        ownerPhone: z.string().optional(),
        ownerEmail: z.string().email().optional().or(z.literal("")),
        ownerType: z.enum(["particular", "agencia", "promotora", "banco"]).default("particular"),
        status: z
          .enum(["nuevo", "contactado", "interesado", "en_negociacion", "captado", "descartado", "perdido"])
          .default("nuevo"),
        priority: z.enum(["baja", "media", "alta", "urgente"]).default("media"),
        source: z.string().optional(),
        notes: z.string().optional(),
        assignedAgentId: z.number().optional(),
        nextContactDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createLead({
        ...input,
        ownerEmail: input.ownerEmail || undefined,
        assignedAgentId: input.assignedAgentId ?? ctx.user.id,
      });

      // Notify owner about new important lead
      if (input.priority === "urgente" || input.priority === "alta") {
        await notifyOwner({
          title: `🔔 Nuevo lead ${input.priority}: ${input.ownerName}`,
          content: `Se ha captado un nuevo lead de prioridad ${input.priority}.\nPropietario: ${input.ownerName}\nTeléfono: ${input.ownerPhone ?? "N/A"}\nFuente: ${input.source ?? "Manual"}`,
        });
      }

      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          ownerName: z.string().optional(),
          ownerPhone: z.string().optional(),
          ownerEmail: z.string().optional(),
          ownerType: z.enum(["particular", "agencia", "promotora", "banco"]).optional(),
          status: z
            .enum(["nuevo", "contactado", "interesado", "en_negociacion", "captado", "descartado", "perdido"])
            .optional(),
          priority: z.enum(["baja", "media", "alta", "urgente"]).optional(),
          source: z.string().optional(),
          notes: z.string().optional(),
          assignedAgentId: z.number().optional(),
          nextContactDate: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      await updateLead(input.id, input.data as any);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Solo los administradores pueden eliminar leads" });
      }
      await deleteLead(input.id);
      return { success: true };
    }),

  // ─── Interactions ───────────────────────────────────────────────────────────

  interactions: protectedProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      return getInteractionsByLead(input.leadId);
    }),

  addInteraction: protectedProcedure
    .input(
      z.object({
        leadId: z.number(),
        propertyId: z.number().optional(),
        type: z
          .enum(["llamada", "email", "visita", "whatsapp", "reunion", "nota", "otro"])
          .default("nota"),
        subject: z.string().optional(),
        content: z.string().min(1, "El contenido es requerido"),
        outcome: z.enum(["positivo", "neutral", "negativo", "sin_respuesta"]).optional(),
        nextAction: z.string().optional(),
        nextActionDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createInteraction({
        ...input,
        agentId: ctx.user.id,
      });
      return { success: true };
    }),
});
