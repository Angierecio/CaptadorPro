import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { propertiesRouter } from "./routers/properties";
import { leadsRouter } from "./routers/leads";
import { scrapingRouter } from "./routers/scraping";
import { agentsRouter } from "./routers/agents";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  properties: propertiesRouter,
  leads: leadsRouter,
  scraping: scrapingRouter,
  agents: agentsRouter,
});

export type AppRouter = typeof appRouter;
