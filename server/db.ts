import { and, desc, eq, gte, ilike, like, lte, or, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { type InferInsertModel } from "drizzle-orm";
import pg from "pg";
const { Pool } = pg;

import {
  users,
  properties,
  leads,
  interactions,
  scrapingSources,
  scrapingJobs,
  propertyAssignments,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

// --- TIPOS ---
export type InsertUser = InferInsertModel<typeof users>;
export type InsertProperty = InferInsertModel<typeof properties>;
export type InsertLead = InferInsertModel<typeof leads>;
export type InsertInteraction = InferInsertModel<typeof interactions>;
export type InsertScrapingSource = InferInsertModel<typeof scrapingSources>;
export type InsertScrapingJob = InferInsertModel<typeof scrapingJobs>;
export type InsertPropertyAssignment = InferInsertModel<typeof propertyAssignments>;

let _db: any = null;

export async function getDb() {
  if (!_db && ENV.databaseUrl) {
    try {
      const pool = new Pool({ connectionString: ENV.databaseUrl });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── USERS ────────────────────────────────────────────────────────────────────

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

  await db.insert(users)
    .values(values)
    .onConflictDoUpdate({ 
      target: users.openId, 
      set: updateSet 
    });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
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

// ─── PROPERTIES ───────────────────────────────────────────────────────────────

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
    conditions.push(or(
      like(properties.title, `%${filters.search}%`),
      like(properties.address, `%${filters.search}%`),
      like(properties.city, `%${filters.search}%`)
    ));
  }
  if (filters.city) conditions.push(like(properties.city, `%${filters.city}%`));
  if (filters.status) conditions.push(eq(properties.status, filters.status as any));
  if (filters.assignedAgentId) conditions.push(eq(properties.assignedAgentId, filters.assignedAgentId));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const items = await db.select().from(properties).where(where).limit(filters.limit ?? 20).offset(filters.offset ?? 0).orderBy(desc(properties.createdAt));
  const totalResult = await db.select({ count: count() }).from(properties).where(where);
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
  return db.insert(properties).values(data);
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

// ─── LEADS ────────────────────────────────────────────────────────────────────

export async function getLeads(filters: any = {}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };
  const items = await db.select().from(leads).limit(filters.limit ?? 20).orderBy(desc(leads.createdAt));
  const totalResult = await db.select({ count: count() }).from(leads);
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

// ─── SCRAPING ────────────────────────────────────────────────────────────────

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

// ─── INTERACTIONS & DASHBOARD ────────────────────────────────────────────────

export async function getInteractionsByLead(leadId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(interactions).where(eq(interactions.leadId, leadId));
}

export async function createInteraction(data: InsertInteraction) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  return db.insert(interactions).values(data);
}

export async function getDashboardMetrics() {
  const db = await getDb();
  if (!db) return null;
  const [totalProperties, totalLeads, recentJobs] = await Promise.all([
    db.select({ count: count() }).from(properties),
    db.select({ count: count() }).from(leads),
    db.select().from(scrapingJobs).orderBy(desc(scrapingJobs.createdAt)).limit(5),
  ]);
  return {
    totalProperties: totalProperties[0]?.count ?? 0,
    totalLeads: totalLeads[0]?.count ?? 0,
    recentJobs: recentJobs || []
  };
}