import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
} from "../db";
import { TRPCError } from "@trpc/server";

const propertyFiltersSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  propertyType: z.string().optional(),
  operationType: z.string().optional(),
  status: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minRooms: z.number().optional(),
  sourcePortal: z.string().optional(),
  assignedAgentId: z.number().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const propertiesRouter = router({
  list: protectedProcedure.input(propertyFiltersSchema).query(async ({ input }) => {
    return getProperties(input);
  }),

  byId: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const property = await getPropertyById(input.id);
    if (!property) throw new TRPCError({ code: "NOT_FOUND", message: "Propiedad no encontrada" });
    return property;
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        district: z.string().optional(),
        postalCode: z.string().optional(),
        province: z.string().optional(),
        propertyType: z
          .enum(["piso", "casa", "chalet", "local", "oficina", "garaje", "terreno", "nave", "otro"])
          .optional(),
        operationType: z.enum(["venta", "alquiler", "alquiler_vacacional"]).optional(),
        status: z
          .enum(["nuevo", "contactado", "en_negociacion", "captado", "descartado", "vendido"])
          .optional(),
        price: z.string().optional(),
        squareMeters: z.string().optional(),
        rooms: z.number().optional(),
        bathrooms: z.number().optional(),
        floor: z.string().optional(),
        hasElevator: z.boolean().optional(),
        hasParking: z.boolean().optional(),
        hasTerrace: z.boolean().optional(),
        hasPool: z.boolean().optional(),
        hasGarden: z.boolean().optional(),
        hasAirConditioning: z.boolean().optional(),
        energyCertificate: z.string().optional(),
        yearBuilt: z.number().optional(),
        condition: z.enum(["nueva_construccion", "buen_estado", "a_reformar", "reformado"]).optional(),
        description: z.string().optional(),
        ownerName: z.string().optional(),
        ownerPhone: z.string().optional(),
        ownerEmail: z.string().optional(),
        ownerType: z.enum(["particular", "agencia", "promotora", "banco"]).optional(),
        sourcePortal: z.string().optional(),
        sourceUrl: z.string().optional(),
        externalId: z.string().optional(),
        assignedAgentId: z.number().optional(),
        images: z.array(z.string()).optional(),
        features: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createProperty({
        ...input,
        price: input.price,
        squareMeters: input.squareMeters,
        images: input.images as any,
        features: input.features as any,
        assignedAgentId: input.assignedAgentId ?? ctx.user.id,
      });
      return { success: true };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          address: z.string().optional(),
          city: z.string().optional(),
          district: z.string().optional(),
          postalCode: z.string().optional(),
          province: z.string().optional(),
          propertyType: z
            .enum(["piso", "casa", "chalet", "local", "oficina", "garaje", "terreno", "nave", "otro"])
            .optional(),
          operationType: z.enum(["venta", "alquiler", "alquiler_vacacional"]).optional(),
          status: z
            .enum(["nuevo", "contactado", "en_negociacion", "captado", "descartado", "vendido"])
            .optional(),
          price: z.string().optional(),
          squareMeters: z.string().optional(),
          rooms: z.number().optional(),
          bathrooms: z.number().optional(),
          floor: z.string().optional(),
          hasElevator: z.boolean().optional(),
          hasParking: z.boolean().optional(),
          hasTerrace: z.boolean().optional(),
          hasPool: z.boolean().optional(),
          hasGarden: z.boolean().optional(),
          hasAirConditioning: z.boolean().optional(),
          energyCertificate: z.string().optional(),
          yearBuilt: z.number().optional(),
          condition: z.enum(["nueva_construccion", "buen_estado", "a_reformar", "reformado"]).optional(),
          description: z.string().optional(),
          ownerName: z.string().optional(),
          ownerPhone: z.string().optional(),
          ownerEmail: z.string().optional(),
          ownerType: z.enum(["particular", "agencia", "promotora", "banco"]).optional(),
          assignedAgentId: z.number().optional(),
          status2: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      await updateProperty(input.id, input.data as any);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Solo los administradores pueden eliminar propiedades" });
      }
      await deleteProperty(input.id);
      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["nuevo", "contactado", "en_negociacion", "captado", "descartado", "vendido"]),
      })
    )
    .mutation(async ({ input }) => {
      await updateProperty(input.id, { status: input.status });
      return { success: true };
    }),
});
