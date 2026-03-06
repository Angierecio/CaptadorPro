import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  numeric,
  boolean,
  jsonb,
  pgEnum,
  integer, // He añadido este import
} from "drizzle-orm/pg-core";

// --- Enums ---
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const propertyTypeEnum = pgEnum("property_type", ["piso", "casa", "chalet", "local", "oficina", "garaje", "terreno", "nave", "otro"]);
export const operationTypeEnum = pgEnum("operation_type", ["venta", "alquiler", "alquiler_vacacional"]);
export const propertyStatusEnum = pgEnum("property_status", ["nuevo", "contactado", "en_negociacion", "captado", "descartado", "vendido"]);
export const conditionEnum = pgEnum("condition", ["nueva_construccion", "buen_estado", "a_reformar", "reformado"]);
export const ownerTypeEnum = pgEnum("owner_type", ["particular", "agencia", "promotora", "banco"]);
export const leadStatusEnum = pgEnum("lead_status", ["nuevo", "contactado", "interesado", "en_negociacion", "captado", "descartado", "perdido"]);
export const priorityEnum = pgEnum("priority", ["baja", "media", "alta", "urgente"]);
export const interactionTypeEnum = pgEnum("interaction_type", ["llamada", "email", "visita", "whatsapp", "reunion", "nota", "otro"]);
export const outcomeEnum = pgEnum("outcome", ["positivo", "neutral", "negativo", "sin_respuesta"]);
export const portalEnum = pgEnum("portal", ["zonaprop", "argenprop", "mercadolibre", "properati", "remax", "navent", "otro"]);
export const jobStatusEnum = pgEnum("job_status", ["pendiente", "en_proceso", "completado", "error"]);

// ─── Users / Agents ───────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  phone: varchar("phone", { length: 32 }),
  agency: varchar("agency", { length: 128 }),
  avatarUrl: text("avatarUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ─── Properties ───────────────────────────────────────────────────────────────
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  externalId: varchar("externalId", { length: 128 }),
  sourcePortal: varchar("sourcePortal", { length: 64 }),
  sourceUrl: text("sourceUrl"),
  address: text("address"),
  city: varchar("city", { length: 128 }),
  district: varchar("district", { length: 128 }),
  postalCode: varchar("postalCode", { length: 16 }),
  province: varchar("province", { length: 64 }),
  country: varchar("country", { length: 64 }).default("España"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  propertyType: propertyTypeEnum("propertyType").default("piso"),
  operationType: operationTypeEnum("operationType").default("venta"),
  status: propertyStatusEnum("status").default("nuevo"),
  price: numeric("price", { precision: 12, scale: 2 }),
  pricePerSqm: numeric("pricePerSqm", { precision: 10, scale: 2 }),
  squareMeters: numeric("squareMeters", { precision: 8, scale: 2 }),
  squareMetersUseful: numeric("squareMetersUseful", { precision: 8, scale: 2 }),
  rooms: integer("rooms"), // Corregido: integer en lugar de serial
  bathrooms: integer("bathrooms"), // Corregido: integer en lugar de serial
  floor: varchar("floor", { length: 16 }),
  hasElevator: boolean("hasElevator").default(false),
  hasParking: boolean("hasParking").default(false),
  hasGarden: boolean("hasGarden").default(false),
  hasTerrace: boolean("hasTerrace").default(false),
  hasPool: boolean("hasPool").default(false),
  hasAirConditioning: boolean("hasAirConditioning").default(false),
  energyCertificate: varchar("energyCertificate", { length: 4 }),
  yearBuilt: integer("yearBuilt"), // Corregido: integer en lugar de serial
  condition: conditionEnum("condition"),
  title: text("title"),
  description: text("description"),
  features: jsonb("features"),
  images: jsonb("images"),
  ownerName: varchar("ownerName", { length: 128 }),
  ownerPhone: varchar("ownerPhone", { length: 32 }),
  ownerEmail: varchar("ownerEmail", { length: 320 }),
  ownerType: ownerTypeEnum("ownerType").default("particular"),
  assignedAgentId: integer("assignedAgentId"), // Corregido: integer
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Leads ────────────────────────────────────────────────────────────────────
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  propertyId: integer("propertyId"), // Corregido: integer
  ownerName: varchar("ownerName", { length: 128 }).notNull(),
  ownerPhone: varchar("ownerPhone", { length: 32 }),
  ownerEmail: varchar("ownerEmail", { length: 320 }),
  ownerType: ownerTypeEnum("ownerType").default("particular"),
  status: leadStatusEnum("status").default("nuevo"),
  priority: priorityEnum("priority").default("media"),
  source: varchar("source", { length: 64 }),
  notes: text("notes"),
  assignedAgentId: integer("assignedAgentId"), // Corregido: integer
  nextContactDate: timestamp("nextContactDate"),
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Interactions ─────────────────────────────────────────────────────────────
export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  leadId: integer("leadId").notNull(), // Corregido: integer
  propertyId: integer("propertyId"), // Corregido: integer
  agentId: integer("agentId").notNull(), // Corregido: integer
  type: interactionTypeEnum("type").default("nota"),
  subject: varchar("subject", { length: 256 }),
  content: text("content").notNull(),
  outcome: outcomeEnum("outcome"),
  nextAction: text("nextAction"),
  nextActionDate: timestamp("nextActionDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Scraping Sources ─────────────────────────────────────────────────────────
export const scrapingSources = pgTable("scraping_sources", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  portal: portalEnum("portal").notNull(),
  baseUrl: text("baseUrl").notNull(),
  searchParams: jsonb("searchParams"),
  isActive: boolean("isActive").default(true).notNull(),
  scheduleInterval: integer("scheduleInterval").default(60), // Corregido: integer
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  createdByAgentId: integer("createdByAgentId"), // Corregido: integer
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

// ─── Scraping Jobs ────────────────────────────────────────────────────────────
export const scrapingJobs = pgTable("scraping_jobs", {
  id: serial("id").primaryKey(),
  sourceId: integer("sourceId").notNull(), // Corregido: integer
  status: jobStatusEnum("status").default("pendiente"),
  propertiesFound: integer("propertiesFound").default(0), // ¡Aquí estaba el error!
  propertiesNew: integer("propertiesNew").default(0), // Corregido
  propertiesDuplicated: integer("propertiesDuplicated").default(0), // Corregido
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  triggeredByAgentId: integer("triggeredByAgentId"), // Corregido
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Property Assignments ─────────────────────────────────────────────────────
export const propertyAssignments = pgTable("property_assignments", {
  id: serial("id").primaryKey(),
  propertyId: integer("propertyId").notNull(), // Corregido
  agentId: integer("agentId").notNull(), // Corregido
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  assignedByAgentId: integer("assignedByAgentId"), // Corregido
  notes: text("notes"),
});