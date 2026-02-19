import { and, desc, eq, gte, ilike, like, lte, or, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  InsertProperty,
  InsertLead,
  InsertInteraction,
  InsertScrapingSource,
  InsertScrapingJob,
  InsertPropertyAssignment,
  users,
  properties,
  leads,
  interactions,
  scrapingSources,
  scrapingJobs,
  propertyAssignments,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getAllAgents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.isActive, true)).orderBy(desc(users.createdAt));
}

export async function updateAgent(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

// ─── Properties ───────────────────────────────────────────────────────────────

export interface PropertyFilters {
  search?: string;
  city?: string;
  propertyType?: string;
  operationType?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  sourcePortal?: string;
  assignedAgentId?: number;
  limit?: number;
  offset?: number;
}

export async function getProperties(filters: PropertyFilters = {}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [];

  if (filters.search) {
    conditions.push(
      or(
        like(properties.title, `%${filters.search}%`),
        like(properties.address, `%${filters.search}%`),
        like(properties.city, `%${filters.search}%`),
        like(properties.ownerName, `%${filters.search}%`)
      )
    );
  }
  if (filters.city) conditions.push(like(properties.city, `%${filters.city}%`));
  if (filters.propertyType) conditions.push(eq(properties.propertyType, filters.propertyType as any));
  if (filters.operationType) conditions.push(eq(properties.operationType, filters.operationType as any));
  if (filters.status) conditions.push(eq(properties.status, filters.status as any));
  if (filters.sourcePortal) conditions.push(eq(properties.sourcePortal, filters.sourcePortal));
  if (filters.assignedAgentId) conditions.push(eq(properties.assignedAgentId, filters.assignedAgentId));
  if (filters.minPrice) conditions.push(gte(properties.price, String(filters.minPrice)));
  if (filters.maxPrice) conditions.push(lte(properties.price, String(filters.maxPrice)));
  if (filters.minRooms) conditions.push(gte(properties.rooms, filters.minRooms));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const [items, totalResult] = await Promise.all([
    db.select().from(properties).where(where).orderBy(desc(properties.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(properties).where(where),
  ]);

  return { items, total: totalResult[0]?.count ?? 0 };
}

export async function getPropertyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  return result[0];
}

export async function createProperty(data: InsertProperty) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(properties).values(data);
  return result;
}

export async function updateProperty(id: number, data: Partial<InsertProperty>) {
  const db = await getDb();
  if (!db) return;
  await db.update(properties).set(data).where(eq(properties.id, id));
}

export async function deleteProperty(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(properties).where(eq(properties.id, id));
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export interface LeadFilters {
  search?: string;
  status?: string;
  priority?: string;
  assignedAgentId?: number;
  limit?: number;
  offset?: number;
}

export async function getLeads(filters: LeadFilters = {}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [];

  if (filters.search) {
    conditions.push(
      or(
        like(leads.ownerName, `%${filters.search}%`),
        like(leads.ownerPhone, `%${filters.search}%`),
        like(leads.ownerEmail, `%${filters.search}%`)
      )
    );
  }
  if (filters.status) conditions.push(eq(leads.status, filters.status as any));
  if (filters.priority) conditions.push(eq(leads.priority, filters.priority as any));
  if (filters.assignedAgentId) conditions.push(eq(leads.assignedAgentId, filters.assignedAgentId));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const [items, totalResult] = await Promise.all([
    db.select().from(leads).where(where).orderBy(desc(leads.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(leads).where(where),
  ]);

  return { items, total: totalResult[0]?.count ?? 0 };
}

export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result[0];
}

export async function createLead(data: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(leads).values(data);
}

export async function updateLead(id: number, data: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) return;
  await db.update(leads).set(data).where(eq(leads.id, id));
}

export async function deleteLead(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(leads).where(eq(leads.id, id));
}

// ─── Interactions ─────────────────────────────────────────────────────────────

export async function getInteractionsByLead(leadId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(interactions).where(eq(interactions.leadId, leadId)).orderBy(desc(interactions.createdAt));
}

export async function createInteraction(data: InsertInteraction) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(interactions).values(data);
}

// ─── Scraping Sources ─────────────────────────────────────────────────────────

export async function getScrapingSources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scrapingSources).orderBy(desc(scrapingSources.createdAt));
}

export async function getScrapingSourceById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(scrapingSources).where(eq(scrapingSources.id, id)).limit(1);
  return result[0];
}

export async function createScrapingSource(data: InsertScrapingSource) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(scrapingSources).values(data);
}

export async function updateScrapingSource(id: number, data: Partial<InsertScrapingSource>) {
  const db = await getDb();
  if (!db) return;
  await db.update(scrapingSources).set(data).where(eq(scrapingSources.id, id));
}

export async function deleteScrapingSource(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(scrapingSources).where(eq(scrapingSources.id, id));
}

// ─── Scraping Jobs ────────────────────────────────────────────────────────────

export async function getScrapingJobs(sourceId?: number) {
  const db = await getDb();
  if (!db) return [];
  const where = sourceId ? eq(scrapingJobs.sourceId, sourceId) : undefined;
  return db.select().from(scrapingJobs).where(where).orderBy(desc(scrapingJobs.createdAt)).limit(50);
}

export async function createScrapingJob(data: InsertScrapingJob) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(scrapingJobs).values(data);
}

export async function updateScrapingJob(id: number, data: Partial<InsertScrapingJob>) {
  const db = await getDb();
  if (!db) return;
  await db.update(scrapingJobs).set(data).where(eq(scrapingJobs.id, id));
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export async function getDashboardMetrics() {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalProperties,
    newPropertiesThisMonth,
    totalLeads,
    newLeadsThisWeek,
    capturedLeads,
    propertiesByStatus,
    propertiesBySource,
    propertiesByType,
    recentJobs,
  ] = await Promise.all([
    db.select({ count: count() }).from(properties),
    db.select({ count: count() }).from(properties).where(gte(properties.createdAt, thirtyDaysAgo)),
    db.select({ count: count() }).from(leads),
    db.select({ count: count() }).from(leads).where(gte(leads.createdAt, sevenDaysAgo)),
    db.select({ count: count() }).from(leads).where(eq(leads.status, "captado")),
    db
      .select({ status: properties.status, count: count() })
      .from(properties)
      .groupBy(properties.status),
    db
      .select({ portal: properties.sourcePortal, count: count() })
      .from(properties)
      .groupBy(properties.sourcePortal),
    db
      .select({ type: properties.propertyType, count: count() })
      .from(properties)
      .groupBy(properties.propertyType),
    db.select().from(scrapingJobs).orderBy(desc(scrapingJobs.createdAt)).limit(5),
  ]);

  const totalLeadsCount = totalLeads[0]?.count ?? 0;
  const capturedCount = capturedLeads[0]?.count ?? 0;
  const conversionRate = totalLeadsCount > 0 ? Math.round((capturedCount / totalLeadsCount) * 100) : 0;

  return {
    totalProperties: totalProperties[0]?.count ?? 0,
    newPropertiesThisMonth: newPropertiesThisMonth[0]?.count ?? 0,
    totalLeads: totalLeadsCount,
    newLeadsThisWeek: newLeadsThisWeek[0]?.count ?? 0,
    capturedLeads: capturedCount,
    conversionRate,
    propertiesByStatus,
    propertiesBySource,
    propertiesByType,
    recentJobs,
  };
}
