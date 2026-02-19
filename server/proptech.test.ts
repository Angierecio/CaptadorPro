import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB ──────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  getAllAgents: vi.fn().mockResolvedValue([]),
  updateAgent: vi.fn().mockResolvedValue(undefined),
  getDashboardMetrics: vi.fn().mockResolvedValue({
    totalProperties: 0,
    totalLeads: 0,
    newPropertiesThisMonth: 0,
    newLeadsThisWeek: 0,
    capturedLeads: 0,
    conversionRate: 0,
    propertiesBySource: [],
    propertiesByStatus: [],
    propertiesByType: [],
    recentJobs: [],
  }),
  getProperties: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  getPropertyById: vi.fn().mockResolvedValue(null),
  createProperty: vi.fn().mockResolvedValue({ id: 1 }),
  updatePropertyStatus: vi.fn().mockResolvedValue(undefined),
  getLeads: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  getLeadById: vi.fn().mockResolvedValue(null),
  createLead: vi.fn().mockResolvedValue({ id: 1 }),
  updateLead: vi.fn().mockResolvedValue(undefined),
  getInteractionsByLeadId: vi.fn().mockResolvedValue([]),
  createInteraction: vi.fn().mockResolvedValue({ id: 1 }),
  getScrapingSources: vi.fn().mockResolvedValue([]),
  createScrapingSource: vi.fn().mockResolvedValue({ id: 1 }),
  updateScrapingSource: vi.fn().mockResolvedValue(undefined),
  deleteScrapingSource: vi.fn().mockResolvedValue(undefined),
  getScrapingJobs: vi.fn().mockResolvedValue([]),
  createScrapingJob: vi.fn().mockResolvedValue({ id: 1 }),
  updateScrapingJob: vi.fn().mockResolvedValue(undefined),
}));

// ─── Mock LLM ─────────────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({ properties: [] }) } }],
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeCtx(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test Agent",
      email: "test@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ─── Auth Tests ───────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns the current user when authenticated", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toMatchObject({ id: 1, name: "Test Agent" });
  });

  it("returns null when not authenticated", async () => {
    const ctx = { ...makeCtx(), user: null };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

// ─── Dashboard Metrics Tests ──────────────────────────────────────────────────
describe("agents.metrics", () => {
  it("returns dashboard metrics for authenticated user", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agents.metrics();
    expect(result).toMatchObject({
      totalProperties: expect.any(Number),
      totalLeads: expect.any(Number),
      conversionRate: expect.any(Number),
    });
  });
});

// ─── Properties Tests ─────────────────────────────────────────────────────────
describe("properties.list", () => {
  it("returns empty list when no properties exist", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.properties.list({});
    expect(result).toMatchObject({ items: [], total: 0 });
  });
});

describe("properties.create", () => {
  it("creates a property with required fields", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.properties.create({
      propertyType: "piso",
      operationType: "venta",
    });
    expect(result).toMatchObject({ success: true });
  });
});

// ─── Leads Tests ──────────────────────────────────────────────────────────────
describe("leads.list", () => {
  it("returns empty list when no leads exist", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.leads.list({});
    expect(result).toMatchObject({ items: [], total: 0 });
  });
});

describe("leads.create", () => {
  it("creates a lead with owner name", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.leads.create({ ownerName: "Juan García" });
    expect(result).toMatchObject({ success: true });
  });
});

// ─── Agents Tests ─────────────────────────────────────────────────────────────
describe("agents.list", () => {
  it("returns list of agents", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agents.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("agents.updateRole", () => {
  it("throws FORBIDDEN when non-admin tries to change role", async () => {
    const ctx = makeCtx("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.agents.updateRole({ userId: 2, role: "admin" })
    ).rejects.toThrow("Solo los administradores");
  });

  it("throws BAD_REQUEST when admin tries to change own role", async () => {
    const ctx = makeCtx("admin");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.agents.updateRole({ userId: 1, role: "user" })
    ).rejects.toThrow("No puedes cambiar tu propio rol");
  });
});

// ─── Scraping Sources Tests ───────────────────────────────────────────────────
describe("scraping.listSources", () => {
  it("returns empty list when no sources configured", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.scraping.listSources();
    expect(Array.isArray(result)).toBe(true);
  });
});
