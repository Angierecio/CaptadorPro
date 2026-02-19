import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getAllAgents, updateAgent, getDashboardMetrics, getDb } from "../db";
import { TRPCError } from "@trpc/server";
import { users, properties, leads } from "../../drizzle/schema";
import { eq, count, and } from "drizzle-orm";

export const agentsRouter = router({
  list: protectedProcedure.query(async () => {
    const db = await getDb();
    const agentList = await getAllAgents();
    if (!db || !agentList.length) return agentList.map(a => ({ ...a, propertiesCount: 0, leadsCount: 0, capturedCount: 0 }));

    // Enrich with counts
    const enriched = await Promise.all(agentList.map(async (agent) => {
      const [propCount] = await db.select({ count: count() }).from(properties).where(eq(properties.assignedAgentId, agent.id));
      const [leadCount] = await db.select({ count: count() }).from(leads).where(eq(leads.assignedAgentId, agent.id));
      const [capturedCount] = await db.select({ count: count() }).from(leads).where(and(eq(leads.assignedAgentId, agent.id), eq(leads.status, "captado")));
      return {
        ...agent,
        propertiesCount: propCount?.count ?? 0,
        leadsCount: leadCount?.count ?? 0,
        capturedCount: capturedCount?.count ?? 0,
      };
    }));
    return enriched;
  }),

  updateRole: protectedProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Solo los administradores pueden cambiar roles" });
      }
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No puedes cambiar tu propio rol" });
      }
      await updateAgent(input.userId, { role: input.role });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          phone: z.string().optional(),
          agency: z.string().optional(),
          isActive: z.boolean().optional(),
          role: z.enum(["user", "admin"]).optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.id !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "No tienes permisos para modificar este agente" });
      }
      if (input.data.role && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Solo los administradores pueden cambiar roles" });
      }
      await updateAgent(input.id, input.data as any);
      return { success: true };
    }),

  metrics: protectedProcedure.query(async () => {
    return getDashboardMetrics();
  }),
});
