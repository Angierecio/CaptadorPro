import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { notifyOwner } from "./notification";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      // Detectar si el usuario es nuevo antes del upsert
      const existingUser = await db.getUserByOpenId(userInfo.openId);
      const isNewUser = !existingUser;

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Notificar al admin si es un usuario nuevo
      if (isNewUser) {
        const userName = userInfo.name || "Sin nombre";
        const userEmail = userInfo.email || "Sin email";
        const loginMethod = userInfo.loginMethod ?? userInfo.platform ?? "desconocido";
        const now = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
        notifyOwner({
          title: `🏠 Nuevo cliente registrado en CaptadorPro`,
          content: `Un nuevo agente se ha registrado en CaptadorPro.\n\n👤 Nombre: ${userName}\n📧 Email: ${userEmail}\n🔑 Método de acceso: ${loginMethod}\n🕐 Fecha y hora: ${now}\n\nPuedes verlo en el módulo de Agentes de tu plataforma.`,
        }).catch(() => {/* silenciar errores de notificación */});
      }

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
