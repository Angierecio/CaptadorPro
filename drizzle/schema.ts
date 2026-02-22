import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

// ─── Users / Agents ───────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  phone: varchar("phone", { length: 32 }),
  agency: varchar("agency", { length: 128 }),
  avatarUrl: text("avatarUrl"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Properties ───────────────────────────────────────────────────────────────

export const properties = mysqlTable("properties", {
  id: int("id").autoincrement().primaryKey(),
  // Identification
  externalId: varchar("externalId", { length: 128 }),
  sourcePortal: varchar("sourcePortal", { length: 64 }),
  sourceUrl: text("sourceUrl"),
  // Location
  address: text("address"),
  city: varchar("city", { length: 128 }),
  district: varchar("district", { length: 128 }),
  postalCode: varchar("postalCode", { length: 16 }),
  province: varchar("province", { length: 64 }),
  country: varchar("country", { length: 64 }).default("España"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  // Type & Status
  propertyType: mysqlEnum("propertyType", [
    "piso",
    "casa",
    "chalet",
    "local",
    "oficina",
    "garaje",
    "terreno",
    "nave",
    "otro",
  ]).default("piso"),
  operationType: mysqlEnum("operationType", ["venta", "alquiler", "alquiler_vacacional"]).default("venta"),
  status: mysqlEnum("status", [
    "nuevo",
    "contactado",
    "en_negociacion",
    "captado",
    "descartado",
    "vendido",
  ]).default("nuevo"),
  // Pricing
  price: decimal("price", { precision: 12, scale: 2 }),
  pricePerSqm: decimal("pricePerSqm", { precision: 10, scale: 2 }),
  // Features
  squareMeters: decimal("squareMeters", { precision: 8, scale: 2 }),
  squareMetersUseful: decimal("squareMetersUseful", { precision: 8, scale: 2 }),
  rooms: int("rooms"),
  bathrooms: int("bathrooms"),
  floor: varchar("floor", { length: 16 }),
  hasElevator: boolean("hasElevator").default(false),
  hasParking: boolean("hasParking").default(false),
  hasGarden: boolean("hasGarden").default(false),
  hasTerrace: boolean("hasTerrace").default(false),
  hasPool: boolean("hasPool").default(false),
  hasAirConditioning: boolean("hasAirConditioning").default(false),
  energyCertificate: varchar("energyCertificate", { length: 4 }),
  yearBuilt: int("yearBuilt"),
  condition: mysqlEnum("condition", ["nueva_construccion", "buen_estado", "a_reformar", "reformado"]),
  // Description
  title: text("title"),
  description: text("description"),
  features: json("features"),
  images: json("images"),
  // Owner / Contact
  ownerName: varchar("ownerName", { length: 128 }),
  ownerPhone: varchar("ownerPhone", { length: 32 }),
  ownerEmail: varchar("ownerEmail", { length: 320 }),
  ownerType: mysqlEnum("ownerType", ["particular", "agencia", "promotora", "banco"]).default("particular"),
  // Assignment
  assignedAgentId: int("assignedAgentId"),
  // Metadata
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

// ─── Leads ────────────────────────────────────────────────────────────────────

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId"),
  // Contact info
  ownerName: varchar("ownerName", { length: 128 }).notNull(),
  ownerPhone: varchar("ownerPhone", { length: 32 }),
  ownerEmail: varchar("ownerEmail", { length: 320 }),
  ownerType: mysqlEnum("ownerType", ["particular", "agencia", "promotora", "banco"]).default("particular"),
  // Lead details
  status: mysqlEnum("status", [
    "nuevo",
    "contactado",
    "interesado",
    "en_negociacion",
    "captado",
    "descartado",
    "perdido",
  ]).default("nuevo"),
  priority: mysqlEnum("priority", ["baja", "media", "alta", "urgente"]).default("media"),
  source: varchar("source", { length: 64 }),
  notes: text("notes"),
  // Assignment
  assignedAgentId: int("assignedAgentId"),
  // Dates
  nextContactDate: timestamp("nextContactDate"),
  capturedAt: timestamp("capturedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ─── Interactions (CRM history) ───────────────────────────────────────────────

export const interactions = mysqlTable("interactions", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  propertyId: int("propertyId"),
  agentId: int("agentId").notNull(),
  type: mysqlEnum("type", [
    "llamada",
    "email",
    "visita",
    "whatsapp",
    "reunion",
    "nota",
    "otro",
  ]).default("nota"),
  subject: varchar("subject", { length: 256 }),
  content: text("content").notNull(),
  outcome: mysqlEnum("outcome", [
    "positivo",
    "neutral",
    "negativo",
    "sin_respuesta",
  ]),
  nextAction: text("nextAction"),
  nextActionDate: timestamp("nextActionDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = typeof interactions.$inferInsert;

// ─── Scraping Sources ─────────────────────────────────────────────────────────

export const scrapingSources = mysqlTable("scraping_sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  portal: mysqlEnum("portal", [
    "zonaprop",
    "argenprop",
    "mercadolibre",
    "properati",
    "remax",
    "navent",
    "otro",
  ]).notNull(),
  baseUrl: text("baseUrl").notNull(),
  searchParams: json("searchParams"),
  isActive: boolean("isActive").default(true).notNull(),
  scheduleInterval: int("scheduleInterval").default(60),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  createdByAgentId: int("createdByAgentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScrapingSource = typeof scrapingSources.$inferSelect;
export type InsertScrapingSource = typeof scrapingSources.$inferInsert;

// ─── Scraping Jobs ────────────────────────────────────────────────────────────

export const scrapingJobs = mysqlTable("scraping_jobs", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId").notNull(),
  status: mysqlEnum("status", [
    "pendiente",
    "en_proceso",
    "completado",
    "error",
  ]).default("pendiente"),
  propertiesFound: int("propertiesFound").default(0),
  propertiesNew: int("propertiesNew").default(0),
  propertiesDuplicated: int("propertiesDuplicated").default(0),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  triggeredByAgentId: int("triggeredByAgentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScrapingJob = typeof scrapingJobs.$inferSelect;
export type InsertScrapingJob = typeof scrapingJobs.$inferInsert;

// ─── Property Assignments ─────────────────────────────────────────────────────

export const propertyAssignments = mysqlTable("property_assignments", {
  id: int("id").autoincrement().primaryKey(),
  propertyId: int("propertyId").notNull(),
  agentId: int("agentId").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  assignedByAgentId: int("assignedByAgentId"),
  notes: text("notes"),
});

export type PropertyAssignment = typeof propertyAssignments.$inferSelect;
export type InsertPropertyAssignment = typeof propertyAssignments.$inferInsert;
