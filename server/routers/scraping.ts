import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getScrapingSources,
  getScrapingSourceById,
  createScrapingSource,
  updateScrapingSource,
  deleteScrapingSource,
  getScrapingJobs,
  createScrapingJob,
  updateScrapingJob,
  createProperty,
  createLead,
} from "../db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function extractPropertiesWithLLM(url: string, portal: string): Promise<any[]> {
  // Generate mock data using LLM to simulate scraping for demo purposes
  // In production, this would use a real scraping service + LLM for parsing
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Eres un extractor de datos inmobiliarios. Genera datos realistas de propiedades inmobiliarias en España para demostración de la plataforma. Responde SOLO con JSON válido.`,
      },
      {
        role: "user",
        content: `Genera entre 3 y 6 propiedades inmobiliarias realistas del portal "${portal}" con URL base "${url}". 
        Incluye variedad de tipos (pisos, casas, locales), precios realistas para España, y datos de contacto ficticios.
        
        Formato JSON requerido (array de objetos):
        [
          {
            "externalId": "ID único",
            "title": "Título del anuncio",
            "address": "Dirección completa",
            "city": "Ciudad",
            "district": "Barrio/Distrito",
            "postalCode": "Código postal",
            "province": "Provincia",
            "propertyType": "piso|casa|chalet|local|oficina|garaje|terreno|nave|otro",
            "operationType": "venta|alquiler",
            "price": "precio numérico como string",
            "squareMeters": "metros como string",
            "rooms": número,
            "bathrooms": número,
            "floor": "planta",
            "hasElevator": boolean,
            "hasParking": boolean,
            "hasTerrace": boolean,
            "hasPool": boolean,
            "energyCertificate": "A|B|C|D|E|F|G",
            "yearBuilt": año,
            "condition": "nueva_construccion|buen_estado|a_reformar|reformado",
            "description": "Descripción detallada del inmueble",
            "ownerName": "Nombre del propietario o agencia",
            "ownerPhone": "Teléfono ficticio",
            "ownerEmail": "email ficticio",
            "ownerType": "particular|agencia|promotora",
            "sourceUrl": "URL ficticia del anuncio"
          }
        ]`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "properties_list",
        strict: true,
        schema: {
          type: "object",
          properties: {
            properties: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  externalId: { type: "string" },
                  title: { type: "string" },
                  address: { type: "string" },
                  city: { type: "string" },
                  district: { type: "string" },
                  postalCode: { type: "string" },
                  province: { type: "string" },
                  propertyType: { type: "string" },
                  operationType: { type: "string" },
                  price: { type: "string" },
                  squareMeters: { type: "string" },
                  rooms: { type: "number" },
                  bathrooms: { type: "number" },
                  floor: { type: "string" },
                  hasElevator: { type: "boolean" },
                  hasParking: { type: "boolean" },
                  hasTerrace: { type: "boolean" },
                  hasPool: { type: "boolean" },
                  energyCertificate: { type: "string" },
                  yearBuilt: { type: "number" },
                  condition: { type: "string" },
                  description: { type: "string" },
                  ownerName: { type: "string" },
                  ownerPhone: { type: "string" },
                  ownerEmail: { type: "string" },
                  ownerType: { type: "string" },
                  sourceUrl: { type: "string" },
                },
                required: ["externalId", "title", "address", "city", "propertyType", "operationType", "price", "squareMeters", "rooms", "bathrooms", "description", "ownerName", "ownerPhone", "ownerEmail", "ownerType", "sourceUrl"],
                additionalProperties: false,
              },
            },
          },
          required: ["properties"],
          additionalProperties: false,
        },
      },
    },
  });

  try {
    const rawContent = response.choices[0]?.message?.content;
    const content = typeof rawContent === 'string' ? rawContent : null;
    if (!content) return [];
    const parsed = JSON.parse(content);
    return parsed.properties ?? [];
  } catch {
    return [];
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const scrapingRouter = router({
  // Sources
  listSources: protectedProcedure.query(async () => {
    return getScrapingSources();
  }),

  sourceById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const source = await getScrapingSourceById(input.id);
    if (!source) throw new TRPCError({ code: "NOT_FOUND", message: "Fuente no encontrada" });
    return source;
  }),

  createSource: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        portal: z.enum(["zonaprop", "argenprop", "mercadolibre", "properati", "remax", "navent", "otro"]),
        baseUrl: z.string().url("URL inválida"),
        searchParams: z.record(z.string(), z.any()).optional(),
        scheduleInterval: z.number().min(15).max(1440).default(60),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await createScrapingSource({
        ...input,
        searchParams: input.searchParams as any,
        createdByAgentId: ctx.user.id,
      });
      return { success: true };
    }),

  updateSource: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          baseUrl: z.string().optional(),
          searchParams: z.record(z.string(), z.any()).optional(),
          scheduleInterval: z.number().optional(),
          isActive: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      await updateScrapingSource(input.id, input.data as any);
      return { success: true };
    }),

  deleteSource: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Solo los administradores pueden eliminar fuentes" });
      }
      await deleteScrapingSource(input.id);
      return { success: true };
    }),

  // Jobs
  listJobs: protectedProcedure
    .input(z.object({ sourceId: z.number().optional() }))
    .query(async ({ input }) => {
      return getScrapingJobs(input.sourceId);
    }),

  // Execute scraping
  runScraping: protectedProcedure
    .input(z.object({ sourceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const source = await getScrapingSourceById(input.sourceId);
      if (!source) throw new TRPCError({ code: "NOT_FOUND", message: "Fuente no encontrada" });
      if (!source.isActive) throw new TRPCError({ code: "BAD_REQUEST", message: "La fuente está inactiva" });

      // Create job record
      const jobResult = await createScrapingJob({
        sourceId: source.id,
        status: "en_proceso",
        startedAt: new Date(),
        triggeredByAgentId: ctx.user.id,
      });

      const jobId = (jobResult as any).insertId as number;

      try {
        // Extract properties using LLM
        const extractedProperties = await extractPropertiesWithLLM(source.baseUrl, source.portal);

        let newCount = 0;
        for (const prop of extractedProperties) {
          try {
            await createProperty({
              ...prop,
              sourcePortal: source.portal,
              assignedAgentId: ctx.user.id,
              status: "nuevo",
            });

            // Also create a lead for each property with owner info
            if (prop.ownerName) {
              await createLead({
                ownerName: prop.ownerName,
                ownerPhone: prop.ownerPhone,
                ownerEmail: prop.ownerEmail,
                ownerType: prop.ownerType as any,
                status: "nuevo",
                priority: "media",
                source: source.portal,
                assignedAgentId: ctx.user.id,
              });
            }
            newCount++;
          } catch {
            // Skip duplicates
          }
        }

        // Update job as completed
        await updateScrapingJob(jobId, {
          status: "completado",
          propertiesFound: extractedProperties.length,
          propertiesNew: newCount,
          propertiesDuplicated: extractedProperties.length - newCount,
          completedAt: new Date(),
        });

        // Update source last run
        await updateScrapingSource(source.id, {
          lastRunAt: new Date(),
          nextRunAt: new Date(Date.now() + (source.scheduleInterval ?? 60) * 60 * 1000),
        });

        // Notify owner
        await notifyOwner({
          title: `✅ Scraping completado: ${source.name}`,
          content: `Se han captado ${newCount} nuevas propiedades desde ${source.portal}.\nTotal encontradas: ${extractedProperties.length}`,
        });

        return {
          success: true,
          jobId,
          propertiesFound: extractedProperties.length,
          propertiesNew: newCount,
        };
      } catch (error: any) {
        await updateScrapingJob(jobId, {
          status: "error",
          errorMessage: error?.message ?? "Error desconocido",
          completedAt: new Date(),
        });
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `Error en scraping: ${error?.message}` });
      }
    }),
});
